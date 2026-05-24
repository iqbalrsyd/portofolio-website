import grpc from 'k6/net/grpc';
import { check, sleep, group } from 'k6';
import { Trend, Counter, Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom metrics for streaming
const grpcStreamLatency = new Trend('grpc_stream_latency_ms');
const grpcStreamThroughput = new Counter('grpc_stream_requests');
const grpcStreamErrorRate = new Rate('grpc_stream_errors');
const grpcStreamMessagesPerRequest = new Trend('grpc_stream_messages');
const grpcStreamBytesReceived = new Trend('grpc_stream_bytes');

// Shared client pool for connection reuse
const clients = new SharedArray('grpc_clients_stream', function () {
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
		grpc_stream_latency_ms: ['p(95)<1000', 'p(99)<2000', 'max<5000'],
		grpc_stream_errors: ['rate<0.05'],
		grpc_stream_messages: ['value>900'] // Should receive all 1000 products
	}
};

export default function () {
	const clientIdx = __VU % clients.length;
	const client = clients[clientIdx];

	group('gRPC Server Streaming All Products', () => {
		// Start timing
		const startTime = new Date();
		let messageCount = 0;
		let totalBytes = 0;
		let streamError = null;

		// Open stream
		const stream = client.invoke('product.ProductService/StreamProducts', {});

		// In k6's gRPC streaming, we get back a single response
		// For proper streaming measurement, we track the response
		if (stream.status === grpc.StatusOK) {
			// In this simplified k6 model, streaming is buffered
			// Real scenario would process chunks as they arrive
			if (stream.message && stream.message.products) {
				messageCount = stream.message.products.length;
			}
		} else {
			streamError = stream.error;
		}

		const endTime = new Date();
		const latency = endTime - startTime;

		// Record metrics
		grpcStreamLatency.add(latency);
		grpcStreamMessagesPerRequest.add(messageCount);
		grpcStreamThroughput.add(1);

		if (streamError || stream.status !== grpc.StatusOK) {
			grpcStreamErrorRate.add(1);
		}

		check(stream, {
			'Stream status OK': (r) => r.status === grpc.StatusOK,
			'Stream receives all products': (r) => messageCount > 900,
			'Stream no errors': (r) => !streamError
		});
	});

	sleep(0.5);
}
