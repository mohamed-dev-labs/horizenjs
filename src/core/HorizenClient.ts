/**
 * Horizen.js Core Client
 * Handles request batching and freezing to optimize API performance.
 */

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface QueuedRequest {
  url: string;
  options: RequestOptions;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export class HorizenClient {
  private queue: QueuedRequest[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly batchDelay: number; // ms to "freeze" and collect requests

  constructor(batchDelay: number = 50) {
    this.batchDelay = batchDelay;
  }

  /**
   * Send a request through Horizen.js
   * If multiple requests are made within the batchDelay, they will be bundled.
   */
  async request(url: string, options: RequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });

      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.processBatch(), this.batchDelay);
      }
    });
  }

  private async processBatch() {
    const currentBatch = [...this.queue];
    this.queue = [];
    this.batchTimeout = null;

    if (currentBatch.length === 0) return;

    // If only one request, send it normally to avoid overhead
    if (currentBatch.length === 1) {
      const { url, options, resolve, reject } = currentBatch[0];
      try {
        const response = await fetch(url, options);
        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
      return;
    }

    // Batching Logic: Send all requests in one bundle to a Horizen-compatible endpoint
    console.log(`[Horizen.js] Batching ${currentBatch.length} requests...`);
    
    try {
      // In a real scenario, we'd send this to a /horizen-batch endpoint
      // For now, we simulate the batching behavior
      const batchPayload = currentBatch.map(req => ({
        url: req.url,
        method: req.options.method || 'GET',
        headers: req.options.headers,
        body: req.options.body
      }));

      // This is where the "20x faster" magic happens by reducing RTT
      const response = await fetch('/api/horizen-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requests: batchPayload })
      });

      const results = await response.json(); // Expected: array of results

      currentBatch.forEach((req, index) => {
        req.resolve(results[index]);
      });
    } catch (error) {
      currentBatch.forEach(req => req.reject(error));
    }
  }
}
