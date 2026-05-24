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
		grpc_req_duration: ['p(95)<500', 'p(99)<1000']
	}
};

export default function () {
	client.connect('localhost:50051', { plaintext: true });

	try {
		// Test ListProducts - large payload request (1000 products)
		const listRes = client.invoke('product.ProductService/ListProducts', {});

		check(listRes, {
			'ListProducts status is OK': (r) => r.status === grpc.StatusOK,
			'ListProducts has count': (r) => r.message.count > 0,
			'ListProducts has products': (r) => r.message.products.length > 0
		});

		sleep(1);
	} finally {
		client.close();
	}
}
