import { defineFunction, secret } from '@aws-amplify/backend';

export const apiFunction = defineFunction({
  name: 'classline-api',
  entry: '../../../backend/src/lambda.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    NODE_ENV: 'production',
    // Keep the Lambda response readable by the hosted production site.
    // Update this if the Amplify branch domain changes.
    CORS_ORIGIN: 'https://main.d2klr7t3k90s53.amplifyapp.com',
    AWS_REGION: 'eu-west-2',
    TABLE_NAME: 'ClassLineTable',
    // Groq is called only by this Lambda. The secret is resolved at runtime
    // and is never bundled into the browser application or deployment files.
    AI_PROVIDER: 'groq',
    GROQ_API_KEY: secret('GROQ_API_KEY'),
    GROQ_MODEL_ID: 'openai/gpt-oss-20b',
    GROQ_MAX_OUTPUT_TOKENS: '512',
  },
});
