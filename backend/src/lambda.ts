import serverlessExpress from '@codegenie/serverless-express';
import { app } from './app';
import type { Handler, Context, Callback } from 'aws-lambda';

let serverlessExpressInstance: Handler;

async function setup(event: unknown, context: Context, callback: Callback) {
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context, callback);
}

export const handler: Handler = (event, context, callback) => {
  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context, callback);
  }
  return setup(event, context, callback);
};
