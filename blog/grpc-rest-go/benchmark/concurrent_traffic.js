import http from 'k6/http';
import grpc from 'k6/net/grpc';
import { check, sleep, group } from 'k6';

const grpcClient = new grpc.Client();
grpcClient.load(['../proto'], 'product_service.proto');

export const options = {
	stages: [
		{ duration: '5s', target: 5 }, // Ramp up to 5 users (SHORT TEST)
		{ duration: '10s', target: 5 }, // Stay at 5 users
		{ duration: '5s', target: 0 } // Ramp down
	],
	thresholds: {
		http_req_duration: ['p(95)<300'],
		grpc_req_duration: ['p(95)<300'],
		http_req_failed: ['rate<0.1']
	}
};

export default function () {
	const productId = Math.floor(Math.random() * 1000) + 1;

	group('REST API Requests', () => {
		const getRes = http.get(`http://localhost:8080/api/products/${productId}`);
		check(getRes, {
			'REST GET status 200': (r) => r.status === 200
		});

		const listRes = http.get('http://localhost:8080/api/products');
		check(listRes, {
			'REST LIST status 200': (r) => r.status === 200
		});
	});

	group('gRPC API Requests', () => {
		grpcClient.connect('localhost:50051', { plaintext: true });

		try {
			const getRes = grpcClient.invoke('product.ProductService/GetProduct', {
				id: productId
			});
			check(getRes, {
				'gRPC GET status OK': (r) => r.status === grpc.StatusOK
			});

			const listRes = grpcClient.invoke('product.ProductService/ListProducts', {});
			check(listRes, {
				'gRPC LIST status OK': (r) => r.status === grpc.StatusOK
			});
		} finally {
			grpcClient.close();
		}
	});

	sleep(1);
}
