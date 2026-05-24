import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom metrics for REST bulk operations
const restBulkLatency = new Trend('rest_bulk_latency_ms');
const restBulkThroughput = new Counter('rest_bulk_requests');
const restBulkErrorRate = new Rate('rest_bulk_errors');
const restBulkPayloadSize = new Trend('rest_bulk_payload_bytes');
const restBulkTimeToFirstByte = new Trend('rest_bulk_ttfb_ms');

export const options = {
	stages: [
		// Warmup phase
		{ duration: '30s', target: 5 }, // Light warmup
		{ duration: '30s', target: 10 }, // Ramp up to 10 VUs

		// Baseline at 10 VUs
		{ duration: '90s', target: 10 }, // Stay at 10 VUs

		// Medium load (50 VUs)
		{ duration: '30s', target: 50 }, // Ramp to 50 VUs
		{ duration: '90s', target: 50 }, // Sustain 50 VUs

		// High load (100 VUs)
		{ duration: '30s', target: 100 }, // Ramp to 100 VUs
		{ duration: '90s', target: 100 }, // Sustain 100 VUs

		// Cool down
		{ duration: '30s', target: 0 } // Ramp down
	],

	thresholds: {
		http_req_duration: ['p(95)<2000', 'p(99)<5000'],
		http_req_failed: ['rate<0.05'],
		rest_bulk_payload_bytes: ['value>50000'] // Should be large JSON
	}
};

const BASE_URL = 'http://localhost:8080';

export default function () {
	group('REST Bulk Get All Products', () => {
		// Simulate REST bulk operation - single large fetch
		// In real world, this is how applications get "streaming-like" behavior from REST:
		// 1. Make single large request
		// 2. Wait for entire response
		// 3. Parse entire response
		// 4. Process data

		const res = http.get(`${BASE_URL}/api/products`, {
			tags: { name: 'BulkProducts' }
		});

		const isSuccess = res.status === 200;

		// Measure full latency
		restBulkLatency.add(res.timings.duration);

		// Measure time to first byte (similar to streaming start)
		restBulkTimeToFirstByte.add(res.timings.waiting);

		// Measure payload size
		restBulkPayloadSize.add(res.body.length);

		restBulkThroughput.add(1);
		if (!isSuccess) restBulkErrorRate.add(1);

		check(res, {
			'Bulk get status 200': (r) => r.status === 200,
			'Bulk get has large payload': (r) => r.body.length > 50000,
			'Bulk get response valid JSON': (r) => {
				try {
					JSON.parse(r.body);
					return true;
				} catch (e) {
					return false;
				}
			}
		});
	});

	sleep(0.5);
}
