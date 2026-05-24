import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';

// Custom metrics
const restListLatency = new Trend('rest_list_latency_ms');
const restListThroughput = new Counter('rest_list_requests');
const restListErrorRate = new Rate('rest_list_errors');
const restListPayloadSize = new Trend('rest_list_payload_bytes');

export const options = {
	stages: [
		{ duration: '30s', target: 5 }, // Warmup
		{ duration: '30s', target: 10 }, // Ramp up
		{ duration: '90s', target: 10 }, // Sustain 10 VUs
		{ duration: '30s', target: 50 }, // Ramp to 50
		{ duration: '90s', target: 50 }, // Sustain 50 VUs
		{ duration: '30s', target: 100 }, // Ramp to 100
		{ duration: '90s', target: 100 }, // Sustain 100 VUs
		{ duration: '30s', target: 0 } // Cool down
	],

	thresholds: {
		http_req_duration: ['p(95)<1000', 'p(99)<2000'],
		http_req_failed: ['rate<0.05'],
		rest_list_latency_ms: ['p(95)<1000', 'p(99)<2000', 'max<5000'],
		rest_list_payload_bytes: ['value>50000'] // Sanity check: payload should be >50KB
	}
};

const BASE_URL = 'http://localhost:8080';

export default function () {
	group('REST List All Products', () => {
		const res = http.get(`${BASE_URL}/api/products`, {
			tags: { name: 'ListProducts' }
		});

		const isSuccess = res.status === 200;
		restListLatency.add(res.timings.duration);
		restListPayloadSize.add(res.body.length);
		restListThroughput.add(1);
		if (!isSuccess) restListErrorRate.add(1);

		check(res, {
			'List status 200': (r) => r.status === 200,
			'List has products': (r) => r.body.includes('products'),
			'List payload size reasonable': (r) => r.body.length > 50000
		});
	});

	sleep(0.5); // Less aggressive than single-item to avoid overwhelming on list
}
