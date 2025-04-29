/**
 * Cloudflare Workers Utility
 *
 * This module provides utility functions for interacting with Cloudflare Workers deployed
 * as part of this application or external workers.
 */

/**
 * Represents the options for invoking a Cloudflare Worker.
 */
interface InvokeWorkerOptions {
  /**
   * The name or URL of the worker to invoke.
   * If a name is provided, it assumes the worker is accessible via a predictable URL
   * structure (e.g., `https://${workerName}.${env.WORKERS_DOMAIN}`).
   * If a full URL is provided, it will be used directly.
   */
  worker: string;

  /**
   * The request payload to send to the worker.
   * Can be any serializable data type (string, object, etc.).
   */
  body?: unknown;

  /**
   * Optional headers to include in the request to the worker.
   */
  headers?: Record<string, string>;

  /**
   * The HTTP method to use for the request (defaults to 'POST').
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

/**
 * Invokes a Cloudflare Worker.
 *
 * This function sends a request to the specified Cloudflare Worker and returns the response.
 * It handles constructing the worker URL (if a name is provided) and sending the payload.
 *
 * @template T - The expected type of the response data from the worker.
 * @param {InvokeWorkerOptions} options - The options for invoking the worker.
 * @returns {Promise<T>} A promise that resolves with the parsed JSON response from the worker.
 * @throws {Error} Throws an error if the fetch operation fails or the response is not ok.
 *
 * @example
 * // Assuming you have a worker named 'data-processor'
 * // and expect it to return an object like { result: string }
 * try {
 *   const response = await invokeWorker<{ result: string }>({
 *     worker: 'data-processor',
 *     body: { input: 'some data' },
 *     method: 'POST',
 *   });
 *   console.log('Worker response:', response.result);
 * } catch (error) {
 *   console.error('Failed to invoke worker:', error);
 * }
 *
 * @example
 * // Invoking a worker using a full URL
 * try {
 *   const response = await invokeWorker<string>({
 *     worker: 'https://my-external-worker.example.com/api/process',
 *     body: 'plain text data',
 *     headers: { 'Content-Type': 'text/plain' },
 *   });
 *   console.log('Worker response:', response);
 * } catch (error) {
 *   console.error('Failed to invoke worker:', error);
 * }
 */
export async function invokeWorker<T = unknown>(
  options: InvokeWorkerOptions,
): Promise<T> {
  const { worker, body, headers = {}, method = 'POST' } = options;

  // TODO: Implement logic to resolve worker name to URL based on environment
  // For now, we assume `worker` is either a full URL or requires a base URL from env
  let workerUrl: string;
  if (worker.startsWith('http://') || worker.startsWith('https://')) {
    workerUrl = worker;
  } else {
    // Placeholder for constructing URL from worker name and domain
    // Replace with your actual logic, e.g., using environment variables
    const workersDomain = process.env.WORKERS_DOMAIN; // Example environment variable
    if (!workersDomain) {
      throw new Error(
        'WORKERS_DOMAIN environment variable is not set. Cannot resolve worker name.',
      );
    }
    // Construct the URL, adjust as needed for your naming convention
    workerUrl = `https://${worker}.${workersDomain}`;
  }

  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json', // Default content type
      ...headers,
    },
  };

  if (body !== undefined) {
    if (typeof body === 'string') {
      requestOptions.body = body;
      // If body is string and no Content-Type header set, default to text/plain?
      if (!headers['Content-Type'] && !headers['content-type']) {
        requestOptions.headers = { ...requestOptions.headers, 'Content-Type': 'text/plain' };
      }
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(workerUrl, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Worker invocation failed with status ${response.status}: ${errorText}`,
      );
    }

    // Attempt to parse JSON, fallback to text if needed
    const responseText = await response.text();
    try {
      return JSON.parse(responseText) as T;
    } catch (e) {
      // If JSON parsing fails, return the raw text (useful for non-JSON responses)
      // Consider adding a check for content-type header if stricter handling is needed
      return responseText as unknown as T;
    }
  } catch (error) {
    console.error(`Error invoking worker ${workerUrl}:`, error);
    throw new Error(`Failed to invoke worker: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Potential future additions:
// - Caching mechanisms for worker responses
// - Integration with specific worker bindings (e.g., KV, R2, Queues) via worker RPC
// - More sophisticated error handling and retry logic 