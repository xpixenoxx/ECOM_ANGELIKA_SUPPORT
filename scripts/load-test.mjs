#!/usr/bin/env node
/**
 * Local & staging HTTP concurrency + contention verification script for Angelika Fashions.
 * Measures real HTTP response status distribution, throughput (RPS), and p50/p95/p99 latency.
 *
 * Usage:
 *   node scripts/load-test.mjs --url=http://127.0.0.1:3000 --concurrency=50 --requests=400
 */

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [k, v] = arg.replace(/^--/, '').split('=');
    return [k, v ?? 'true'];
  })
);

const BASE_URL = (args.url || 'http://127.0.0.1:3000').replace(/\/+$/, '');
const CONCURRENCY = Math.max(1, Number(args.concurrency || 50));
const TOTAL_REQUESTS = Math.max(CONCURRENCY, Number(args.requests || 400));

const TARGETS = [
  { method: 'GET', path: '/api/health', expectMaxStatus: 299 },
  { method: 'GET', path: '/', expectMaxStatus: 399 },
  { method: 'GET', path: '/shop', expectMaxStatus: 399 },
  { method: 'GET', path: '/size-finder', expectMaxStatus: 399 },
  { method: 'GET', path: '/robots.txt', expectMaxStatus: 299 },
  { method: 'GET', path: '/sitemap.xml', expectMaxStatus: 299 },
  { method: 'GET', path: '/api/looks/active', expectMaxStatus: 299 },
  {
    method: 'POST',
    path: '/api/payments/create-stripe-intent',
    body: JSON.stringify({ orderId: '00000000-0000-0000-0000-000000000000', accessToken: 'invalid-load-probe' }),
    headers: { 'Content-Type': 'application/json' },
    expectMaxStatus: 499,
  },
  {
    method: 'POST',
    path: '/api/payments/verify-razorpay',
    body: JSON.stringify({ orderId: '00000000-0000-0000-0000-000000000000', razorpay_order_id: 'order_x', razorpay_payment_id: 'pay_x', razorpay_signature: 'bad' }),
    headers: { 'Content-Type': 'application/json' },
    expectMaxStatus: 499,
  },
];

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function run() {
  console.log(`Starting HTTP load test -> ${BASE_URL} | concurrency=${CONCURRENCY} | requests=${TOTAL_REQUESTS}`);

  const latencies = [];
  const statusCounts = new Map();
  let networkErrors = 0;
  let unexpectedStatus = 0;
  let nextIndex = 0;

  const startedAt = performance.now();

  async function worker() {
    while (true) {
      const idx = nextIndex++;
      if (idx >= TOTAL_REQUESTS) break;
      const target = TARGETS[idx % TARGETS.length];
      const reqStart = performance.now();

      try {
        const res = await fetch(`${BASE_URL}${target.path}`, {
          method: target.method,
          headers: target.headers,
          body: target.body,
          redirect: 'manual',
        });
        await res.arrayBuffer();
        const elapsed = performance.now() - reqStart;
        latencies.push(elapsed);
        statusCounts.set(res.status, (statusCounts.get(res.status) || 0) + 1);
        if (res.status >= 500 || res.status > target.expectMaxStatus) {
          unexpectedStatus++;
        }
      } catch {
        const elapsed = performance.now() - reqStart;
        latencies.push(elapsed);
        networkErrors++;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const totalElapsedSec = Math.max(0.001, (performance.now() - startedAt) / 1000);
  latencies.sort((a, b) => a - b);

  const summary = {
    baseUrl: BASE_URL,
    concurrency: CONCURRENCY,
    totalRequests: TOTAL_REQUESTS,
    durationSec: Number(totalElapsedSec.toFixed(2)),
    throughputRps: Number((TOTAL_REQUESTS / totalElapsedSec).toFixed(1)),
    latencyMs: {
      min: Number((latencies[0] || 0).toFixed(1)),
      p50: Number(percentile(latencies, 50).toFixed(1)),
      p95: Number(percentile(latencies, 95).toFixed(1)),
      p99: Number(percentile(latencies, 99).toFixed(1)),
      max: Number((latencies[latencies.length - 1] || 0).toFixed(1)),
    },
    statusCounts: Object.fromEntries(Array.from(statusCounts.entries()).sort((a, b) => a[0] - b[0])),
    networkErrors,
    unexpected5xxOrMismatch: unexpectedStatus,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (networkErrors > 0 || unexpectedStatus > 0) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
