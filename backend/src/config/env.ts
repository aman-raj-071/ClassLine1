import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  AWS_REGION: z.string().default('eu-west-2'),
  TABLE_NAME: z.string().default('ClassLineTable'),
  COGNITO_USER_POOL_ID: z.string().default('eu-west-2_mockUserPoolId'),
  COGNITO_CLIENT_ID: z.string().default('mockAppClientId1234567890'),
  DYNAMODB_ENDPOINT: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().default(5),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  GEMINI_API_KEY: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : EnvSchema.parse({});
