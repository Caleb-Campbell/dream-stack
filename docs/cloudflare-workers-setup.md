# Cloudflare Workers Setup Guide

This guide explains how to set up, deploy, and use Cloudflare Workers within the Dream Stack template.

## 1. Prerequisites

- A Cloudflare account (free tier is sufficient for getting started).
- Node.js and npm installed.
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/) installed globally: `npm install -g wrangler`.
- Logged into Wrangler: `wrangler login`.

## 2. Worker Code Location

Worker source code resides in the `workers/` directory at the project root. Each subdirectory represents a separate worker (e.g., `workers/example-processor/`).

The entry point for each worker is typically `index.ts` within its directory.

## 3. Configuration (`wrangler.toml`)

The `wrangler.toml` file in the project root configures your workers for deployment.

- **`name` (Optional):** A name for your overall Cloudflare Workers project.
- **`compatibility_date`:** Ensures your worker runs against a specific version of the Workers runtime API. Keep this updated periodically.
- **`[[workers]]`:** Defines individual workers.
  - **`name`:** The name of the worker (e.g., `example-processor`). This name is used in the deployment URL (`<worker-name>.<workers-domain>`).
  - **`main`:** Path to the worker's entry point file.
  - **`compatibility_date`:** Worker-specific compatibility date.
  - **Bindings (Optional):** Configure bindings to other Cloudflare services like KV, R2, Queues, Durable Objects, etc. Uncomment and fill in the examples in `wrangler.toml` as needed. You'll need to create these resources in your Cloudflare dashboard first to get their IDs/names.

## 4. Environment Variables

### a) Application Environment (`.env`)

The Next.js application needs to know your Workers domain to invoke workers by name using the `invokeWorker` utility (`src/lib/cloudflare/workers.ts`).

1.  **Find your Workers Domain:**
    *   Log in to your Cloudflare dashboard.
    *   Go to **Workers & Pages** in the left sidebar.
    *   On the Overview tab, look for your **Account ID** and your **`.workers.dev` Subdomain**. Your default workers domain is usually `<your-subdomain>.workers.dev`.
    *   Alternatively, if you have configured a [Custom Domain for Workers](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), use that.
2.  **Set the Environment Variable:**
    *   Create a `.env` file in the project root (copy `.env.example` if it exists).
    *   Add the following line, replacing `<your-workers-domain>` with the domain found above.
    *   **Important:** Use the `NEXT_PUBLIC_` prefix to make this variable available to the browser (client-side code).
        ```env
        NEXT_PUBLIC_WORKERS_DOMAIN="<your-workers-domain>"
        ```
    *   Make sure to add `.env` to your `.gitignore` file!

### b) Worker Environment (Optional, in `wrangler.toml`)

You can define environment variables specifically for a worker within `wrangler.toml` using the `[vars]` section. Secrets should be managed using `wrangler secret put <KEY>`.

## 5. Deployment

To deploy your workers:

1.  Navigate to the project root directory in your terminal.
2.  Run the deploy command:
    ```bash
    wrangler deploy
    ```
    This command reads `wrangler.toml`, builds each worker defined, and deploys it to your Cloudflare account. It will output the URLs for your deployed workers.

## 6. Invoking Workers from Next.js

Use the `invokeWorker` utility from `src/lib/cloudflare/workers.ts`:

```typescript
import { invokeWorker } from '~/lib/cloudflare/workers';

interface ExampleResponse {
  originalData: any;
  processedAt: string;
}

async function callMyWorker() {
  try {
    const response = await invokeWorker<ExampleResponse>({
      worker: 'example-processor', // Worker name defined in wrangler.toml
      body: { message: 'Hello from Next.js!' },
      method: 'POST',
    });
    console.log('Worker response:', response);
    // Access response properties like response.processedAt
  } catch (error) {
    console.error('Failed to invoke worker:', error);
  }
}
```

**Important:** Ensure the `NEXT_PUBLIC_WORKERS_DOMAIN` environment variable is correctly set in your Next.js application's environment (e.g., via `.env` locally or environment variables in your hosting provider like Cloudflare Pages). The `NEXT_PUBLIC_` prefix is crucial for client-side invocation.

## 7. Local Development (`wrangler dev`)

For local testing:

1.  Run `wrangler dev workers/path/to/worker/index.ts --local` to start a local server for a specific worker.
2.  You can then use tools like `curl` or Postman to send requests to the local endpoint (usually `http://localhost:8787`).

Refer to the [Wrangler documentation](https://developers.cloudflare.com/workers/wrangler/) for more advanced usage and commands. 