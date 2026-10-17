import { readFileSync, writeFileSync } from 'node:fs';

// pipeline-deploy writes this file before the hosted frontend is built.
const output = JSON.parse(readFileSync('amplify_outputs.json', 'utf8'));
const endpoint = process.env.VITE_API_URL?.trim() || output.custom?.apiUrl;
if (!endpoint) throw new Error('The deployed backend did not provide custom.apiUrl.');
const url = new URL(endpoint);
if (url.protocol !== 'https:') throw new Error('The hosted API must use HTTPS.');
writeFileSync('.env.production.local', `VITE_API_URL=${JSON.stringify(endpoint.replace(/\/+$/, ''))}\n`);
console.log('Configured the hosted frontend with the deployed API endpoint.');
