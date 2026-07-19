import { handle } from 'hono/cloudflare-pages';
import { app } from '../../../workers/src/app';

export const onRequest = handle(app);
