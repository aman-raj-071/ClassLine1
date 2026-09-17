import { defineAuth } from '@aws-amplify/backend';
import { defineAuthChallenge } from './triggers/define-auth-challenge/resource';
import { createAuthChallenge } from './triggers/create-auth-challenge/resource';
import { verifyAuthChallenge } from './triggers/verify-auth-challenge/resource';

/**
 * ClassLine Cognito User Pool Definition (Amplify Gen 2)
 *
 * Configured for CUSTOM_AUTH passwordless access-code login
 * Region: eu-west-2 (London)
 */
export const auth = defineAuth({
  loginWith: {
    email: false,
    phone: false,
    username: true, // Login via access code (e.g. PAR001, TCH001)
  },
  userAttributes: {
    email: {
      required: false,
      mutable: true,
    },
    preferredUsername: {
      required: false,
      mutable: true,
    },
    'custom:accessCode': {
      dataType: 'String',
      mutable: true,
      maxLen: 12,
      minLen: 6,
    },
    'custom:role': {
      dataType: 'String',
      mutable: true,
      maxLen: 20,
      minLen: 3,
    },
    'custom:schoolId': {
      dataType: 'String',
      mutable: true,
      maxLen: 50,
      minLen: 3,
    },
    'custom:avatarInitials': {
      dataType: 'String',
      mutable: true,
      maxLen: 4,
      minLen: 1,
    },
  },
  triggers: {
    defineAuthChallenge,
    createAuthChallenge,
    verifyAuthChallenge,
  },
});
