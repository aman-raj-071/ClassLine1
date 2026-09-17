import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import {
  getUserByAccessCode,
  isParentOfStudent,
  deleteUserAndDataGDPR,
  getEngagementMetrics,
  getAttentionItems,
} from '../backend/src/db/queries';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('DynamoDB Single-Table Patterns & GDPR', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('GSI2 access code lookup returns user profile', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'USER#user-par-001',
          SK: 'METADATA',
          GSI2PK: 'CODE#PAR001',
          GSI2SK: 'USER#user-par-001',
          name: 'Eleanor Vance',
          role: 'parent',
        },
      ],
    });

    ddbMock.on(GetCommand).resolves({
      Item: {
        PK: 'USER#user-par-001',
        SK: 'METADATA',
        name: 'Eleanor Vance',
        role: 'parent',
        schoolId: 'oakridge-primary',
      },
    });

    const user = await getUserByAccessCode('par001');
    expect(user).toBeDefined();
    expect(user?.name).toBe('Eleanor Vance');
    expect(user?.role).toBe('parent');
  });

  it('verifies parent-student relationship key pattern', async () => {
    ddbMock.on(GetCommand).resolves({});
    ddbMock.on(GetCommand, {
      Key: {
        PK: 'USER#user-par-001',
        SK: 'CHILD#student-leo-evans',
      },
    }).resolves({
      Item: {
        PK: 'USER#user-par-001',
        SK: 'CHILD#student-leo-evans',
        studentId: 'student-leo-evans',
      },
    });

    const isParent = await isParentOfStudent('user-par-001', 'student-leo-evans');
    expect(isParent).toBe(true);

    const isNotParent = await isParentOfStudent('user-par-001', 'student-unknown');
    expect(isNotParent).toBe(false);
  });

  it('calculates engagement metrics percentages', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'ENTRY#entry-1',
          type: 'note',
          createdAt: new Date().toISOString(),
        },
      ],
    });

    const metrics = await getEngagementMetrics('class-y3-oak');
    expect(metrics).toBeDefined();
    expect(metrics.notes).toBeDefined();
    expect(metrics.fees).toBeDefined();
  });

  it('fetches attention ledger items for teacher desk', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [],
    });

    const attention = await getAttentionItems('class-y3-oak');
    expect(attention).toBeInstanceOf(Array);
    expect(attention.length).toBeGreaterThan(0);
    expect(attention[0].title).toContain('Fee unacknowledged');
  });

  it('deletes user and associated parent-student links for GDPR compliance', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: { PK: 'USER#user-del', SK: 'METADATA' },
    });

    ddbMock.on(QueryCommand).resolves({
      Items: [
        { PK: 'USER#user-del', SK: 'CHILD#st-1' },
        { PK: 'USER#user-del', SK: 'CHILD#st-2' },
      ],
    });

    ddbMock.on(TransactWriteCommand).resolves({});

    const result = await deleteUserAndDataGDPR('user-del');
    expect(result).toBe(true);
  });
});
