import http from 'k6/http';
import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

const grpcClient = new grpc.Client();
grpcClient.load(['../proto'], 'product_service.proto');

export const options = {
	stages: [
		{ duration: '30s', target: 50 }, // Ramp up to 50 users
		{ duration: '1m', target: 50 }, // Stay at 50 users
		{ duration: '30s', target: 100 }, // Ramp up to 100 users
		{ duration: '1m', target: 100 }, // Stay at 100 users
		{ duration: '30s', target: 0 } // Ramp down
	],
	thresholds: {
		http_req_duration: ['p(95)<500'],
		grpc_req_duration: ['p(95)<500'],
		http_req_failed: ['rate<0.2'],
		grpc_req_failed: ['rate<0.2']
	}
};

export default function () {
	const productId = Math.floor(Math.random() * 1000) + 1;

	// REST stress test
	const restChoice = Math.random();
	if (restChoice < 0.5) {
		const getRes = http.get(`http://localhost:8080/api/products/${productId}`);
		check(getRes, {
			'REST GET status 200': (r) => r.status === 200,
			'REST GET response time < 500ms': (r) => r.timings.duration < 500
		});
	} else {
		const listRes = http.get('http://localhost:8080/api/products');
		check(listRes, {
			'REST LIST status 200': (r) => r.status === 200,
			'REST LIST response time < 500ms': (r) => r.timings.duration < 500
		});
	}

	// gRPC stress test
	grpcClient.connect('localhost:50051', { plaintext: true });

	try {
		const grpcChoice = Math.random();
		if (grpcChoice < 0.5) {
			const getRes = grpcClient.invoke('product.ProductService/GetProduct', {
				id: productId
			});
			check(getRes, {
				'gRPC GET status OK': (r) => r.status === grpc.StatusOK,
				'gRPC GET response time < 500ms': (r) => r.timings.duration < 500
			});
		} else {
			const listRes = grpcClient.invoke('product.ProductService/ListProducts', {});
			check(listRes, {
				'gRPC LIST status OK': (r) => r.status === grpc.StatusOK,
				'gRPC LIST response time < 500ms': (r) => r.timings.duration < 500
			});
		}
	} finally {
		grpcClient.close();
	}

	sleep(0.5);
}
