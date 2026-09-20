import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  AWS_REGION: z.string().default('eu-west-2'),
  TABLE_NAME: z.string().default('ClassLineTable'),
  COGNITO_USER_POOL_ID: z.string().default('eu-west-2_mockUserPoolId'),
  COGNITO_CLIENT_ID: z.string().default('mockAppClientId1234567890'),
  DYNAMODB_ENDPOINT: z.string().optional(),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_MAX_ATTEMPTS: z.coerce.number().default(5),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().default(15),
  AI_PROVIDER: z.enum(['bedrock', 'gemini', 'local']).default('local'),
  BEDROCK_REGION: z.string().optional(),
  BEDROCK_MODEL_ID: z.string().default('amazon.nova-lite-v1:0'),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().min(32).max(1024).default(220),
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL_ID: z.string().default('gemini-3.6-flash'),
  GEMINI_MAX_OUTPUT_TOKENS: z.coerce.number().min(64).max(2048).default(512),
  PYTHON_AI_URL: z.string().optional(),
  CHATBOT_URL: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
}

export const env = parsed.success ? parsed.data : EnvSchema.parse({});
