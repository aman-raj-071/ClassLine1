import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: env.AWS_REGION,
  maxAttempts: 3,
});

export async function loginWithCognitoCustomAuth(accessCode: string) {
  const cleanCode = accessCode.toUpperCase().trim();

  // 1. InitiateAuth with CUSTOM_AUTH
  const initRes = await cognitoClient.send(
    new InitiateAuthCommand({
      AuthFlow: 'CUSTOM_AUTH',
      ClientId: env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: cleanCode,
      },
    })
  );

  // If already authorized (rare with custom auth)
  if (initRes.AuthenticationResult?.IdToken) {
    return {
      idToken: initRes.AuthenticationResult.IdToken,
      accessToken: initRes.AuthenticationResult.AccessToken,
      refreshToken: initRes.AuthenticationResult.RefreshToken,
    };
  }

  // 2. Respond to CUSTOM_CHALLENGE with access code
  if (initRes.ChallengeName === 'CUSTOM_CHALLENGE' && initRes.Session) {
    const challengeRes = await cognitoClient.send(
      new RespondToAuthChallengeCommand({
        ChallengeName: 'CUSTOM_CHALLENGE',
        ClientId: env.COGNITO_CLIENT_ID,
        Session: initRes.Session,
        ChallengeResponses: {
          USERNAME: cleanCode,
          ANSWER: cleanCode,
        },
      })
    );

    if (challengeRes.AuthenticationResult?.IdToken) {
      return {
        idToken: challengeRes.AuthenticationResult.IdToken,
        accessToken: challengeRes.AuthenticationResult.AccessToken,
        refreshToken: challengeRes.AuthenticationResult.RefreshToken,
      };
    }
  }

  throw new Error('Authentication challenge failed');
}

export async function createCognitoUser(params: {
  username: string;
  email: string;
  name: string;
  role: 'parent' | 'teacher' | 'admin';
  schoolId: string;
  avatarInitials: string;
  accessCode: string;
}) {
  await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: params.username,
      UserAttributes: [
        { Name: 'email', Value: params.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: params.name },
        { Name: 'preferred_username', Value: params.accessCode },
        { Name: 'custom:accessCode', Value: params.accessCode },
        { Name: 'custom:role', Value: params.role },
        { Name: 'custom:schoolId', Value: params.schoolId },
        { Name: 'custom:avatarInitials', Value: params.avatarInitials },
      ],
      MessageAction: 'SUPPRESS',
    })
  );

  // Set permanent dummy password (unused since password auth is disabled)
  const dummyPassword = `ClassLine!${params.accessCode}2026`;
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: env.COGNITO_USER_POOL_ID,
      Username: params.username,
      Password: dummyPassword,
      Permanent: true,
    })
  );

  logger.info('Cognito user created successfully', {
    action: 'createCognitoUser',
    userId: params.username,
    role: params.role,
  });
}
