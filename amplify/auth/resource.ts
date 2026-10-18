import { defineAuth } from '@aws-amplify/backend';

/** ClassLine Cognito User Pool for username and password authentication. */
export const auth = defineAuth({
  loginWith: { email: true },
  userAttributes: {
    email: { required: true, mutable: true },
    preferredUsername: { required: false, mutable: true },
    'custom:role': { dataType: 'String', mutable: true, maxLen: 20, minLen: 3 },
    'custom:schoolId': { dataType: 'String', mutable: true, maxLen: 50, minLen: 3 },
    'custom:avatarInitials': { dataType: 'String', mutable: true, maxLen: 4, minLen: 1 },
    'custom:class': { dataType: 'String', mutable: true, maxLen: 50, minLen: 1 },
    'custom:isAuthorized': { dataType: 'String', mutable: true, maxLen: 5, minLen: 4 },
  },
});
