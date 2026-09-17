import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  BatchGetCommand,
} from '@aws-sdk/lib-dynamodb';
import { app } from '../backend/src/app';

const ddbMock = mockClient(DynamoDBDocumentClient);

function makeParentToken(id = 'user-par-001') {
  return 'mock-jwt-parent-' + id;
}

describe('Parent API Routes', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('GET /api/parent/children returns children linked to parent', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'USER#user-par-001',
          SK: 'CHILD#student-leo-evans',
        },
      ],
    });

    ddbMock.on(BatchGetCommand).resolves({
      Responses: {
        ClassLineTable: [
          {
            PK: 'STUDENT#student-leo-evans',
            SK: 'METADATA',
            firstName: 'Leo',
            lastName: 'Evans',
            classId: 'class-y3-oak',
          },
        ],
      },
    });

    ddbMock.on(GetCommand).resolves({
      Item: {
        PK: 'CLASS#class-y3-oak',
        SK: 'METADATA',
        name: 'Year 3 Oak Class',
        year: 'Year 3',
      },
    });

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'GET',
        url: '/api/parent/children',
        path: '/api/parent/children',
        headers: {
          authorization: `Bearer ${makeParentToken()}`,
        },
      };
      const mockRes: any = {
        statusCode: 200,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          resolve(this);
        },
        setHeader: vi.fn(),
      };
      (app as any).handle(mockReq, mockRes);
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.children).toHaveLength(1);
    expect(res.body.children[0].fullName).toBe('Leo Evans');
    expect(res.body.children[0].class).toBe('Year 3 Oak Class');
  });

  it('GET /api/parent/timeline rejects unauthorized parent with 403', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: undefined,
    });

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'GET',
        url: '/api/parent/timeline?childId=student-unlinked',
        path: '/api/parent/timeline',
        query: { childId: 'student-unlinked' },
        headers: {
          authorization: `Bearer ${makeParentToken('user-par-001')}`,
        },
      };
      const mockRes: any = {
        statusCode: 200,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          resolve(this);
        },
        setHeader: vi.fn(),
      };
      (app as any).handle(mockReq, mockRes);
    });

    expect(res.statusCode).toBe(403);
  });

  it('POST /api/parent/entries/:id/seen marks entry as seen', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: { PK: 'USER#user-par-001', SK: 'CHILD#student-leo-evans' },
    });
    ddbMock.on(UpdateCommand).resolves({});

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/parent/entries/entry-123/seen',
        path: '/api/parent/entries/entry-123/seen',
        params: { id: 'entry-123' },
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${makeParentToken()}`,
        },
        body: { childId: 'student-leo-evans' },
      };
      const mockRes: any = {
        statusCode: 200,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          resolve(this);
        },
        setHeader: vi.fn(),
      };
      (app as any).handle(mockReq, mockRes);
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.seen).toBe(true);
  });

  it('POST /api/parent/reading-log validates and persists reading session', async () => {
    ddbMock.on(GetCommand).resolves({
      Item: { PK: 'USER#user-par-001', SK: 'CHILD#student-leo-evans' },
    });
    ddbMock.on(PutCommand).resolves({});

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/parent/reading-log',
        path: '/api/parent/reading-log',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${makeParentToken()}`,
        },
        body: {
          childId: 'student-leo-evans',
          date: '2026-10-22',
          book: 'The Iron Man',
          minutes: 25,
        },
      };
      const mockRes: any = {
        statusCode: 200,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          resolve(this);
        },
        setHeader: vi.fn(),
      };
      (app as any).handle(mockReq, mockRes);
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.log.date).toBe('2026-10-22');
  });
});
