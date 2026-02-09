import Assets from './assets';
import { getSkills } from './skills';
import type { Project } from './types';
import eventDrivenKafkaMd from './md/event-driven-kafka.md?raw';
import thesisAdaptiveDevopsMd from './md/thesis-adaptive-devops.md?raw';
import devopsObservabilityMd from './md/devops-observability.md?raw';
import etlAirflowMd from './md/etl-airflow.md?raw';
import smartVillageKknMd from './md/smart-village-kkn.md?raw';
import chatBackendRedisMd from './md/chat-backend-redis.md?raw';

const items: Array<Project> = [
	{
		slug: 'thesis-adaptive-devops',
		color: '#5e95e3',
		description: thesisAdaptiveDevopsMd,
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
		description: eventDrivenKafkaMd,
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
		description: devopsObservabilityMd,
		shortDescription: 'Jenkins CI/CD pipelines with Prometheus, Grafana, and Loki monitoring',
		links: [],
		logo: Assets.Prometheus,
		name: 'DevOps Observability Stack',
		period: {
			from: new Date(2024, 4, 1),
			to: new Date(2024, 5, 30)
		},
		skills: getSkills('jenkins', 'prometheus', 'grafana', 'docker', 'kubernetes'),
		type: 'DevOps Infrastructure',
	},
	{
		slug: 'etl-airflow',
		color: '#017cee',
		description: etlAirflowMd,
		shortDescription: 'ETL pipeline with Apache Airflow orchestrating data from multiple APIs',
		links: [],
		logo: Assets.Airflow,
		name: 'ETL Pipeline with Airflow',
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
		description: smartVillageKknMd,
		shortDescription: 'Smart village tourism website and IoT monitoring dashboard for KKN program',
		links: [],
		logo: Assets.ReactJs,
		name: 'Smart Village KKN Project',
		period: {
			from: new Date(2024, 11, 1),
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
		description: chatBackendRedisMd,
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
