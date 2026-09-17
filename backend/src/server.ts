import 'dotenv/config';
import { app } from './app';

// Vite uses port 3000 in this project, so keep the local API on a separate
// port by default. Set API_PORT (or PORT) to override it.
const port = Number(process.env.API_PORT ?? process.env.PORT ?? 3001);

const server = app.listen(port, () => {
  console.log(`ClassLine API listening on http://localhost:${port}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received; shutting down ClassLine API.`);
  server.close(() => process.exit(0));
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));
