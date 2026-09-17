import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import { app } from '../backend/src/app';

const ddbMock = mockClient(DynamoDBDocumentClient);

function makeTeacherToken(id = 'user-tch-001') {
  return 'mock-jwt-teacher-' + id;
}

function makeParentToken(id = 'user-par-001') {
  return 'mock-jwt-parent-' + id;
}

describe('Teacher API Routes', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('rejects parent from calling teacher endpoints with 403', async () => {
    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'GET',
        url: '/api/teacher/class',
        path: '/api/teacher/class',
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

    expect(res.statusCode).toBe(403);
  });

  it('GET /api/teacher/class returns class metrics and roster', async () => {
    ddbMock.on(QueryCommand, {
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':gsi1pk': 'TYPE#CLASS' },
    }).resolves({
      Items: [
        {
          PK: 'CLASS#class-y3-oak',
          SK: 'METADATA',
          name: 'Year 3 Oak Class',
          year: 'Year 3',
          teacherId: 'user-tch-001',
        },
      ],
    });

    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'STUDENT#student-leo-evans',
          SK: 'METADATA',
          firstName: 'Leo',
          lastName: 'Evans',
        },
      ],
    });

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'GET',
        url: '/api/teacher/class',
        path: '/api/teacher/class',
        headers: {
          authorization: `Bearer ${makeTeacherToken()}`,
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
    expect(res.body.class.name).toBe('Year 3 Oak Class');
    expect(res.body.metrics).toBeDefined();
    expect(res.body.pupils).toBeDefined();
  });

  it('POST /api/teacher/entries creates entry and recipients atomically', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });
    ddbMock.on(QueryCommand, {
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':gsi1pk': 'TYPE#CLASS' },
    }).resolves({
      Items: [
        {
          PK: 'CLASS#class-y3-oak',
          SK: 'METADATA',
          teacherId: 'user-tch-001',
        },
      ],
    });

    ddbMock.on(QueryCommand, {
      IndexName: 'GSI1',
      ExpressionAttributeValues: { ':gsi1pk': 'CLASS#class-y3-oak', ':skPrefix': 'STUDENT#' },
    }).resolves({
      Items: [
        { PK: 'STUDENT#student-leo-evans', firstName: 'Leo', lastName: 'Evans' },
        { PK: 'STUDENT#student-maya-evans', firstName: 'Maya', lastName: 'Evans' },
      ],
    });

    ddbMock.on(TransactWriteCommand).resolves({});

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/teacher/entries',
        path: '/api/teacher/entries',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${makeTeacherToken()}`,
        },
        body: {
          category: 'note',
          recipientScope: 'whole_class',
          title: 'Class Homework Notice',
          body: 'Maths worksheets sent home in book bags today. Please return by Tuesday.',
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
    expect(res.body.entry.title).toBe('Class Homework Notice');
    expect(res.body.recipientsCount).toBe(2);
  });

  it('POST /api/teacher/entries/:id/recall updates status to RECALLED', async () => {
    ddbMock.on(UpdateCommand).resolves({});

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/teacher/entries/entry-abc/recall',
        path: '/api/teacher/entries/entry-abc/recall',
        params: { id: 'entry-abc' },
        headers: {
          authorization: `Bearer ${makeTeacherToken()}`,
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
    expect(res.body.status).toBe('RECALLED');
  });

  it('GET /api/teacher/sign-offs returns pending and signed items', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'GET',
        url: '/api/teacher/sign-offs',
        path: '/api/teacher/sign-offs',
        headers: {
          authorization: `Bearer ${makeTeacherToken()}`,
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
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
    expect(typeof res.body.pendingCount).toBe('number');
  });

  it('POST /api/teacher/sign-offs/:id/sign marks item as signed', async () => {
    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/teacher/sign-offs/so-001/sign',
        path: '/api/teacher/sign-offs/so-001/sign',
        params: { id: 'so-001' },
        body: { notes: 'Splendid reading effort!' },
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${makeTeacherToken()}`,
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
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('signed');
    expect(res.body.id).toBe('so-001');
  });
});
