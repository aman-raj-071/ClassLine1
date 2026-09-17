import { getUserByAccessCode } from '../../db/queries';

export interface VerifyAuthChallengeEvent {
  request: {
    userAttributes: Record<string, string>;
    privateChallengeParameters: {
      answer?: string;
      nonce?: string;
    };
    challengeAnswer: string;
  };
  response: {
    answerCorrect: boolean;
  };
}

export async function handler(event: VerifyAuthChallengeEvent): Promise<VerifyAuthChallengeEvent> {
  const providedAnswer = (event.request.challengeAnswer || '').toUpperCase().trim();
  const expectedAnswer = (event.request.privateChallengeParameters?.answer || '').toUpperCase().trim();

  // 1. Direct match with challenge parameters if present
  if (expectedAnswer && providedAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
    return event;
  }

  // 2. Direct match with user attribute custom:accessCode
  const userAttrCode = (event.request.userAttributes?.['custom:accessCode'] || '').toUpperCase().trim();
  if (userAttrCode && providedAnswer === userAttrCode) {
    event.response.answerCorrect = true;
    return event;
  }

  // 3. Fallback: verify against DynamoDB single-table GSI2 lookup
  try {
    const userInDb = await getUserByAccessCode(providedAnswer);
    if (userInDb) {
      event.response.answerCorrect = true;
      return event;
    }
  } catch {
    // If DynamoDB is unreachable, rely on prior comparisons
  }

  event.response.answerCorrect = false;
  return event;
}
