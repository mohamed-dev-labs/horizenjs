/**
 * Horizen.js Middleware
 * Handles incoming batched requests on the server-side.
 */

export interface BatchedRequest {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

export class HorizenMiddleware {
  /**
   * Next.js API Route Handler for Batched Requests
   */
  static async nextHandler(req: any, res: any) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { requests } = req.body as { requests: BatchedRequest[] };

    if (!requests || !Array.isArray(requests)) {
      return res.status(400).json({ error: 'Invalid batch request format' });
    }

    console.log(`[Horizen.js Server] Processing ${requests.length} batched requests...`);

    try {
      // Execute all requests in parallel on the server
      const results = await Promise.all(
        requests.map(async (request) => {
          try {
            // Internal fetch to the actual API endpoint
            const response = await fetch(request.url, {
              method: request.method,
              headers: request.headers,
              body: request.body ? JSON.stringify(request.body) : undefined
            });
            return await response.json();
          } catch (error) {
            return { error: 'Internal Request Failed', details: error };
          }
        })
      );

      return res.status(200).json(results);
    } catch (error) {
      return res.status(500).json({ error: 'Batch Processing Failed', details: error });
    }
  }

  /**
   * Express.js Middleware for Batched Requests
   */
  static expressHandler() {
    return async (req: any, res: any) => {
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { requests } = req.body;
      if (!requests || !Array.isArray(requests)) {
        return res.status(400).send('Invalid batch request format');
      }

      try {
        const results = await Promise.all(
          requests.map(async (request: BatchedRequest) => {
            // Logic to execute requests internally
            return { status: 'success', data: {} }; // Placeholder
          })
        );
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: 'Batch Processing Failed' });
      }
    };
  }
}
