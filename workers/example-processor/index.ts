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

    // Define CORS headers - allow all origins for simplicity
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type', // Allow standard headers
    };

    // Handle CORS preflight (OPTIONS) request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204, // No Content
        headers: corsHeaders,
      });
    }

    // Handle actual POST request
    if (request.method === 'POST') {
      // Check content type
      const contentType = request.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return new Response(JSON.stringify({ error: 'Expected Content-Type: application/json' }), {
          status: 415,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }

      try {
        // Parse the JSON body
        const data: unknown = await request.json();

        // Basic validation: ensure data is an object
        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
           return new Response(JSON.stringify({ error: 'Expected a JSON object payload' }), {
             status: 400,
             headers: {
               ...corsHeaders,
               'Content-Type': 'application/json',
             },
           });
        }

        // Process the data (add a timestamp)
        const processedData = {
          ...data,
          processedAt: new Date().toISOString(),
        };

        // Return the processed data as JSON
        return new Response(JSON.stringify(processedData), {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error processing request:', error);
        const errorMessage = error instanceof SyntaxError ? 'Invalid JSON payload' : 'Internal Server Error';
        const errorStatus = error instanceof SyntaxError ? 400 : 500;
        
        return new Response(JSON.stringify({ error: errorMessage }), {
          status: errorStatus,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // Handle other methods (GET, PUT, etc.)
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders, // Include CORS headers even for error responses
    });
  },
}; 