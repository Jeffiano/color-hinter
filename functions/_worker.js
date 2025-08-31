export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // Add node.js compatibility headers
    const response = await env.ASSETS.fetch(request);
    response.headers.set('nodejs_compat', '1');
    return response;
  }
}
