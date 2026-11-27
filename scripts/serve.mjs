// Serves the built site (dist/) for the check, screenshot and Lighthouse scripts.
import { preview } from 'astro';

export async function serve(port = 4329) {
  const server = await preview({ logLevel: 'silent', server: { port, host: '127.0.0.1' } });
  return { url: `http://127.0.0.1:${server.port}/about/`, stop: () => server.stop() };
}
