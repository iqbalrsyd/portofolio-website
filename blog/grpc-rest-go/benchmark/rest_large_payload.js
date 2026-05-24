import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
	stages: [
		{ duration: '30s', target: 10 }, // Ramp up to 10 users
		{ duration: '1m30s', target: 10 }, // Stay at 10 users
		{ duration: '30s', target: 0 } // Ramp down to 0 users
	],
	thresholds: {
		http_req_duration: ['p(95)<500', 'p(99)<1000'],
		http_req_failed: ['rate<0.1']
	}
};

export default function () {
	// Test ListProducts - large payload request (1000 products)
	const listRes = http.get('http://localhost:8080/api/products');

	check(listRes, {
		'LIST status is 200': (r) => r.status === 200,
		'LIST response time < 1000ms': (r) => r.timings.duration < 1000,
		'LIST response has products': (r) => r.body.includes('products')
	});

	sleep(1);
}
