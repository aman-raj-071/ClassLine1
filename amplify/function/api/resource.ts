import { defineFunction } from '@aws-amplify/backend';

export const apiFunction = defineFunction({
  name: 'classline-api',
  entry: '../../../backend/src/lambda.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    NODE_ENV: 'production',
    AWS_REGION: 'eu-west-2',
    TABLE_NAME: 'ClassLineTable',
  },
});
