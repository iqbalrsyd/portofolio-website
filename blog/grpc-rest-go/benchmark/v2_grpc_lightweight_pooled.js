import grpc from 'k6/net/grpc';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom metrics for detailed analysis
const grpcLatency = new Trend('grpc_latency_ms');
const grpcThroughput = new Counter('grpc_requests');
const grpcErrorRate = new Rate('grpc_errors');

// Share clients across VU iterations for connection pooling simulation
const clients = new SharedArray('grpc_clients', function () {
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
		grpc_req_duration: ['p(95)<200', 'p(99)<500'],
		grpc_latency_ms: ['p(95)<200', 'p(99)<500', 'max<2000'],
		grpc_errors: ['rate<0.05']
	}
};

export default function () {
	// Use a shared client to simulate connection pooling
	// This is more representative of real gRPC usage patterns
	const clientIdx = __VU % clients.length;
	const client = clients[clientIdx];

	// Single item request (most common operation in real systems)
	group('gRPC Single Item Retrieval', () => {
		const productId = Math.floor(Math.random() * 1000) + 1;

		const res = client.invoke('product.ProductService/GetProduct', {
			id: productId
		});

		const isSuccess = res.status === grpc.StatusOK;
		grpcLatency.add(res.timings.duration);
		grpcThroughput.add(1);
		if (!isSuccess) grpcErrorRate.add(1);

		check(res, {
			'Single product status OK': (r) => r.status === grpc.StatusOK,
			'Single product has id': (r) => r.message.id > 0
		});
	});

	sleep(0.1);
}
