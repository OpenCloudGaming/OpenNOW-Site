import { trackAgents } from '@databuddy/sdk/agents';

const FALLBACK_WEBSITE_ID = '68ffafef-93aa-4a06-bfe3-98ee8bf2fe1f';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
  DATABUDDY_WEBSITE_ID?: string;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    ctx.waitUntil(
      trackAgents(request, {
        websiteId: env.DATABUDDY_WEBSITE_ID ?? FALLBACK_WEBSITE_ID,
      }).catch(() => {}),
    );
    return env.ASSETS.fetch(request);
  },
};
