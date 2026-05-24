import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom metrics for detailed analysis
const restLatency = new Trend('rest_latency_ms');
const restThroughput = new Counter('rest_requests');
const restErrorRate = new Rate('rest_errors');

export const options = {
	stages: [
		// Warmup phase: allow GC and connection pooling to stabilize
		{ duration: '30s', target: 5 }, // Light warmup
		{ duration: '30s', target: 10 }, // Ramp up to 10 VUs

		// Sustained load phase 1: baseline (10 VUs)
		{ duration: '90s', target: 10 }, // Stay at 10 VUs

		// Sustained load phase 2: medium load (50 VUs)
		{ duration: '30s', target: 50 }, // Ramp to 50 VUs
		{ duration: '90s', target: 50 }, // Sustain 50 VUs

		// Sustained load phase 3: high load (100 VUs)
		{ duration: '30s', target: 100 }, // Ramp to 100 VUs
		{ duration: '90s', target: 100 }, // Sustain 100 VUs

		// Cool down
		{ duration: '30s', target: 0 } // Ramp down
	],

	thresholds: {
		http_req_duration: ['p(95)<200', 'p(99)<500'],
		http_req_failed: ['rate<0.05'],
		rest_latency_ms: ['p(95)<200', 'p(99)<500', 'max<2000'],
		rest_errors: ['rate<0.05']
	},

	// Connection pooling and performance tuning
	httpDebug: 'full',
	tlsVersion: 'tlsv1.2'
};

// Base URL
const BASE_URL = 'http://localhost:8080';

export default function () {
	// Single item request (most common operation in real systems)
	group('REST Single Item Retrieval', () => {
		const productId = Math.floor(Math.random() * 1000) + 1;
		const res = http.get(`${BASE_URL}/api/products/${productId}`, {
			tags: { name: 'SingleProductGet' }
		});

		const isSuccess = res.status === 200;
		restLatency.add(res.timings.duration);
		restThroughput.add(1);
		if (!isSuccess) restErrorRate.add(1);

		check(res, {
			'Single product status 200': (r) => r.status === 200,
			'Single product has id': (r) => JSON.parse(r.body).id > 0
		});
	});

	sleep(0.1);
}
