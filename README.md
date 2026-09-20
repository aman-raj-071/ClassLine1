<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# ClassLine

ClassLine is a Vite/React application with an optional Express API intended for
AWS Cognito and DynamoDB. The user interface currently runs with its included
demo data and stores changes in the browser, so it works without cloud
credentials.

## Local setup

**Prerequisite:** Node.js 20 or later.

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and adjust values only if you are running the API.
3. Start the frontend: `npm run dev` and open `http://localhost:3000`.

Use the supplied demo access codes in the login dialog to explore the parent
and teacher views. Clear the site data in your browser to reset its demo state.

## Optional local API

In a second terminal, run `npm run dev:api`. It listens on
`http://localhost:3001`; verify it with `http://localhost:3001/api/health`.

The API needs AWS Cognito and DynamoDB configuration for authentication and
data endpoints. Set `AWS_REGION`, `TABLE_NAME`, `COGNITO_USER_POOL_ID`, and
`COGNITO_CLIENT_ID` in `.env`; optionally set `DYNAMODB_ENDPOINT` for DynamoDB
Local. The current frontend is demo-data driven and does not yet call this API.

## Teacher AI Assist (Amazon Bedrock)

ClassLine Assist is a teacher-only drafting tool. It can prepare a parent
message, translate approved school text, and generate report-card narratives.
It never sends a message, publishes a grade card, or creates an automatic reply.
Teachers review and copy every draft into the normal workflow.

For offline development, keep `AI_PROVIDER=local`. To use Amazon Bedrock:

1. Set `AI_PROVIDER=bedrock`, `BEDROCK_REGION`, and `BEDROCK_MODEL_ID` in
   `.env`. The default model is `amazon.nova-lite-v1:0` in `us-east-1`.
2. Configure AWS credentials locally with an AWS profile or environment
   credentials. Do not put credentials in frontend code or commit them to Git.
3. Enable the chosen model in the Bedrock console for the selected Region.
4. Give the development identity or deployed Lambda role only
   `bedrock:InvokeModel` for that foundation-model ARN. The Amplify definition
   already adds this least-privilege permission for Nova Lite.

When deployed through Amplify, the API Lambda uses its IAM role automatically;
no AWS secret is exposed to a browser. Production `/api/ai/*` routes require a
teacher or administrator Cognito token.

## Production Groq assistant

The deployed API Lambda uses Groq and reads its key from the Amplify backend
secret named `GROQ_API_KEY`; a local `.env` value is not deployed
automatically. Before deploying, set that backend secret and then redeploy the
backend. In Amplify Hosting, also set the branch environment variable
`VITE_API_URL` to the `custom.apiUrl` value in the Amplify backend outputs, then
redeploy the frontend. It must be the full API Gateway URL without a trailing
slash. This lets the hosted browser call the API Lambda rather than the static
site's non-existent `/api` route.

## Quality checks

Run `npm run lint`, `npm test`, and `npm run build` before shipping changes.
