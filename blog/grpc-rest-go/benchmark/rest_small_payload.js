import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
	stages: [
		{ duration: '30s', target: 10 }, // Ramp up to 10 users
		{ duration: '1m30s', target: 10 }, // Stay at 10 users
		{ duration: '30s', target: 0 } // Ramp down to 0 users
	],
	thresholds: {
		http_req_duration: ['p(95)<200', 'p(99)<500'],
		http_req_failed: ['rate<0.1']
	}
};

export default function () {
	// Test GetProduct - small payload request
	const productId = Math.floor(Math.random() * 1000) + 1;
	const getRes = http.get(`http://localhost:8080/api/products/${productId}`);

	check(getRes, {
		'GET status is 200': (r) => r.status === 200,
		'GET response time < 200ms': (r) => r.timings.duration < 200
	});

	sleep(1);
}
