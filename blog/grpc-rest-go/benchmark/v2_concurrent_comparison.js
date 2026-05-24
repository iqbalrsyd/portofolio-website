import http from 'k6/http';
import grpc from 'k6/net/grpc';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate, Gauge } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// REST Metrics
const restLatency = new Trend('http_latency_ms');
const restThroughput = new Counter('http_requests');
const restErrorRate = new Rate('http_errors');

// gRPC Metrics
const grpcLatency = new Trend('grpc_latency_ms');
const grpcThroughput = new Counter('grpc_requests');
const grpcErrorRate = new Rate('grpc_errors');

// Shared gRPC client pool
const clients = new SharedArray('grpc_clients_compare', function () {
	const clientList = [];
	for (let i = 0; i < 10; i++) {
		const client = new grpc.Client();
		client.load(['../proto'], 'product_service.proto');
		client.connect('localhost:50051', { plaintext: true });
		clientList.push(client);
	}
	return clientList;
});

export const options = {
	stages: [
		{ duration: '30s', target: 5 }, // Warmup
		{ duration: '30s', target: 10 }, // Ramp
		{ duration: '120s', target: 10 }, // Sustain 10 VUs
		{ duration: '30s', target: 50 }, // Ramp
		{ duration: '120s', target: 50 }, // Sustain 50 VUs
		{ duration: '30s', target: 0 } // Cool down
	],

	thresholds: {
		http_latency_ms: ['p(95)<200', 'p(99)<500'],
		http_errors: ['rate<0.05'],
		grpc_latency_ms: ['p(95)<200', 'p(99)<500'],
		grpc_errors: ['rate<0.05']
	}
};

const BASE_URL = 'http://localhost:8080';
const GRPC_ADDR = 'localhost:50051';

export default function () {
	const productId = Math.floor(Math.random() * 1000) + 1;

	group('Concurrent Single Item Comparison', () => {
		// REST request
		group('REST', () => {
			const res = http.get(`${BASE_URL}/api/products/${productId}`);

			const isSuccess = res.status === 200;
			restLatency.add(res.timings.duration);
			restThroughput.add(1);
			if (!isSuccess) restErrorRate.add(1);

			check(res, {
				'REST status 200': (r) => r.status === 200
			});
		});

		// gRPC request using shared client
		group('gRPC', () => {
			const clientIdx = __VU % clients.length;
			const client = clients[clientIdx];

			const res = client.invoke('product.ProductService/GetProduct', {
				id: productId
			});

			const isSuccess = res.status === grpc.StatusOK;
			grpcLatency.add(res.timings.duration);
			grpcThroughput.add(1);
			if (!isSuccess) grpcErrorRate.add(1);

			check(res, {
				'gRPC status OK': (r) => r.status === grpc.StatusOK
			});
		});
	});

	sleep(0.2);
}
