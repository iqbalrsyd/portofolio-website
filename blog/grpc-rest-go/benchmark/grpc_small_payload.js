import grpc from 'k6/net/grpc';
import { check, sleep } from 'k6';

const client = new grpc.Client();
client.load(['../proto'], 'product_service.proto');

export const options = {
	stages: [
		{ duration: '30s', target: 10 }, // Ramp up to 10 users
		{ duration: '1m30s', target: 10 }, // Stay at 10 users
		{ duration: '30s', target: 0 } // Ramp down to 0 users
	],
	thresholds: {
		grpc_req_duration: ['p(95)<200', 'p(99)<500']
	}
};

export default function () {
	client.connect('localhost:50051', { plaintext: true });

	try {
		// Test GetProduct - small payload request
		const productId = Math.floor(Math.random() * 1000) + 1;
		const getRes = client.invoke('product.ProductService/GetProduct', {
			id: productId
		});

		check(getRes, {
			'GetProduct status is OK': (r) => r.status === grpc.StatusOK,
			'GetProduct has id': (r) => r.message.id > 0
		});

		sleep(1);
	} finally {
		client.close();
	}
}
