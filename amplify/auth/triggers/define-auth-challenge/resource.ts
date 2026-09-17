import { defineFunction } from '@aws-amplify/backend';

export const defineAuthChallenge = defineFunction({
  name: 'define-auth-challenge',
  entry: '../../../backend/src/auth/triggers/defineAuthChallenge.ts',
});
