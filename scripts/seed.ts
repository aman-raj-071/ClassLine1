import { PutCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../backend/src/db/dynamodb';
import { createCognitoUser } from '../backend/src/auth/cognito';
import { env } from '../backend/src/config/env';
import { logger } from '../backend/src/utils/logger';

const TABLE_NAME = env.TABLE_NAME;

const PUPIL_NAMES = [
  { first: 'Leo', last: 'Evans', id: 'student-leo-evans', color: '#4a6fa5' },
  { first: 'Maya', last: 'Evans', id: 'student-maya-evans', color: '#9b2c2c' },
  { first: 'James', last: 'O.', id: 'student-james-o', color: '#3d6b4f' },
  { first: 'Chloe', last: 'P.', id: 'student-chloe-p', color: '#854d0e' },
  { first: 'Yusuf', last: 'A.', id: 'student-yusuf-a', color: '#6b5a48' },
  { first: 'Zara', last: 'S.', id: 'student-zara-s', color: '#4a6fa5' },
  { first: 'Aaron', last: 'B.', id: 'student-aaron-b', color: '#2b6cb0' },
  { first: 'Beth', last: 'C.', id: 'student-beth-c', color: '#805ad5' },
  { first: 'Callum', last: 'D.', id: 'student-callum-d', color: '#d69e2e' },
  { first: 'Daisy', last: 'E.', id: 'student-daisy-e', color: '#dd6b20' },
  { first: 'Ethan', last: 'F.', id: 'student-ethan-f', color: '#e53e3e' },
  { first: 'Freya', last: 'G.', id: 'student-freya-g', color: '#319795' },
  { first: 'George', last: 'H.', id: 'student-george-h', color: '#3182ce' },
  { first: 'Hannah', last: 'I.', id: 'student-hannah-i', color: '#718096' },
  { first: 'Isaac', last: 'J.', id: 'student-isaac-j', color: '#4a5568' },
  { first: 'Jasmine', last: 'K.', id: 'student-jasmine-k', color: '#b83280' },
  { first: 'Kai', last: 'L.', id: 'student-kai-l', color: '#2c5282' },
  { first: 'Lila', last: 'M.', id: 'student-lila-m', color: '#97266d' },
  { first: 'Mason', last: 'N.', id: 'student-mason-n', color: '#285e61' },
  { first: 'Noah', last: 'O.', id: 'student-noah-o', color: '#744210' },
  { first: 'Olivia', last: 'P.', id: 'student-olivia-p', color: '#7b341e' },
  { first: 'Penny', last: 'Q.', id: 'student-penny-q', color: '#553c9a' },
  { first: 'Quinn', last: 'R.', id: 'student-quinn-r', color: '#1a365d' },
  { first: 'Ruby', last: 'S.', id: 'student-ruby-s', color: '#702459' },
  { first: 'Sam', last: 'T.', id: 'student-sam-t', color: '#1c4532' },
  { first: 'Tia', last: 'U.', id: 'student-tia-u', color: '#521b41' },
  { first: 'William', last: 'V.', id: 'student-william-v', color: '#234e52' },
  { first: 'Zac', last: 'W.', id: 'student-zac-w', color: '#1a202c' },
];

export async function seedDatabase() {
  console.log(`Starting ClassLine seed for table ${TABLE_NAME}...`);

  const schoolId = 'oakridge-primary';
  const classId = 'class-y3-oak';
  const teacherId = 'user-tch-001';

  // 1. Seed School
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `SCHOOL#${schoolId}`,
        SK: 'METADATA',
        GSI1PK: 'TYPE#SCHOOL',
        GSI1SK: 'Oakridge Primary School',
        TYPE: 'School',
        _et: 'School',
        name: 'Oakridge Primary School',
        urn: '102938',
        postcode: 'OX2 6NN',
        headteacher: 'Dr. Alistair Finch',
      },
    })
  );

  // 2. Seed Class
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `CLASS#${classId}`,
        SK: 'METADATA',
        GSI1PK: 'TYPE#CLASS',
        GSI1SK: 'Year 3 Oak Class',
        TYPE: 'Class',
        _et: 'Class',
        name: 'Year 3 Oak Class',
        year: 'Year 3',
        schoolId,
        teacherId,
      },
    })
  );

  // 3. Seed Teacher User
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${teacherId}`,
        SK: 'METADATA',
        GSI1PK: 'ROLE#teacher',
        GSI1SK: 'Mrs. Eleanor Reynolds',
        GSI2PK: 'CODE#TCH001',
        GSI2SK: `USER#${teacherId}`,
        TYPE: 'User',
        _et: 'User',
        name: 'Mrs. Eleanor Reynolds',
        email: 'e.reynolds@oakridgeprimary.sch.uk',
        role: 'teacher',
        schoolId,
        avatarInitials: 'ER',
        accessCode: 'TCH001',
      },
    })
  );

  // 4. Seed 3 Parents
  const parents = [
    {
      id: 'user-par-001',
      name: 'Eleanor Vance',
      email: 'e.vance@example.com',
      code: 'PAR001',
      initials: 'EV',
      children: ['student-leo-evans', 'student-maya-evans'],
    },
    {
      id: 'user-par-002',
      name: 'David O’Connor',
      email: 'david.o@example.com',
      code: 'PAR002',
      initials: 'DO',
      children: ['student-james-o'],
    },
    {
      id: 'user-par-003',
      name: 'Sarah Patel',
      email: 'sarah.p@example.com',
      code: 'PAR003',
      initials: 'SP',
      children: ['student-chloe-p'],
    },
  ];

  for (const p of parents) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `USER#${p.id}`,
          SK: 'METADATA',
          GSI1PK: 'ROLE#parent',
          GSI1SK: p.name,
          GSI2PK: `CODE#${p.code}`,
          GSI2SK: `USER#${p.id}`,
          TYPE: 'User',
          _et: 'User',
          name: p.name,
          email: p.email,
          role: 'parent',
          schoolId,
          avatarInitials: p.initials,
          accessCode: p.code,
        },
      })
    );

    // Parent <-> Student links
    for (const childId of p.children) {
      await docClient.send(
        new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: `USER#${p.id}`,
            SK: `CHILD#${childId}`,
            GSI1PK: `STUDENT#${childId}`,
            GSI1SK: `PARENT#${p.id}`,
            TYPE: 'ParentStudentLink',
            _et: 'ParentStudentLink',
            parentId: p.id,
            studentId: childId,
          },
        })
      );
    }
  }

  // 5. Seed 28 Students
  for (const st of PUPIL_NAMES) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `STUDENT#${st.id}`,
          SK: 'METADATA',
          GSI1PK: `CLASS#${classId}`,
          GSI1SK: `STUDENT#${st.last}#${st.first}`,
          TYPE: 'Student',
          _et: 'Student',
          firstName: st.first,
          lastName: st.last,
          classId,
          avatarColor: st.color,
        },
      })
    );
  }

  // 6. Seed Invitations for 4 pending parents
  const pendingStudents = ['student-yusuf-a', 'student-zara-s', 'student-aaron-b', 'student-beth-c'];
  for (const stId of pendingStudents) {
    const inviteCode = `INV-${stId.slice(-6).toUpperCase()}`;
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `INVITE#${inviteCode}`,
          SK: 'METADATA',
          GSI1PK: `STUDENT#${stId}`,
          GSI1SK: `INVITE#${inviteCode}`,
          GSI2PK: `EMAIL#parent.${stId}@example.com`,
          GSI2SK: `INVITE#${inviteCode}`,
          TYPE: 'Invitation',
          _et: 'Invitation',
          inviteCode,
          studentId: stId,
          status: 'PENDING',
          sentAt: new Date().toISOString(),
        },
      })
    );
  }

  // 7. Seed Sample Entries
  const now = new Date();
  const dateStr = now.toISOString();

  // Entry 1: Fee - Natural History Museum
  const feeEntryId = 'entry-museum-trip';
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ENTRY#${feeEntryId}`,
        SK: 'METADATA',
        GSI1PK: `CLASS#${classId}`,
        GSI1SK: `ENTRY#${dateStr}`,
        GSI2PK: 'TYPE#fee',
        GSI2SK: `ENTRY#${dateStr}`,
        GSI3PK: `AUTHOR#${teacherId}`,
        GSI3SK: `ENTRY#${dateStr}`,
        TYPE: 'Entry',
        _et: 'Entry',
        entryId: feeEntryId,
        type: 'fee',
        title: 'Natural History Museum Excursion',
        body: 'Coach transport and guided fossil workshop booking. Packed lunch required (nut-free). School waterproof jackets mandatory.',
        authorId: teacherId,
        authorName: 'Mrs. Eleanor Reynolds',
        classId,
        createdAt: dateStr,
        dueDate: '2026-10-24',
        amount: '14.50',
        status: 'ACTIVE',
        recipientScope: 'whole_class',
      },
    })
  );

  // Recipients and fee payments for Entry 1
  for (const st of PUPIL_NAMES) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ENTRY#${feeEntryId}`,
          SK: `RECIPIENT#${st.id}`,
          GSI1PK: `STUDENT#${st.id}`,
          GSI1SK: `ENTRY#${dateStr}`,
          TYPE: 'EntryRecipient',
          _et: 'EntryRecipient',
          entryId: feeEntryId,
          studentId: st.id,
          delivered: true,
          seen: st.id === 'student-leo-evans',
          acknowledged: false,
          entryType: 'fee',
          title: 'Natural History Museum Excursion',
          dueDate: '2026-10-24',
          amount: '14.50',
        },
      })
    );

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ENTRY#${feeEntryId}`,
          SK: `PAYMENT#${st.id}`,
          GSI1PK: `STUDENT#${st.id}`,
          GSI1SK: `PAYMENT#${feeEntryId}`,
          TYPE: 'FeePayment',
          _et: 'FeePayment',
          entryId: feeEntryId,
          studentId: st.id,
          amount: '14.50',
          paid: false,
        },
      })
    );
  }

  // Entry 2: Note - Guided Reading (Targeted to Leo Evans)
  const noteEntryId = 'entry-guided-reading-leo';
  const noteTime = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ENTRY#${noteEntryId}`,
        SK: 'METADATA',
        GSI1PK: `CLASS#${classId}`,
        GSI1SK: `ENTRY#${noteTime}`,
        GSI2PK: 'TYPE#note',
        GSI2SK: `ENTRY#${noteTime}`,
        GSI3PK: `AUTHOR#${teacherId}`,
        GSI3SK: `ENTRY#${noteTime}`,
        TYPE: 'Entry',
        _et: 'Entry',
        entryId: noteEntryId,
        type: 'note',
        title: 'Guided Reading Breakthrough: The Iron Man',
        body: 'Leo read Chapter 2 aloud with tremendous expression today! He tackled complex vocabulary like "monstrous" and "crags" with self-correction.',
        authorId: teacherId,
        authorName: 'Mrs. Eleanor Reynolds',
        classId,
        createdAt: noteTime,
        status: 'ACTIVE',
        recipientScope: 'individual',
      },
    })
  );

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ENTRY#${noteEntryId}`,
        SK: 'RECIPIENT#student-leo-evans',
        GSI1PK: 'STUDENT#student-leo-evans',
        GSI1SK: `ENTRY#${noteTime}`,
        TYPE: 'EntryRecipient',
        _et: 'EntryRecipient',
        entryId: noteEntryId,
        studentId: 'student-leo-evans',
        delivered: true,
        seen: true,
        seenAt: noteTime,
        acknowledged: true,
        entryType: 'note',
        title: 'Guided Reading Breakthrough: The Iron Man',
      },
    })
  );

  // Entry 3: Event - Harvest Festival Assembly
  const eventEntryId = 'entry-harvest-festival';
  const eventTime = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ENTRY#${eventEntryId}`,
        SK: 'METADATA',
        GSI1PK: `CLASS#${classId}`,
        GSI1SK: `ENTRY#${eventTime}`,
        GSI2PK: 'TYPE#event',
        GSI2SK: `ENTRY#${eventTime}`,
        GSI3PK: `AUTHOR#${teacherId}`,
        GSI3SK: `ENTRY#${eventTime}`,
        TYPE: 'Entry',
        _et: 'Entry',
        entryId: eventEntryId,
        type: 'event',
        title: 'Harvest Festival Assembly & Food Bank Donation',
        body: 'Parents are warmly invited to attend the Main Hall assembly at 09:15 AM. Please send non-perishable tinned goods with your child.',
        authorId: teacherId,
        authorName: 'Mrs. Eleanor Reynolds',
        classId,
        createdAt: eventTime,
        dueDate: '2026-10-24',
        time: '09:15 AM - 10:00 AM',
        location: 'Main School Hall',
        status: 'ACTIVE',
        recipientScope: 'whole_class',
      },
    })
  );

  for (const st of PUPIL_NAMES) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ENTRY#${eventEntryId}`,
          SK: `RECIPIENT#${st.id}`,
          GSI1PK: `STUDENT#${st.id}`,
          GSI1SK: `ENTRY#${eventTime}`,
          TYPE: 'EntryRecipient',
          _et: 'EntryRecipient',
          entryId: eventEntryId,
          studentId: st.id,
          delivered: true,
          seen: true,
          acknowledged: false,
          entryType: 'event',
          title: 'Harvest Festival Assembly & Food Bank Donation',
        },
      })
    );
  }

  // Entry 4: General - Wellies Reminder
  const genEntryId = 'entry-wellies-reminder';
  const genTime = new Date(now.getTime() - 48 * 3600 * 1000).toISOString();
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `ENTRY#${genEntryId}`,
        SK: 'METADATA',
        GSI1PK: `CLASS#${classId}`,
        GSI1SK: `ENTRY#${genTime}`,
        GSI2PK: 'TYPE#general',
        GSI2SK: `ENTRY#${genTime}`,
        GSI3PK: `AUTHOR#${teacherId}`,
        GSI3SK: `ENTRY#${genTime}`,
        TYPE: 'Entry',
        _et: 'Entry',
        entryId: genEntryId,
        type: 'general',
        title: 'Wet Weather Notice: Named Wellies Needed',
        body: 'With autumn rains, Forest School and meadow play require named wellington boots stored on classroom racks.',
        authorId: teacherId,
        authorName: 'Mrs. Eleanor Reynolds',
        classId,
        createdAt: genTime,
        status: 'ACTIVE',
        recipientScope: 'whole_class',
      },
    })
  );

  for (const st of PUPIL_NAMES) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `ENTRY#${genEntryId}`,
          SK: `RECIPIENT#${st.id}`,
          GSI1PK: `STUDENT#${st.id}`,
          GSI1SK: `ENTRY#${genTime}`,
          TYPE: 'EntryRecipient',
          _et: 'EntryRecipient',
          entryId: genEntryId,
          studentId: st.id,
          delivered: true,
          seen: true,
          acknowledged: true,
          entryType: 'general',
          title: 'Wet Weather Notice: Named Wellies Needed',
        },
      })
    );
  }

  // 8. Seed Reading Logs for Leo (4 out of 5 nights logged)
  const readingDates = ['2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21'];
  for (const d of readingDates) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: 'STUDENT#student-leo-evans',
          SK: `READING#${d}`,
          GSI1PK: 'STUDENT#student-leo-evans',
          GSI1SK: `READING#${d}`,
          TYPE: 'ReadingLog',
          _et: 'ReadingLog',
          studentId: 'student-leo-evans',
          date: d,
          book: 'The Iron Man by Ted Hughes',
          minutes: 20,
          loggedAt: new Date().toISOString(),
          parentId: 'user-par-001',
        },
      })
    );
  }

  console.log('ClassLine DynamoDB seed complete! 1 School, 1 Class, 4 Users, 28 Students, 4 Entries, 4 Reading Logs seeded.');

  // 9. Optional Cognito Seed (runs if user pool id is configured)
  if (env.COGNITO_USER_POOL_ID && !env.COGNITO_USER_POOL_ID.includes('mock')) {
    try {
      console.log('Seeding Cognito users...');
      await createCognitoUser({
        username: 'TCH001',
        email: 'e.reynolds@oakridgeprimary.sch.uk',
        name: 'Mrs. Eleanor Reynolds',
        role: 'teacher',
        schoolId,
        avatarInitials: 'ER',
        accessCode: 'TCH001',
      });

      for (const p of parents) {
        await createCognitoUser({
          username: p.code,
          email: p.email,
          name: p.name,
          role: 'parent',
          schoolId,
          avatarInitials: p.initials,
          accessCode: p.code,
        });
      }
      console.log('Cognito user seeding complete!');
    } catch (e) {
      console.warn('Cognito seeding skipped or deferred:', (e as Error).message);
    }
  }
}

// Allow direct CLI invocation: tsx scripts/seed.ts
if (process.argv[1]?.endsWith('seed.ts')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
