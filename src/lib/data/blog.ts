import Assets from './assets';
import type { BlogPost } from './types';

const items: Array<BlogPost> = [
	{
		slug: 'getting-started-with-microservices',
		title: 'Getting Started with Microservices Architecture',
		description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
		shortDescription: 'Introduction to microservices architecture and distributed system design',
		publishedAt: new Date(2024, 2, 15),
		category: 'Architecture',
		tags: ['Microservices', 'Backend', 'Architecture', 'DevOps'],
		author: 'Iqbal',
		readTime: 0,
		cover: Assets.Kubernetes
	},
	{
		slug: 'event-driven-architecture-kafka',
		title: 'Event-Driven Architecture with Apache Kafka',
		description: `Dive deep into event-driven architecture patterns using Apache Kafka for building scalable real-time systems.

Learn how to implement event sourcing, CQRS patterns, and handle streaming data at scale.

This guide covers Kafka producers, consumers, topics, partitions, and best practices for production deployments.`,
		shortDescription: 'Building event-driven systems with Apache Kafka',
		publishedAt: new Date(2024, 1, 28),
		category: 'Backend',
		tags: ['Kafka', 'Event-Driven', 'Microservices', 'Backend'],
		author: 'Iqbal',
		readTime: 12,
		cover: Assets.Kafka
	},
	{
		slug: 'devops-monitoring-observability',
		title: 'DevOps Monitoring and Observability Best Practices',
		description: `Master the three pillars of observability: metrics, logs, and traces for your DevOps infrastructure.

Learn how to set up Prometheus for metrics collection, Grafana for visualization, and Loki for log aggregation.

Implement comprehensive monitoring strategies to ensure high availability and performance of your systems.`,
		shortDescription: 'Complete guide to monitoring and observability in DevOps',
		publishedAt: new Date(2024, 1, 10),
		category: 'DevOps',
		tags: ['DevOps', 'Monitoring', 'Prometheus', 'Grafana'],
		author: 'Iqbal',
		readTime: 10,
		cover: Assets.Prometheus
	},
	{
		slug: 'golang-best-practices',
		title: 'Golang Best Practices for Backend Development',
		description: `Explore advanced Go programming patterns and best practices for building high-performance backend services.

Topics include error handling, concurrency patterns, testing strategies, and code organization.

Learn from real-world examples and improve your Go code quality and maintainability.`,
		shortDescription: 'Advanced patterns and practices for Go backend development',
		publishedAt: new Date(2024, 0, 20),
		category: 'Programming',
		tags: ['Golang', 'Backend', 'Best Practices'],
		author: 'Iqbal',
		readTime: 15,
		cover: Assets.Go
	},
	{
		slug: 'kubernetes-deployment-strategies',
		title: 'Kubernetes Deployment Strategies Explained',
		description: `Understanding different deployment strategies in Kubernetes: Rolling Update, Blue-Green, and Canary deployments.

Learn when to use each strategy and how to implement them effectively for zero-downtime deployments.

Includes practical examples and kubectl commands for managing deployments in production environments.`,
		shortDescription: 'Master Kubernetes deployment strategies for production',
		publishedAt: new Date(2023, 11, 5),
		category: 'DevOps',
		tags: ['Kubernetes', 'DevOps', 'Deployment', 'Cloud'],
		author: 'Iqbal',
		readTime: 10,
		cover: Assets.Kubernetes
	}
];

const title = 'Blog';

const BlogData = { title, items };

export default BlogData;
