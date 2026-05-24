import http from 'k6/http';
import grpc from 'k6/net/grpc';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// REST Bulk Metrics
const restBulkLatency = new Trend('rest_bulk_vs_stream_latency_ms');
const restBulkThroughput = new Counter('rest_bulk_vs_stream_requests');
const restBulkErrorRate = new Rate('rest_bulk_vs_stream_errors');

// gRPC Streaming Metrics
const grpcStreamLatency = new Trend('grpc_streaming_vs_bulk_latency_ms');
const grpcStreamThroughput = new Counter('grpc_streaming_vs_bulk_requests');
const grpcStreamErrorRate = new Rate('grpc_streaming_vs_bulk_errors');

// Shared gRPC client pool
const clients = new SharedArray('grpc_clients_comparison', function () {
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
		rest_bulk_vs_stream_latency_ms: ['p(95)<2000', 'p(99)<5000'],
		rest_bulk_vs_stream_errors: ['rate<0.05'],
		grpc_streaming_vs_bulk_latency_ms: ['p(95)<2000', 'p(99)<5000'],
		grpc_streaming_vs_bulk_errors: ['rate<0.05']
	}
};

const BASE_URL = 'http://localhost:8080';

export default function () {
	group('Bulk Transfer Comparison: REST vs gRPC Streaming', () => {
		// Measure REST bulk transfer
		group('REST Bulk Fetch', () => {
			const res = http.get(`${BASE_URL}/api/products`);

			const isSuccess = res.status === 200;
			restBulkLatency.add(res.timings.duration);
			restBulkThroughput.add(1);
			if (!isSuccess) restBulkErrorRate.add(1);

			check(res, {
				'REST bulk status 200': (r) => r.status === 200
			});
		});

		// Measure gRPC streaming
		group('gRPC Stream', () => {
			const clientIdx = __VU % clients.length;
			const client = clients[clientIdx];

			const res = client.invoke('product.ProductService/StreamProducts', {});

			const isSuccess = res.status === grpc.StatusOK;
			grpcStreamLatency.add(res.timings.duration);
			grpcStreamThroughput.add(1);
			if (!isSuccess) grpcStreamErrorRate.add(1);

			check(res, {
				'gRPC stream status OK': (r) => r.status === grpc.StatusOK
			});
		});
	});

	sleep(0.3);
}
