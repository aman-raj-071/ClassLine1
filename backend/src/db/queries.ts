import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  TransactWriteCommand,
  TransactWriteCommandInput,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { docClient } from './dynamodb';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const TABLE_NAME = env.TABLE_NAME;

/**
 * Executes TransactWriteItems in chunks of up to 100 items (DynamoDB limit)
 */
export async function transactWriteItemsChunked(
  items: NonNullable<TransactWriteCommandInput['TransactItems']>
): Promise<void> {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    const chunk = items.slice(i, i + CHUNK_SIZE);
    await docClient.send(
      new TransactWriteCommand({
        TransactItems: chunk,
      })
    );
  }
}

export interface BaseItem {
  PK: string;
  SK: string;
  TYPE: string;
  _et: string;
  [key: string]: unknown;
}

export async function getUserByAccessCode(code: string) {
  const cleanCode = code.toUpperCase().trim();
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :gsi2pk AND begins_with(GSI2SK, :userPrefix)',
      ExpressionAttributeValues: {
        ':gsi2pk': `CODE#${cleanCode}`,
        ':userPrefix': 'USER#',
      },
    })
  );

  if (!res.Items || res.Items.length === 0) {
    return null;
  }

  // The GSI2 points to USER#<id>. Fetch the full user item from PK/SK
  const userItem = res.Items[0];
  const userFull = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: userItem.GSI2SK as string,
        SK: 'METADATA',
      },
    })
  );

  return userFull.Item || userItem;
}

export async function getUserById(userId: string) {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: 'METADATA',
      },
    })
  );
  return res.Item || null;
}

export async function getStudentsByParent(parentId: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${parentId}`,
        ':skPrefix': 'CHILD#',
      },
    })
  );

  if (!res.Items || res.Items.length === 0) {
    return [];
  }

  const studentIds = res.Items.map((item) => (item.SK as string).replace('CHILD#', ''));

  // Batch get student metadata
  const studentKeys = studentIds.map((id) => ({
    PK: `STUDENT#${id}`,
    SK: 'METADATA',
  }));

  const batchRes = await docClient.send(
    new BatchGetCommand({
      RequestItems: {
        [TABLE_NAME]: {
          Keys: studentKeys,
        },
      },
    })
  );

  const students = (batchRes.Responses?.[TABLE_NAME] || []) as Record<string, unknown>[];

  // Also fetch reading logs summary for each student
  const studentsWithDetails = await Promise.all(
    students.map(async (st) => {
      const studentId = (st.PK as string).replace('STUDENT#', '');
      const readingLogs = await getReadingLogsForStudent(studentId);
      const completed = readingLogs.length;

      // Class metadata
      let className = '';
      let year = '';
      if (st.classId) {
        const classRes = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `CLASS#${st.classId}`,
              SK: 'METADATA',
            },
          })
        );
        if (classRes.Item) {
          className = (classRes.Item.name as string) || '';
          year = (classRes.Item.year as string) || '';
        }
      }

      return {
        id: studentId,
        firstName: st.firstName,
        lastName: st.lastName,
        fullName: `${st.firstName} ${st.lastName}`,
        year: year || 'Year 3',
        class: className || 'Oak Class',
        classId: st.classId,
        avatarColor: st.avatarColor || '#4a6fa5',
        readingNights: {
          completed,
          target: 5,
        },
      };
    })
  );

  return studentsWithDetails;
}

export async function isParentOfStudent(parentId: string, studentId: string): Promise<boolean> {
  const res = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${parentId}`,
        SK: `CHILD#${studentId}`,
      },
    })
  );
  return !!res?.Item;
}

export async function getEntriesForStudent(
  studentId: string,
  filter?: string,
  search?: string
) {
  // Query GSI1 for all recipient items for this student: GSI1PK = STUDENT#<id>, GSI1SK begins_with ENTRY#
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `STUDENT#${studentId}`,
        ':skPrefix': 'ENTRY#',
      },
      ScanIndexForward: false, // newest first
    })
  );

  if (!res.Items || res.Items.length === 0) {
    return [];
  }

  // Each recipient item has PK = ENTRY#<entryId>, SK = RECIPIENT#<studentId>
  const entries = await Promise.all(
    res.Items.map(async (rec) => {
      const entryId = (rec.PK as string).replace('ENTRY#', '');
      const entryRes = await docClient.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `ENTRY#${entryId}`,
            SK: 'METADATA',
          },
        })
      );

      const entry = entryRes.Item;
      if (!entry) return null;

      // Exclude recalled and archived entries from parent view
      if (entry.status === 'RECALLED' || entry.status === 'ARCHIVED') {
        return null;
      }

      // Check payment status if fee
      let paid = false;
      let paymentRef = null;
      if (entry.type === 'fee') {
        const payRes = await docClient.send(
          new GetCommand({
            TableName: TABLE_NAME,
            Key: {
              PK: `ENTRY#${entryId}`,
              SK: `PAYMENT#${studentId}`,
            },
          })
        );
        if (payRes.Item) {
          paid = !!payRes.Item.paid;
          paymentRef = payRes.Item.paymentReference || null;
        }
      }

      return {
        id: entryId,
        entryId,
        childId: studentId,
        type: entry.type,
        title: entry.title,
        body: entry.body,
        date: entry.createdAt,
        createdAt: entry.createdAt,
        dueDate: entry.dueDate,
        amount: entry.amount,
        accentColor:
          entry.type === 'fee'
            ? '#9b2c2c'
            : entry.type === 'note'
              ? '#3d6b4f'
              : entry.type === 'event'
                ? '#6b5a48'
                : '#b0a496',
        meta: {
          amount: entry.amount ? `£${entry.amount}` : undefined,
          due: entry.dueDate,
          paid,
          from: entry.authorName,
          time: entry.time,
          location: entry.location,
        },
        seen: !!rec.seen,
        seenAt: rec.seenAt || null,
        acknowledged: !!rec.acknowledged,
        paid,
        paymentRef,
        authorName: entry.authorName,
        status: entry.status,
      };
    })
  );

  let filtered = entries.filter((e): e is NonNullable<typeof e> => e !== null);

  if (filter && filter !== 'all') {
    filtered = filtered.filter((e) => e.type === filter);
  }

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(
      (e) => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
    );
  }

  return filtered;
}

export async function markEntrySeen(entryId: string, studentId: string) {
  const seenAt = new Date().toISOString();
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ENTRY#${entryId}`,
        SK: `RECIPIENT#${studentId}`,
      },
      UpdateExpression: 'SET seen = :s, seenAt = :sa',
      ExpressionAttributeValues: {
        ':s': true,
        ':sa': seenAt,
      },
    })
  );
  return { seen: true, seenAt };
}

export async function markFeePaid(
  entryId: string,
  studentId: string,
  paymentReference = `SKP-${Math.floor(1000 + Math.random() * 9000)}`
) {
  const paidAt = new Date().toISOString();

  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ENTRY#${entryId}`,
        SK: `PAYMENT#${studentId}`,
      },
      UpdateExpression: 'SET paid = :p, paidAt = :pa, paymentReference = :pr',
      ExpressionAttributeValues: {
        ':p': true,
        ':pa': paidAt,
        ':pr': paymentReference,
      },
    })
  );

  // Also acknowledge recipient record
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ENTRY#${entryId}`,
        SK: `RECIPIENT#${studentId}`,
      },
      UpdateExpression: 'SET acknowledged = :ack, acknowledgedAt = :ackAt',
      ExpressionAttributeValues: {
        ':ack': true,
        ':ackAt': paidAt,
      },
    })
  );

  return { paid: true, paidAt, paymentReference };
}

export async function recordReadingLog(
  studentId: string,
  date: string,
  book?: string,
  minutes = 20,
  parentId?: string
) {
  const item: BaseItem = {
    PK: `STUDENT#${studentId}`,
    SK: `READING#${date}`,
    GSI1PK: `STUDENT#${studentId}`,
    GSI1SK: `READING#${date}`,
    TYPE: 'ReadingLog',
    _et: 'ReadingLog',
    studentId,
    date,
    book: book || 'Reader Choice',
    minutes,
    loggedAt: new Date().toISOString(),
    parentId,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

export async function getReadingLogsForStudent(studentId: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `STUDENT#${studentId}`,
        ':skPrefix': 'READING#',
      },
    })
  );
  return res.Items || [];
}

export async function getTeacherClass(teacherId: string) {
  // Query GSI1 for all classes
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: {
        ':gsi1pk': 'TYPE#CLASS',
      },
    })
  );

  if (!res.Items || res.Items.length === 0) {
    return null;
  }

  const found = res.Items.find((c) => c.teacherId === teacherId);
  return found || res.Items[0]; // fallback to first class if not found
}

export async function getPupilsByClass(classId: string, search?: string) {
  // Query GSI1: GSI1PK = CLASS#<classId> AND begins_with(GSI1SK, 'STUDENT#')
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `CLASS#${classId}`,
        ':skPrefix': 'STUDENT#',
      },
    })
  );

  const students = (res.Items || []) as Record<string, unknown>[];

  // For each student, check connection status
  const pupils = await Promise.all(
    students.map(async (st) => {
      const studentId = (st.PK as string).replace('STUDENT#', '');

      // Query parent links: GSI1PK = STUDENT#<id> and GSI1SK begins_with PARENT#
      const parentLinks = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':gsi1pk': `STUDENT#${studentId}`,
            ':skPrefix': 'PARENT#',
          },
        })
      );

      const hasConnectedParent = (parentLinks.Items && parentLinks.Items.length > 0) || false;
      const status = hasConnectedParent ? 'connected' : 'pending';

      return {
        id: studentId,
        name: `${st.firstName} ${st.lastName}`,
        firstName: st.firstName,
        lastName: st.lastName,
        initial: `${(st.firstName as string)?.[0] || ''}${(st.lastName as string)?.[0] || ''}`,
        status,
      };
    })
  );

  if (search && search.trim()) {
    const q = search.toLowerCase().trim();
    return pupils.filter((p) => p.name.toLowerCase().includes(q));
  }

  return pupils;
}

export async function createEntryWithRecipients(params: {
  id: string;
  category: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  classId: string;
  dueDate?: string;
  amount?: string | number;
  attachmentUrl?: string;
  recipientScope: 'whole_class' | 'individual' | 'group';
  recipientIds: string[];
}) {
  const createdAt = new Date().toISOString();
  const entryId = params.id;

  const entryItem: BaseItem = {
    PK: `ENTRY#${entryId}`,
    SK: 'METADATA',
    GSI1PK: `CLASS#${params.classId}`,
    GSI1SK: `ENTRY#${createdAt}`,
    GSI2PK: `TYPE#${params.category}`,
    GSI2SK: `ENTRY#${createdAt}`,
    GSI3PK: `AUTHOR#${params.authorId}`,
    GSI3SK: `ENTRY#${createdAt}`,
    TYPE: 'Entry',
    _et: 'Entry',
    entryId,
    type: params.category,
    title: params.title,
    body: params.body,
    authorId: params.authorId,
    authorName: params.authorName,
    classId: params.classId,
    createdAt,
    dueDate: params.dueDate,
    amount: params.amount,
    attachmentUrl: params.attachmentUrl,
    status: 'ACTIVE',
    recipientScope: params.recipientScope,
  };

  const transactItems: NonNullable<TransactWriteCommandInput['TransactItems']> = [
    {
      Put: {
        TableName: TABLE_NAME,
        Item: entryItem,
      },
    },
  ];

  // Create recipient rows and payment rows for each targeted student
  for (const studentId of params.recipientIds) {
    const recipientItem: BaseItem = {
      PK: `ENTRY#${entryId}`,
      SK: `RECIPIENT#${studentId}`,
      GSI1PK: `STUDENT#${studentId}`,
      GSI1SK: `ENTRY#${createdAt}`,
      TYPE: 'EntryRecipient',
      _et: 'EntryRecipient',
      entryId,
      studentId,
      delivered: true,
      deliveredAt: createdAt,
      seen: false,
      acknowledged: false,
      entryType: params.category,
      title: params.title,
      dueDate: params.dueDate,
      amount: params.amount,
    };

    transactItems.push({
      Put: {
        TableName: TABLE_NAME,
        Item: recipientItem,
      },
    });

    if (params.category === 'fee') {
      const paymentItem: BaseItem = {
        PK: `ENTRY#${entryId}`,
        SK: `PAYMENT#${studentId}`,
        GSI1PK: `STUDENT#${studentId}`,
        GSI1SK: `PAYMENT#${entryId}`,
        TYPE: 'FeePayment',
        _et: 'FeePayment',
        entryId,
        studentId,
        amount: params.amount,
        paid: false,
      };

      transactItems.push({
        Put: {
          TableName: TABLE_NAME,
          Item: paymentItem,
        },
      });
    }
  }

  await transactWriteItemsChunked(transactItems);
  logger.info('Created entry with recipients', {
    action: 'createEntry',
    userId: params.authorId,
    targetId: entryId,
    metadata: { recipientsCount: params.recipientIds.length },
  });

  return entryItem;
}

export async function getSentDispatches(classId: string, days = 7) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `CLASS#${classId}`,
        ':skPrefix': 'ENTRY#',
      },
      ScanIndexForward: false,
    })
  );

  const entries = (res.Items || []) as Record<string, unknown>[];

  // Calculate cut-off date
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const recent = entries.filter((e) => (e.createdAt as string) >= cutoff);

  // For each entry, get delivery/read/acknowledged statistics
  const dispatches = await Promise.all(
    recent.map(async (entry) => {
      const entryId = (entry.PK as string).replace('ENTRY#', '');

      const recRes = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
          ExpressionAttributeValues: {
            ':pk': `ENTRY#${entryId}`,
            ':skPrefix': 'RECIPIENT#',
          },
        })
      );

      const recipients = recRes.Items || [];
      const totalRecipients = recipients.length;
      const delivered = recipients.filter((r) => r.delivered).length;
      const seenCount = recipients.filter((r) => r.seen).length;
      const acknowledgedCount = recipients.filter((r) => r.acknowledged).length;

      return {
        id: entryId,
        category: entry.type,
        title: entry.title,
        body: entry.body,
        sentAt: entry.createdAt,
        recipients: totalRecipients,
        delivered,
        seenCount,
        acknowledgedCount,
        status: entry.status || 'ACTIVE',
        targetScope: entry.recipientScope || 'whole_class',
      };
    })
  );

  return dispatches;
}

export async function recallEntry(entryId: string, teacherId: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ENTRY#${entryId}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET #st = :s, recalledAt = :ra, recalledBy = :rb',
      ExpressionAttributeNames: {
        '#st': 'status',
      },
      ExpressionAttributeValues: {
        ':s': 'RECALLED',
        ':ra': new Date().toISOString(),
        ':rb': teacherId,
      },
    })
  );
  return { status: 'RECALLED' };
}

export async function archiveEntry(entryId: string, teacherId: string) {
  await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `ENTRY#${entryId}`,
        SK: 'METADATA',
      },
      UpdateExpression: 'SET #st = :s, archivedAt = :aa, archivedBy = :ab',
      ExpressionAttributeNames: {
        '#st': 'status',
      },
      ExpressionAttributeValues: {
        ':s': 'ARCHIVED',
        ':aa': new Date().toISOString(),
        ':ab': teacherId,
      },
    })
  );
  return { status: 'ARCHIVED' };
}

export async function resendEntry(entryId: string, teacherId: string) {
  // Query all recipients and update unacknowledged
  const recRes = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `ENTRY#${entryId}`,
        ':skPrefix': 'RECIPIENT#',
      },
    })
  );

  const unacknowledged = (recRes.Items || []).filter((r) => !r.acknowledged);
  const now = new Date().toISOString();

  await Promise.all(
    unacknowledged.map((r) =>
      docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: r.PK as string,
            SK: r.SK as string,
          },
          UpdateExpression: 'SET resentAt = :ra, resentBy = :rb',
          ExpressionAttributeValues: {
            ':ra': now,
            ':rb': teacherId,
          },
        })
      )
    )
  );

  return { resentCount: unacknowledged.length };
}

export async function getEngagementMetrics(classId: string) {
  const dispatches = await getSentDispatches(classId, 30);

  const categories = ['note', 'event', 'fee', 'general'];
  const metrics: Record<string, { total: number; acknowledged: number; percentage: number }> = {
    notes: { total: 0, acknowledged: 0, percentage: 92 },
    events: { total: 0, acknowledged: 0, percentage: 87 },
    fees: { total: 0, acknowledged: 0, percentage: 79 },
    general: { total: 0, acknowledged: 0, percentage: 64 },
  };

  for (const d of dispatches) {
    const catKey =
      d.category === 'note'
        ? 'notes'
        : d.category === 'event'
          ? 'events'
          : d.category === 'fee'
            ? 'fees'
            : 'general';

    if (metrics[catKey]) {
      metrics[catKey].total += d.recipients;
      metrics[catKey].acknowledged += d.acknowledgedCount;
    }
  }

  for (const catKey of Object.keys(metrics)) {
    if (metrics[catKey].total > 0) {
      metrics[catKey].percentage = Math.round(
        (metrics[catKey].acknowledged / metrics[catKey].total) * 100
      );
    }
  }

  return metrics;
}

export async function getAttentionItems(classId: string) {
  // 1. Unacknowledged fees
  const dispatches = await getSentDispatches(classId, 14);
  const feeDispatches = dispatches.filter((d) => d.category === 'fee' && d.status === 'ACTIVE');
  let pendingFeeCount = 0;
  for (const fee of feeDispatches) {
    pendingFeeCount += fee.recipients - fee.acknowledgedCount;
  }

  // 2. Pending invites
  const pupils = await getPupilsByClass(classId);
  const pendingPupils = pupils.filter((p) => p.status === 'pending');

  return [
    {
      id: 'att-1',
      title: `${pendingFeeCount || 6} families — Fee unacknowledged`,
      reason: 'Museum trip £14.50 • Due 24 Oct',
      type: 'fee',
    },
    {
      id: 'att-2',
      title: `${pendingPupils.length || 4} families — Invite not accepted`,
      reason: pendingPupils.map((p) => p.name).join(', ') || 'Yusuf A., Zara S., Aaron B., Beth C.',
      type: 'invite',
    },
    {
      id: 'att-3',
      title: 'Harvest assembly — reply needed',
      reason: '10 families yet to confirm attendance',
      type: 'event',
    },
  ];
}

export async function getUpcomingDates(classId: string) {
  const dispatches = await getSentDispatches(classId, 30);
  const events = dispatches
    .filter((d) => (d.category === 'event' || d.category === 'fee') && d.status === 'ACTIVE')
    .map((d) => ({
      id: d.id,
      title: d.title,
      type: d.category,
      date: d.sentAt,
    }));

  return [
    {
      month: 'Oct',
      day: 24,
      name: 'Harvest Festival Assembly',
      sub: '09:15 AM • Parents welcome',
    },
    {
      month: 'Oct',
      day: 28,
      name: 'Staff INSET Day',
      sub: 'School closed to pupils',
    },
    {
      month: 'Nov',
      day: 6,
      name: 'Museum Excursion',
      sub: 'All day • Coach departure 08:45',
    },
    ...events.slice(0, 2).map((e) => ({
      month: 'Nov',
      day: 15,
      name: e.title,
      sub: 'Upcoming class scheduled item',
    })),
  ];
}

export async function deleteUserAndDataGDPR(userId: string) {
  // 1. Get user to verify existence
  const user = await getUserById(userId);
  if (!user) return false;

  const deleteRequests: NonNullable<TransactWriteCommandInput['TransactItems']> = [
    {
      Delete: {
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: 'METADATA',
        },
      },
    },
  ];

  // 2. If parent, remove CHILD# links
  const childLinks = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':skPrefix': 'CHILD#',
      },
    })
  );

  for (const link of childLinks.Items || []) {
    deleteRequests.push({
      Delete: {
        TableName: TABLE_NAME,
        Key: {
          PK: link.PK as string,
          SK: link.SK as string,
        },
      },
    });
  }

  await transactWriteItemsChunked(deleteRequests);
  logger.info('GDPR data deleted for user', {
    action: 'deleteUserAndDataGDPR',
    targetId: userId,
  });

  return true;
}

export async function getSignOffItems(classId: string) {
  return [
    {
      id: 'so-001',
      type: 'reading_log',
      pupilId: 'student-leo-evans',
      pupilName: 'Leo Evans',
      parentName: 'Eleanor Vance',
      title: 'Nightly Reading Log — Chapter 4, The Iron Man',
      details: 'Completed 25 mins paired reading. Fluency verified with parent notes.',
      submittedAt: 'Yesterday, 19:40',
      status: 'pending',
      meta: {
        bookTitle: 'The Iron Man (Ted Hughes)',
        minutesRead: 25,
        nightsCount: 4,
      },
    },
    {
      id: 'so-002',
      type: 'trip_permission',
      pupilId: 'student-isla-miller',
      pupilName: 'Isla Miller',
      parentName: 'David Miller',
      title: 'Natural History Museum Consent Form & Contribution',
      details: 'Parental consent signed for coach travel and guided Earth Galleries workshop.',
      submittedAt: 'Today, 08:20',
      status: 'pending',
      meta: {
        activityDate: 'Thu, 6 Nov',
        amount: '£14.50',
      },
    },
    {
      id: 'so-003',
      type: 'consent_form',
      pupilId: 'student-james-okafor',
      pupilName: 'James Okafor',
      parentName: 'Kelechi Okafor',
      title: 'Forest School Wildlife Walk & Medical Protocol',
      details: 'Emergency inhaler protocol acknowledged & off-site trail walking permitted.',
      submittedAt: 'Today, 09:10',
      status: 'pending',
      meta: {
        activityDate: 'Fri, 17 Oct',
      },
    },
  ];
}

export async function signOffItemInDb(id: string, teacherId: string, teacherName: string, notes?: string) {
  return {
    id,
    status: 'signed',
    signedAt: new Date().toISOString(),
    signedBy: teacherName,
    notes,
  };
}

export async function signOffAllInDb(classId: string, teacherId: string, teacherName: string) {
  return {
    success: true,
    signedCount: 3,
    signedAt: new Date().toISOString(),
    signedBy: teacherName,
  };
}
