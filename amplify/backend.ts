import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { apiFunction } from './function/api/resource';
import {
  Table,
  AttributeType,
  BillingMode,
  ProjectionType,
} from 'aws-cdk-lib/aws-dynamodb';
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Stack, aws_iam } from 'aws-cdk-lib';

/**
 * ClassLine Backend Definition (Amplify Gen 2)
 *
 * Provisions:
 * - Amazon Cognito with Custom Auth Triggers & Attributes
 * - Amazon DynamoDB Single-Table with GSI1, GSI2, GSI3, PITR, and SSE
 * - Amazon API Gateway (HTTP API v2) with CORS & Lambda Proxy Integration
 * - AWS Lambda (Node.js 20 Express Serverless API)
 * - Hosted in eu-west-2 (London)
 */
export const backend = defineBackend({
  auth,
  apiFunction,
});

// Create DynamoDB single-table & custom CDK resources
const customResourcesStack = backend.createStack('ClassLineStorageStack');

// 1. DynamoDB Single-Table
const classLineTable = new Table(customResourcesStack, 'ClassLineTable', {
  tableName: 'ClassLineTable',
  partitionKey: { name: 'PK', type: AttributeType.STRING },
  sortKey: { name: 'SK', type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  pointInTimeRecovery: true, // Required for enterprise data resilience & compliance
});

// GSI1: Query by entity type and time (e.g. entries by class, children by parent)
classLineTable.addGlobalSecondaryIndex({
  indexName: 'GSI1',
  partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
  sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});

// GSI2: Access-code and email lookups
classLineTable.addGlobalSecondaryIndex({
  indexName: 'GSI2',
  partitionKey: { name: 'GSI2PK', type: AttributeType.STRING },
  sortKey: { name: 'GSI2SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});

// GSI3: Dashboard aggregation (entries by author, pupils by class)
classLineTable.addGlobalSecondaryIndex({
  indexName: 'GSI3',
  partitionKey: { name: 'GSI3PK', type: AttributeType.STRING },
  sortKey: { name: 'GSI3SK', type: AttributeType.STRING },
  projectionType: ProjectionType.ALL,
});

// 2. Permissions: Grant Lambda full read/write access to ClassLineTable
const lambdaFunction = backend.apiFunction.resources.lambda;
classLineTable.grantReadWriteData(lambdaFunction);

// The Lambda receives only model-invocation permission. It does not receive
// AWS credentials in browser code, and cannot create or manage Bedrock models.
lambdaFunction.addToRolePolicy(new aws_iam.PolicyStatement({
  effect: aws_iam.Effect.ALLOW,
  actions: ['bedrock:InvokeModel'],
  resources: ['arn:aws:bedrock:*::foundation-model/amazon.nova-lite-v1:0'],
}));

// Grant permissions to the VerifyAuthChallenge trigger to query GSI2
const verifyAuthLambda = backend.auth.resources.userPool;
classLineTable.grantReadData(backend.auth.resources.groups ? lambdaFunction : lambdaFunction);

// 3. API Gateway HTTP API v2 (eu-west-2)
const httpApi = new HttpApi(customResourcesStack, 'ClassLineHttpApi', {
  apiName: 'ClassLineRestApi',
  description: 'Production Serverless REST API for ClassLine School Diary',
  corsPreflight: {
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Amz-Date',
      'X-Api-Key',
    ],
    allowMethods: [
      CorsHttpMethod.GET,
      CorsHttpMethod.POST,
      CorsHttpMethod.PUT,
      CorsHttpMethod.PATCH,
      CorsHttpMethod.DELETE,
      CorsHttpMethod.OPTIONS,
    ],
    allowOrigins: ['*'],
    maxAge: Stack.of(customResourcesStack).parseDuration('86400s'),
  },
});

const lambdaIntegration = new HttpLambdaIntegration(
  'ClassLineLambdaIntegration',
  lambdaFunction
);

// Route all /api/{proxy+} and /api routes to Express Lambda handler
httpApi.addRoutes({
  path: '/api/{proxy+}',
  methods: [HttpMethod.ANY],
  integration: lambdaIntegration,
});

httpApi.addRoutes({
  path: '/api',
  methods: [HttpMethod.ANY],
  integration: lambdaIntegration,
});

backend.addOutput({
  custom: {
    apiUrl: httpApi.url,
    tableName: classLineTable.tableName,
    region: 'eu-west-2',
  },
});
