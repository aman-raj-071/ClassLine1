import { defineFunction } from '@aws-amplify/backend';

export const createAuthChallenge = defineFunction({
  name: 'create-auth-challenge',
  entry: '../../../backend/src/auth/triggers/createAuthChallenge.ts',
});
