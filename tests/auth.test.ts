import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { app } from '../backend/src/app';

const ddbMock = mockClient(DynamoDBDocumentClient);
const cognitoMock = mockClient(CognitoIdentityProviderClient);

describe('Auth & Session API', () => {
  beforeEach(() => {
    ddbMock.reset();
    cognitoMock.reset();
  });

  it('rejects login with missing code or invalid code structure', async () => {
    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/auth/login',
        path: '/api/auth/login',
        headers: { 'content-type': 'application/json' },
        body: { code: 'SHORT' }, // < 6 chars
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

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('rejects unknown access code with 401', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/auth/login',
        path: '/api/auth/login',
        headers: { 'content-type': 'application/json' },
        body: { code: 'INVALID' },
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

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Code not recognised');
  });

  it('authenticates valid parent code and returns token with redirect', async () => {
    // Mock user lookup on GSI2
    ddbMock.on(QueryCommand).resolves({
      Items: [
        {
          PK: 'USER#user-par-001',
          SK: 'METADATA',
          GSI2PK: 'CODE#PAR001',
          GSI2SK: 'USER#user-par-001',
          name: 'Eleanor Vance',
          role: 'parent',
          email: 'e.vance@example.com',
          avatarInitials: 'EV',
          schoolId: 'oakridge-primary',
        },
      ],
    });

    ddbMock.on(GetCommand).resolves({
      Item: {
        PK: 'USER#user-par-001',
        SK: 'METADATA',
        name: 'Eleanor Vance',
        role: 'parent',
        email: 'e.vance@example.com',
        avatarInitials: 'EV',
        schoolId: 'oakridge-primary',
      },
    });

    const res = await new Promise<any>((resolve) => {
      const mockReq: any = {
        method: 'POST',
        url: '/api/auth/login',
        path: '/api/auth/login',
        headers: { 'content-type': 'application/json' },
        body: { code: 'PAR001' },
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
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Eleanor Vance');
    expect(res.body.user.role).toBe('parent');
    expect(res.body.redirectTo).toBe('/parent-timeline.html');
  });
});
