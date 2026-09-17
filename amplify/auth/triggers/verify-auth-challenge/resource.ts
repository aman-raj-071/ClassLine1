import { defineFunction } from '@aws-amplify/backend';

export const verifyAuthChallenge = defineFunction({
  name: 'verify-auth-challenge',
  entry: '../../../backend/src/auth/triggers/verifyAuthChallenge.ts',
});
