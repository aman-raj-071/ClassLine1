import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler as defineHandler } from '../backend/src/auth/triggers/defineAuthChallenge';
import { handler as createHandler } from '../backend/src/auth/triggers/createAuthChallenge';
import { handler as verifyHandler } from '../backend/src/auth/triggers/verifyAuthChallenge';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Cognito Custom Auth Lambda Triggers', () => {
  beforeEach(() => {
    ddbMock.reset();
  });

  it('DefineAuthChallenge: initiates CUSTOM_CHALLENGE on empty session', async () => {
    const event: any = {
      request: {
        session: [],
        userAttributes: { 'custom:accessCode': 'PAR001' },
      },
      response: {
        issueTokens: false,
        failAuthentication: false,
      },
    };

    const result = await defineHandler(event);
    expect(result.response.challengeName).toBe('CUSTOM_CHALLENGE');
    expect(result.response.issueTokens).toBe(false);
    expect(result.response.failAuthentication).toBe(false);
  });

  it('DefineAuthChallenge: issues tokens when challenge was answered correctly', async () => {
    const event: any = {
      request: {
        session: [
          {
            challengeName: 'CUSTOM_CHALLENGE',
            challengeResult: true,
          },
        ],
        userAttributes: { 'custom:accessCode': 'PAR001' },
      },
      response: {
        issueTokens: false,
        failAuthentication: false,
      },
    };

    const result = await defineHandler(event);
    expect(result.response.issueTokens).toBe(true);
    expect(result.response.failAuthentication).toBe(false);
  });

  it('CreateAuthChallenge: creates public prompt and private answer', async () => {
    const event: any = {
      request: {
        challengeName: 'CUSTOM_CHALLENGE',
        session: [],
        userAttributes: { 'custom:accessCode': 'TCH001' },
      },
      response: {},
    };

    const result = await createHandler(event);
    expect(result.response.publicChallengeParameters.prompt).toBe('Enter your access code');
    expect(result.response.privateChallengeParameters.answer).toBe('TCH001');
    expect(result.response.privateChallengeParameters.nonce).toBeDefined();
  });

  it('VerifyAuthChallenge: verifies matching answer correctly', async () => {
    const event: any = {
      request: {
        challengeAnswer: 'par001',
        privateChallengeParameters: {
          answer: 'PAR001',
        },
        userAttributes: {
          'custom:accessCode': 'PAR001',
        },
      },
      response: {},
    };

    const result = await verifyHandler(event);
    expect(result.response.answerCorrect).toBe(true);
  });

  it('VerifyAuthChallenge: rejects mismatched answer', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] });

    const event: any = {
      request: {
        challengeAnswer: 'WRONGCODE',
        privateChallengeParameters: {
          answer: 'PAR001',
        },
        userAttributes: {
          'custom:accessCode': 'PAR001',
        },
      },
      response: {},
    };

    const result = await verifyHandler(event);
    expect(result.response.answerCorrect).toBe(false);
  });
});
