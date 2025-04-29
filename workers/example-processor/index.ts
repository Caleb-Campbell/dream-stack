/**
 * Example Cloudflare Worker: example-processor
 *
 * This worker demonstrates a simple processing task:
 * - Expects a POST request with a JSON body.
 * - Adds a `processedAt` timestamp to the incoming JSON data.
 * - Returns the modified JSON object.
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  //
  // Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
  // MY_SERVICE: Fetcher;
  //
  // Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
  // MY_QUEUE: Queue;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Check if the request method is POST
    if (request.method !== 'POST') {
      return new Response('Expected POST request', { status: 405 });
    }

    // Check if the content type is JSON
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response('Expected Content-Type: application/json', {
        status: 415,
      });
    }

    try {
      // Parse the JSON body
      const data: unknown = await request.json();

      // Basic validation: ensure data is an object
      if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          return new Response('Expected a JSON object payload', { status: 400 });
      }

      // Process the data (add a timestamp)
      const processedData = {
        ...data,
        processedAt: new Date().toISOString(),
      };

      // Return the processed data as JSON
      return new Response(JSON.stringify(processedData), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } catch (error) {
      console.error('Error processing request:', error);
      if (error instanceof SyntaxError) {
        return new Response('Invalid JSON payload', { status: 400 });
      }
      return new Response('Internal Server Error', { status: 500 });
    }
  },
}; 