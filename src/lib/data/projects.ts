import Assets from './assets';
import { getSkills } from './skills';
import type { Project } from './types';

const items: Array<Project> = [
	{
		slug: 'thesis-adaptive-devops',
		color: '#5e95e3',
		description: `Designed and analyzed monolithic and microservices backends to study their impact on CI/CD pipeline design.

Developed an AI-augmented, rule-guided DevSecOps pipeline generator for adaptive CI/CD workflows.

Implemented Docker-based containerization and Kubernetes staging deployments for deployment validation.

Integrated observability readiness checks including health endpoints, service reachability, and logging.`,
		shortDescription: 'AI-augmented DevSecOps pipeline generator for adaptive CI/CD workflows',
		links: [],
		logo: Assets.Kubernetes,
		name: 'Comparative Analysis of Adaptive DevOps',
		period: {
			from: new Date(2024, 8, 1)
		},
		skills: getSkills('docker', 'kubernetes', 'jenkins', 'golang', 'python'),
		type: 'Undergraduate Thesis',
	},
	{
		slug: 'event-driven-kafka',
		color: '#000000',
		description: `Built event-driven backend system with Golang and Apache Kafka to process e-commerce transactions asynchronously across three microservices communicating via Kafka event streams.

Designed microservices architecture handling orders, payments, and inventory with parallel processing to eliminate API bottlenecks and improve scalability.

Implemented producer-consumer pattern with Kafka topics, partitions, and consumer groups achieving 1000+ orders/minute throughput with <50ms response time.

Developed comprehensive testing suite using k6 (load, stress, spike tests) proving system stability under extended load with <0.1% error rate.

Configured retry mechanisms and offset management for reliable message processing with database-per-service pattern ensuring data isolation.

Deployed complete Kafka infrastructure using Docker Compose with PostgreSQL databases, health monitoring, and structured logging (Uber Zap) for observability.`,
		shortDescription: 'Microservices architecture with Kafka achieving 1000+ orders/min throughput',
		links: [],
		logo: Assets.Kafka,
		name: 'Event-Driven Transaction Processing System',
		period: {
			from: new Date(2024, 5, 1),
			to: new Date(2024, 6, 30)
		},
		skills: getSkills('golang', 'kafka', 'docker', 'postgresql'),
		type: 'Microservices Backend',
	},
	{
		slug: 'devops-observability',
		color: '#ff6600',
		description: `Built Jenkins-based CI/CD pipelines to automate build and deployment workflows for microservices architecture.

Implemented centralized metrics collection and logging using Prometheus, Grafana, and Loki.

Monitored service health, resource usage, and application logs across distributed environments.

Focused on improving system reliability through observability-driven debugging and performance optimization.`,
		shortDescription: 'Jenkins pipeline with Prometheus, Grafana, and Loki for microservices',
		links: [],
		logo: Assets.Jenkins,
		name: 'DevOps Pipeline & Observability',
		period: {
			from: new Date(2024, 3, 1),
			to: new Date(2024, 5, 30)
		},
		skills: getSkills('jenkins', 'prometheus', 'grafana', 'docker', 'kubernetes'),
		type: 'DevOps Infrastructure',
	},
	{
		slug: 'etl-airflow',
		color: '#017cee',
		description: `Built end-to-end ETL pipeline integrating data from multiple external APIs.

Orchestrated scheduled data ingestion and transformation workflows using Apache Airflow DAGs.

Persisted processed data into PostgreSQL database for analytical use cases and reporting.

Containerized the entire pipeline using Docker to ensure reproducible and reliable execution across environments.`,
		shortDescription: 'End-to-end data pipeline with Apache Airflow',
		links: [],
		logo: Assets.Airflow,
		name: 'ETL Pipeline with Apache Airflow',
		period: {
			from: new Date(2024, 2, 1),
			to: new Date(2024, 3, 30)
		},
		skills: getSkills('python', 'airflow', 'postgresql', 'docker'),
		type: 'Data Pipeline',
	},
	{
		slug: 'smart-village-kkn',
		color: '#10b981',
		description: `Served as Public Relations Coordinator (Kormasit) in a 7-member KKN team for 40 days community service program.

Developed village tourism website with lightweight CMS using Google Sheets integration for easy content management.

Built web-based IoT monitoring dashboard to track maggot growth data using MQTT protocol.

Implemented backend APIs using Express.js and frontend interfaces with React for maintainable solutions.

Executed 7 individual programs and supported 30+ team programs during the community service period.`,
		shortDescription: 'Smart Village platform for Desa Pampang with tourism website and IoT dashboard',
		links: [],
		logo: Assets.ReactJs,
		name: 'Smart Village Platform - KKN UGM',
		period: {
			from: new Date(2025, 0, 1),
			to: new Date(2025, 1, 10)
		},
		skills: getSkills('reactjs', 'expressjs', 'mqtt', 'javascript', 'typescript'),
		type: 'Community Service Project',
	},
	{
		slug: 'whatsapp-reminder-bot',
		color: '#25D366',
		description: `Developed chatbot service in Golang to send scheduled reminders via WhatsApp and Telegram.

Implemented message handlers, scheduling logic using cron jobs, and external API integration.

Focused on backend automation and reliable message delivery with error handling and retry mechanisms.

Used WAHA (WhatsApp HTTP API) for seamless integration with messaging platforms.`,
		shortDescription: 'WhatsApp/Telegram reminder chatbot service in Go',
		links: [],
		logo: Assets.Go,
		name: 'WhatsApp Reminder Chatbot',
		period: {
			from: new Date(2024, 1, 1),
			to: new Date(2024, 2, 28)
		},
		skills: getSkills('golang'),
		type: 'Automation Service',
	},
	{
		slug: 'chat-backend-redis',
		color: '#DC382D',
		description: `Built backend service for real-time chat communication using Golang.

Implemented Redis as in-memory data store for caching active conversations and user sessions.

Used Redis Pub/Sub to support real-time message delivery between chat participants.

Designed structured HTTP REST APIs for message handling, persistence, and user management.

Improved response time and system responsiveness through Redis-based caching strategies.`,
		shortDescription: 'Real-time chat backend with Redis Pub/Sub',
		links: [],
		logo: Assets.Redis,
		name: 'Chat Backend Service',
		period: {
			from: new Date(2024, 0, 1),
			to: new Date(2024, 1, 28)
		},
		skills: getSkills('golang', 'redis'),
		type: 'Backend Service',
	},
	{
		slug: 'cultural-guide-app',
		color: '#3DDC84',
		description: `Developed Android application featuring interactive maps and location-based navigation for Prambanan Temple.

Implemented geofencing logic to trigger contextual cultural content based on user proximity to specific areas.

Integrated Firebase for user authentication, cloud data storage, and real-time synchronization.

Supported offline data access to improve user experience in areas with limited connectivity.`,
		shortDescription: 'Cultural guide mobile app with geofencing and offline support',
		links: [],
		logo: Assets.Android,
		name: 'Cultural Guide - Prambanan Temple',
		period: {
			from: new Date(2023, 10, 1),
			to: new Date(2023, 11, 30)
		},
		skills: getSkills('java', 'firebase', 'android'),
		type: 'Mobile Application',
	},
	{
		slug: 'iot-monitoring-capstone',
		color: '#660099',
		description: `Designed MQTT-based communication protocol for real-time data exchange between IoT devices and backend services.

Implemented data publishing and subscription flows using MQTT for sensor monitoring and system status tracking.

Developed web-based dashboard using React to visualize real-time and historical IoT sensor data.

Built backend services using Express.js to process MQTT messages and expose REST APIs for data access.

Integrated MQTT data flow with web applications to support comprehensive monitoring and analysis use cases.`,
		shortDescription: 'IoT monitoring system with MQTT and web dashboard',
		links: [],
		logo: Assets.MQTT,
		name: 'IoT Monitoring System',
		period: {
			from: new Date(2023, 8, 1),
			to: new Date(2023, 11, 30)
		},
		skills: getSkills('mqtt', 'reactjs', 'expressjs', 'javascript', 'typescript'),
		type: 'Capstone Project',
	}
];

const title = 'Projects';

const ProjectsData = { title, items };

export default ProjectsData;
