import { randomUUID } from 'crypto';

export interface CreateAuthChallengeEvent {
  request: {
    userAttributes: Record<string, string>;
    challengeName: string;
    session: unknown[];
  };
  response: {
    publicChallengeParameters: Record<string, string>;
    privateChallengeParameters: Record<string, string>;
    challengeMetadata: string;
  };
}

export async function handler(event: CreateAuthChallengeEvent): Promise<CreateAuthChallengeEvent> {
  const nonce = randomUUID();
  const expectedCode = (event.request.userAttributes['custom:accessCode'] || '').toUpperCase();

  event.response.publicChallengeParameters = {
    prompt: 'Enter your access code',
  };

  event.response.privateChallengeParameters = {
    answer: expectedCode,
    nonce,
  };

  event.response.challengeMetadata = `CHALLENGE_NONCE_${nonce}`;

  return event;
}
