import grpc from 'k6/net/grpc';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom metrics
const grpcListLatency = new Trend('grpc_list_latency_ms');
const grpcListThroughput = new Counter('grpc_list_requests');
const grpcListErrorRate = new Rate('grpc_list_errors');
const grpcListMessageCount = new Trend('grpc_list_message_count');

// Shared client pool for connection reuse
const clients = new SharedArray('grpc_clients_list', function () {
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
		{ duration: '30s', target: 10 }, // Ramp up
		{ duration: '90s', target: 10 }, // Sustain 10 VUs
		{ duration: '30s', target: 50 }, // Ramp to 50
		{ duration: '90s', target: 50 }, // Sustain 50 VUs
		{ duration: '30s', target: 100 }, // Ramp to 100
		{ duration: '90s', target: 100 }, // Sustain 100 VUs
		{ duration: '30s', target: 0 } // Cool down
	],

	thresholds: {
		grpc_req_duration: ['p(95)<1000', 'p(99)<2000'],
		grpc_list_latency_ms: ['p(95)<1000', 'p(99)<2000', 'max<5000'],
		grpc_list_message_count: ['value>900'] // Sanity check
	}
};

export default function () {
	const clientIdx = __VU % clients.length;
	const client = clients[clientIdx];

	group('gRPC List All Products', () => {
		const res = client.invoke('product.ProductService/ListProducts', {});

		const isSuccess = res.status === grpc.StatusOK;
		grpcListLatency.add(res.timings.duration);
		grpcListMessageCount.add(res.message.products ? res.message.products.length : 0);
		grpcListThroughput.add(1);
		if (!isSuccess) grpcListErrorRate.add(1);

		check(res, {
			'List status OK': (r) => r.status === grpc.StatusOK,
			'List has count': (r) => r.message.count > 0,
			'List has products': (r) => r.message.products && r.message.products.length > 0,
			'List product count reasonable': (r) => r.message.products.length > 900
		});
	});

	sleep(0.5);
}
