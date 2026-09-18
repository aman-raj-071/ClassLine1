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
    // Nova Lite is invoked in this Bedrock region. Change only after enabling
    // the selected model in the replacement region.
    AI_PROVIDER: 'bedrock',
    BEDROCK_REGION: 'us-east-1',
    BEDROCK_MODEL_ID: 'amazon.nova-lite-v1:0',
    AI_MAX_OUTPUT_TOKENS: '220',
  },
});
