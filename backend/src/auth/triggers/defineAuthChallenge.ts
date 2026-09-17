export interface DefineAuthChallengeEvent {
  request: {
    userAttributes: Record<string, string>;
    session: Array<{
      challengeName: string;
      challengeResult: boolean;
      challengeMetadata?: string;
    }>;
  };
  response: {
    challengeName?: string;
    issueTokens: boolean;
    failAuthentication: boolean;
  };
}

export async function handler(event: DefineAuthChallengeEvent): Promise<DefineAuthChallengeEvent> {
  const session = event.request.session || [];

  if (session.length === 0) {
    // First attempt: present custom challenge
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  } else {
    const latestAttempt = session[session.length - 1];

    if (latestAttempt.challengeResult === true) {
      // Correct access code verified
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    } else if (session.length >= 3) {
      // Limit to 3 consecutive failures per session
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    } else {
      // Retry challenge
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = 'CUSTOM_CHALLENGE';
    }
  }

  return event;
}
