import{A as n}from"./Crkwnx4F.js";import{a as e}from"./DZWzpOQe.js";const i=`# Event-Driven Transaction Processing System

---

An event-driven backend system built with **Golang** and **Apache Kafka** to process e-commerce transactions asynchronously across three microservices. The system achieves **1000+ orders/minute** throughput with **<50ms response time** through parallel processing and message streaming.

<br/>

## 📊 Overview

Built a microservices architecture where Order, Payment, and Inventory services communicate through Kafka event streams instead of direct API calls. This approach eliminates bottlenecks and enables independent scaling of each component.

**Architecture Flow:**
\`\`\`
Client → Order Service (REST API)
              ↓
         Apache Kafka
         ↙         ↘
Payment Service   Inventory Service
     ↓                 ↓
PostgreSQL        PostgreSQL
\`\`\`

<!-- Contoh menambahkan gambar architecture diagram -->
<!-- ![Architecture Diagram](/screenshots/event-driven-kafka/architecture.png) -->

Each service operates independently - the Order Service immediately returns a response while Payment and Inventory services process events in parallel in the background.

<br/>

## 🎯 Key Achievements

**Performance:**
- Response time reduced from ~2 seconds to <50ms (95% improvement)
- Handles 1000+ orders per minute consistently
- Error rate maintained below 0.1% under load
- System remains stable during traffic spikes

**Architecture:**
- Three independent microservices with separate databases
- Producer-consumer pattern using Kafka topics and partitions
- Consumer groups for horizontal scaling
- Retry mechanisms with exponential backoff

**Reliability:**
- Fault isolation - service failures don't cascade
- Message persistence in Kafka
- Manual offset management for guaranteed delivery
- Structured logging for distributed tracing

<br/>

## 🛠️ Technical Implementation

### Microservices Design

**Order Service** acts as the API gateway and Kafka producer:
- Validates incoming requests
- Publishes order events to Kafka
- Returns immediate response (non-blocking)

**Payment & Inventory Services** consume events independently:
- Listen to specific Kafka topics
- Process messages in parallel
- Each maintains its own PostgreSQL database
- Publish completion events back to Kafka

### Kafka Configuration

Used topic partitioning with \`customer_id\` as partition key to:
- Ensure message ordering per customer
- Distribute load across consumer instances
- Enable parallel processing of different customers

Consumer groups allow multiple instances of each service to process different partitions simultaneously for horizontal scaling.

### Error Handling

Implemented retry logic with exponential backoff for transient failures. Messages are committed to Kafka only after successful processing to prevent data loss during consumer restarts.

<br/>

## 🧪 Testing & Results

Conducted comprehensive load testing using **k6** with multiple scenarios:
- Load test: baseline performance under normal conditions
- Stress test: finding system breaking points (0→100 concurrent users)
- Spike test: handling sudden traffic surges
- Soak test: long-term stability validation

Results demonstrate the system handles traffic spikes gracefully while maintaining low response times and minimal errors.

<br/>

## 💡 Key Learnings

**Event-Driven Architecture:**
- Trades immediate consistency for massive scalability gains
- Asynchronous communication eliminates API bottlenecks
- Requires different approach to observability and debugging

**Kafka Insights:**
- Partition strategy critical for both performance and ordering
- Consumer groups enable elastic scaling
- Offset management essential for reliability

**System Design:**
- Database-per-service pattern maintains service independence
- Parallel processing dramatically improves throughput
- Proper testing reveals real-world bottlenecks before production

<br/>

## 🔧 Tech Stack

- **Golang** - Backend services and concurrent processing
- **Apache Kafka** - Event streaming and message broker
- **PostgreSQL** - Database for each microservice
- **Docker Compose** - Local development and orchestration
- **k6** - Load and performance testing
- **Uber Zap** - Structured logging

<br/>

---

*Microservices architecture demonstrating event-driven design with Kafka for high-throughput transaction processing*
`,a=`# Perancangan Pipeline CI/CD DevSecOps Berbasis Security-as-Code

**Mengacu pada Secure Development Lifecycle**

---

DevSecOps pipeline CI/CD yang mengintegrasikan keamanan sebagai kode (security-as-code) dengan mengacu pada prinsip Secure Development Lifecycle (SDL) dan standar ISA/IEC 62443-4-1. Penelitian tugas akhir yang memastikan penerapan keamanan yang konsisten, otomatis, dan dapat diverifikasi sebelum deployment ke lingkungan staging.

<br/>

## Project Overview

Penelitian dan implementasi pipeline CI/CD DevSecOps yang mengintegrasikan aspek keamanan secara sistematis dan terstandarisasi ke dalam setiap tahapan pipeline. Sistem ini mengadopsi prinsip security-as-code dan Secure Development Lifecycle untuk memastikan bahwa keamanan bukan lagi tahapan terpisah atau ad-hoc, melainkan bagian integral dari proses CI/CD.

**Core Innovation:**
- Security-as-Code: Aturan keamanan sebagai bagian konfigurasi pipeline yang otomatis dan konsisten
- Secure Development Lifecycle Integration: Tahapan keamanan terintegrasi dari design hingga verification
- Automated Security Validation: Static analysis, dependency scanning, dan container security scanning otomatis
- Quality Gate & Human-in-the-Loop: Mekanisme approval untuk memastikan kesiapan keamanan sebelum deployment

<br/>

## Research Background & Problem Statement

**Latar Belakang:**

Praktik DevOps modern telah mendorong otomatisasi deployment melalui pipeline CI/CD. Namun, aspek keamanan sering kali masih diperlakukan sebagai tahapan terpisah atau ditambahkan secara ad-hoc, sehingga:
- Berpotensi menimbulkan celah keamanan
- Tidak konsisten antar proyek atau tim
- Sulit diaudit dan dilacak (non-traceable)
- Bergantung pada praktik manual dan pengalaman individu

**Permasalahan:**

Belum banyak pipeline CI/CD yang secara eksplisit mengadopsi prinsip Secure Development Lifecycle (SDL) dan memetakkannya ke dalam tahapan CI/CD sebagai security-as-code. Keamanan masih sering menjadi afterthought, bukan built-in security.

**Tujuan Penelitian:**

Merancang dan mengimplementasikan pipeline CI/CD DevSecOps yang:
1. Mengintegrasikan keamanan sebagai security-as-code
2. Mengadopsi prinsip Secure Development Lifecycle
3. Mengacu pada standar ISA/IEC 62443-4-1
4. Memastikan konsistensi dan verifikasi keamanan sebelum deployment

<br/>

## Key Achievements

**Research Contribution:**
- Model penerapan DevSecOps yang praktis dan terstandarisasi untuk pipeline CI/CD
- Pemetaan tahapan Secure Development Lifecycle ke dalam pipeline CI/CD
- Metodologi security-as-code yang konsisten dan dapat diaudit
- Analisis perbandingan pipeline dengan dan tanpa DevSecOps

**Technical Implementation:**
- Automated Security Scanning: Static code analysis, dependency vulnerability scanning, container image security scanning
- Security Quality Gates: Otomatis memblokir deployment jika ditemukan critical vulnerabilities
- Security Readiness Report: Laporan komprehensif sebagai bukti verifikasi keamanan
- Human-in-the-Loop Approval: Mekanisme approval untuk deployment ke staging
- Jenkins Pipeline as Code: Pipeline dikonfigurasi sebagai kode yang versioned dan auditable

**Impact & Findings:**
- Peningkatan konsistensi penerapan security checks di setiap deployment
- Deteksi early vulnerability sebelum sampai ke production
- Traceability lengkap untuk audit dan compliance requirements
- Standardisasi security practices yang dapat direplikasi

<br/>

## DevSecOps Pipeline Architecture

**Pipeline Stages dengan Security Integration:**

1. **Source Code Analysis (SAST)**
   - Static Application Security Testing
   - Code quality dan security vulnerability detection
   - Compliance dengan coding standards

2. **Dependency Security Scanning**
   - Analisis third-party dependencies
   - CVE (Common Vulnerabilities and Exposures) detection
   - License compliance checking

3. **Container Image Security**
   - Image vulnerability scanning
   - Base image security validation
   - Security best practices verification

4. **Build & Test**
   - Automated unit dan integration tests
   - Security-focused test cases
   - Test coverage validation

5. **Security Quality Gate**
   - Automated decision berdasarkan security findings
   - Blocking deployment jika critical issues ditemukan
   - Generate security readiness report

6. **Human-in-the-Loop Approval**
   - Manual review untuk deployment ke staging
   - Verification terhadap security report
   - Documented approval trail

7. **Staging Deployment**
   - Deploy ke Kubernetes staging environment
   - Runtime security monitoring
   - Health check dan observability validation

<br/>

## Technical Stack & Tools

**CI/CD & Orchestration:**
- **Jenkins:** Pipeline orchestration dan automation
- **Kubernetes:** Staging environment deployment
- **Docker:** Container packaging dan distribution
- **Helm:** Kubernetes package management

**Security Tools:**
- **Trivy:** Container image vulnerability scanning
- **SonarQube/Semgrep:** Static Application Security Testing (SAST)
- **Dependency-Check/Snyk:** Dependency vulnerability scanning
- **OWASP ZAP:** Dynamic security testing (optional)

**Monitoring & Observability:**
- **Prometheus:** Metrics collection
- **Grafana:** Visualization dan dashboards
- **ELK Stack:** Log aggregation dan analysis
- **Filebeat:** Log shipping

**Infrastructure as Code:**
- **Kubernetes Manifests:** Deployment configurations
- **Jenkinsfile:** Pipeline as Code
- **Shell Scripts:** Automation utilities

<br/>

## Research Methodology

**Pendekatan:**
Rekayasa perangkat lunak (software engineering research) melalui design dan implementasi pipeline CI/CD DevSecOps.

**Tahapan Penelitian:**

1. **Literature Review**
   - Study Secure Development Lifecycle (SDL)
   - Analisis standar ISA/IEC 62443-4-1
   - Review best practices DevSecOps

2. **Design & Architecture**
   - Perancangan pipeline stages
   - Pemetaan SDL ke CI/CD stages
   - Selection security tools dan integration points

3. **Implementation**
   - Setup Jenkins dan security tools
   - Konfigurasi pipeline as code
   - Integration dengan Kubernetes staging

4. **Testing & Validation**
   - Functional testing pipeline
   - Security validation testing
   - Performance dan reliability testing

5. **Analysis & Comparison**
   - Comparative analysis: pipeline tanpa vs dengan DevSecOps
   - Dokumentasi findings dan lessons learned
   - Generate security readiness reports

**Ruang Lingkup:**
- Fokus pada design-time dan verification security
- Pipeline hingga deployment ke staging environment
- Runtime security di production tidak menjadi fokus utama
- Emphasis pada konsistensi, kelengkapan, dan traceability

<br/>

## Results & Analysis

**Security Readiness Report:**

Pipeline menghasilkan laporan komprehensif yang mencakup:
- **SAST Results:** Static code analysis findings
- **Dependency Scan:** Known vulnerabilities in dependencies
- **Container Security:** Image vulnerability assessment
- **Compliance Status:** Adherence to security standards
- **Approval Trail:** Human verification records

**Comparative Analysis:**

| Aspek | Pipeline Tanpa DevSecOps | Pipeline Dengan DevSecOps |
|-------|--------------------------|---------------------------|
| Security Checks | Manual, inkonsisten | Otomatis, konsisten |
| Vulnerability Detection | Post-deployment | Pre-deployment |
| Audit Trail | Tidak lengkap | Fully traceable |
| Deployment Safety | Risiko tinggi | Validated & approved |
| Time to Fix | Lambat (di production) | Cepat (di pipeline) |

**Key Findings:**
- Security-as-code meningkatkan konsistensi penerapan security checks
- Early detection mengurangi cost of vulnerability remediation
- Automated quality gates mencegah vulnerable code masuk staging
- Traceability lengkap mendukung compliance dan audit requirements

<br/>

## Key Learnings

**DevSecOps Implementation:**
- Shift-left security: integrate security early in SDLC
- Automation adalah kunci konsistensi security practices
- Security-as-code memungkinkan versioning dan audit trail
- Balance antara automation dan human oversight sangat penting

**Pipeline Design:**
- Quality gates harus clear dan actionable
- Security reports harus comprehensive namun readable
- Pipeline harus fail-fast untuk critical security issues
- Observability dan logging essential untuk troubleshooting

**Security Standards:**
- SDL principles dapat dipetakan ke CI/CD stages
- Standar seperti ISA/IEC 62443-4-1 memberikan framework yang solid
- Compliance bukan hanya checklist, tapi cultural practice

**Research Skills:**
- Metodologi comparative analysis untuk evaluasi effectiveness
- Documentation dan reporting untuk academic contribution
- Hands-on implementation untuk validate theoretical design

<br/>

## Contribution & Future Work

**Kontribusi Penelitian:**
- Model praktis penerapan DevSecOps dengan security-as-code
- Pemetaan konkret SDL principles ke pipeline CI/CD
- Template pipeline yang dapat direplikasi untuk proyek lain
- Dokumentasi akademik untuk referensi penelitian selanjutnya

**Future Enhancements:**
- Runtime security monitoring di production environment
- Integration dengan DAST (Dynamic Application Security Testing)
- Automated security policy enforcement dengan OPA (Open Policy Agent)
- Machine learning untuk predictive security analytics
- Extended compliance coverage (PCI-DSS, GDPR, dll)

<br/>

---

**Research Context:** Undergraduate thesis (Tugas Akhir S1) - Computer Science/Informatics

**Focus Area:** DevSecOps, CI/CD Pipeline, Security-as-Code, Secure Development Lifecycle

**Standard Reference:** ISA/IEC 62443-4-1

*Demonstrating advanced DevSecOps engineering capabilities and research methodology in software security*
`,t=`# DevOps Pipeline & Observability

---

Enterprise-grade CI/CD infrastructure with comprehensive monitoring stack using Jenkins, Prometheus, Grafana, and Loki for microservices environments.

<br/>

## 📊 Overview

Built production-ready DevOps infrastructure focused on automation and observability. The system handles automated build, test, and deployment workflows while providing real-time visibility into service health and performance.

**Key Components:**
- Jenkins pipelines for automated deployments
- Prometheus for metrics collection
- Grafana for visualization dashboards
- Loki for centralized log aggregation

<br/>

## 🎯 Achievements

**CI/CD Automation:**
- Automated build and deployment workflows
- Multi-stage pipeline with testing gates
- Docker-based build environments
- Kubernetes deployment automation

**Observability Infrastructure:**
- Real-time service health monitoring
- Resource usage tracking (CPU, memory, disk)
- Centralized application logging
- Custom dashboards for different services

**System Reliability:**
- Observability-driven debugging reduced incident resolution time
- Proactive alerting prevented production issues
- Performance metrics guided optimization efforts

<br/>

## 🛠️ Tech Stack

- **Jenkins** - CI/CD pipeline orchestration
- **Prometheus** - Metrics collection and storage
- **Grafana** - Data visualization and dashboards
- **Loki** - Log aggregation and querying
- **Docker** - Containerization
- **Kubernetes** - Container orchestration

<br/>

## 💡 Key Learnings

**Observability Principles:**
- Metrics, logs, and traces are essential for production systems
- Centralized monitoring reduces time to identify issues
- Dashboards must be tailored to specific audiences

**DevOps Best Practices:**
- Automation reduces deployment errors
- Pipeline stages should fail fast
- Monitoring should be part of the deployment process

<br/>

---

*Production-grade DevOps infrastructure demonstrating automation and observability expertise*
`,r=`# ETL Pipeline with Apache Airflow

---

Automated data pipeline for scheduled ingestion, transformation, and storage of data from multiple external APIs using Apache Airflow orchestration.

<br/>

## 📊 Overview

Developed end-to-end ETL (Extract, Transform, Load) pipeline to automate data collection from external APIs, apply transformations, and persist results to PostgreSQL database. The system runs on scheduled intervals using Apache Airflow for workflow orchestration.

**Pipeline Flow:**
\`\`\`
External APIs → Airflow DAG → Data Transformation → PostgreSQL → Analytics
\`\`\`

<br/>

## 🎯 Achievements

**Data Integration:**
- Integrated multiple external API sources
- Implemented error handling for API failures
- Automated retry mechanisms for failed requests

**Workflow Automation:**
- Scheduled data ingestion using Airflow DAGs
- Task dependencies and parallel execution
- Monitoring and alerting for pipeline failures

**Data Processing:**
- Transformation logic for data cleaning and normalization
- Efficient data loading to PostgreSQL
- Schema management and versioning

**Reliability:**
- Docker containerization for reproducible execution
- Environment-agnostic deployment
- Logging and monitoring for pipeline health

<br/>

## 🛠️ Tech Stack

- **Python** - ETL logic and data processing
- **Apache Airflow** - Workflow orchestration
- **PostgreSQL** - Data warehouse
- **Docker** - Containerization

<br/>

## 💡 Key Learnings

**ETL Design:**
- Idempotent operations prevent duplicate data
- Error handling is critical for external API integration
- Data validation should happen at multiple stages

**Airflow Best Practices:**
- DAG design affects maintainability and debugging
- Task parallelization improves pipeline performance
- Monitoring and alerting prevent silent failures

**Data Engineering:**
- Schema design impacts query performance
- Incremental loading reduces processing time
- Documentation is essential for complex workflows

<br/>

---

*Data pipeline demonstrating automation and data engineering capabilities*
`,o=`# Smart Village Platform - KKN UGM

---

Community service project developing digital solutions for Desa Pampang including tourism website and IoT monitoring dashboard. Served as Public Relations Coordinator managing team communications and programs.

<br/>

## 📊 Project Overview

Led technology initiatives during 40-day community service program (KKN UGM) in Desa Pampang. Developed two main solutions: village tourism website with CMS and IoT monitoring dashboard for maggot cultivation tracking.

**Role:** Public Relations Coordinator (Kormasit) + Software Developer

<br/>

## 🎯 Achievements

**Leadership & Coordination:**
- Managed communications for 7-member team
- Coordinated 7 individual programs
- Supported 30+ team programs during service period
- Facilitated community engagement and stakeholder communication

**Technical Solutions:**

**1. Village Tourism Website**
- Lightweight CMS using Google Sheets integration
- Non-technical users can update content easily
- Responsive design for mobile accessibility
- Showcases local culture and tourist attractions

**2. IoT Monitoring Dashboard**
- Real-time maggot growth tracking
- MQTT protocol for sensor data collection
- Web-based visualization dashboard
- Historical data analysis and reporting

**Technology Stack:**
- React for frontend interfaces
- Express.js for backend APIs
- MQTT for IoT communication
- Google Sheets API for content management

<br/>

## 💡 Impact

**Community:**
- Empowered local community with digital tools
- Improved village tourism promotion
- Enhanced maggot cultivation monitoring efficiency

**Technical:**
- Delivered maintainable solutions for non-technical users
- Implemented appropriate technology for resource constraints
- Balanced simplicity with functionality

<br/>

## 🎓 Key Learnings

**Soft Skills:**
- Cross-functional team coordination
- Stakeholder communication
- Community engagement strategies
- Project management in resource-limited environments

**Technical:**
- User-centered design for non-technical audiences
- Appropriate technology selection for context
- Building sustainable solutions with minimal maintenance

**Social Impact:**
- Technology can empower communities
- Simple solutions often work best
- Local ownership ensures long-term success

<br/>

---

*Community service project demonstrating leadership, social impact, and practical software development*
`,s=`# Realtime Transaction Notification System

---

A fintech-grade backend system built with **Golang**, **Fiber**, and **Redis**, designed to deliver real-time, reliable, and fault-tolerant transaction notifications to users. Implements WebSocket for instant delivery, Pub/Sub for event broadcasting, and intelligent retry mechanisms for guaranteed message delivery.

<br/>

## 📊 Overview

Enterprise-grade notification system providing instant transaction updates to mobile and web applications. Utilizes WebSocket for real-time communication, Redis Pub/Sub for event distribution, and queue-based retry mechanisms to ensure at-least-once delivery guarantee even when users are offline.

**Architecture:** RESTful API + WebSocket Hub + Redis Pub/Sub with Retry Worker

<br/>

## 🎯 Key Features

**Real-Time Delivery:**
- WebSocket-based instant notifications
- Sub-second notification latency
- Support for multiple client connections per user
- Connection state management and recovery
- Message acknowledgment tracking

**Reliability & Fault Tolerance:**
- At-least-once delivery guarantee
- Offline queue for disconnected users
- Exponential backoff retry mechanism
- Message deduplication
- Dead letter queue for failed messages
- Graceful handling of network failures

**API Capabilities:**
- Transaction event publishing
- Mock transaction generation for testing
- System health monitoring
- WebSocket statistics and metrics
- Active connection tracking
- Comprehensive API documentation (Swagger)

<br/>

## 🛠️ Technical Implementation

**Backend Framework:**
- **Golang** - High-performance concurrent processing
- **Fiber** - Blazing-fast HTTP web framework
- **Goroutines** - Efficient concurrent connection handling
- **Channels** - Safe inter-goroutine communication

**Real-Time Layer:**
- **WebSocket** - Persistent bidirectional communication
- **WebSocket Hub** - Centralized connection management
- **Redis Pub/Sub** - Event broadcasting and distribution
- **Message Queue** - Offline and retry queue management

**Data Layer:**
- **Redis Pub/Sub** - Transaction event broadcasting
- **Redis Lists** - Offline and retry message queues
- **Redis Sets** - Message deduplication tracking
- **Connection Pool** - Optimized Redis connections

**Observability:**
- **Zap Logger** - Structured, high-performance logging
- **Health Checks** - Service health monitoring
- **Metrics** - System and connection statistics

<br/>

## 💡 Architecture Design

**Transaction Flow:**
\`\`\`
Transaction API → Transaction Service → Redis Pub/Sub
                                            ↓
                                  Redis Subscriber
                                    ↓           ↓
                            WebSocket Hub   Offline Queue
                                    ↓
                            Connected Clients
\`\`\`

**Retry Flow:**
\`\`\`
Failed Delivery → Retry Queue → Retry Worker
                                      ↓
                        Exponential Backoff (1s, 2s, 4s, 8s, 16s)
                                      ↓
                        Retry Attempt → Success/DLQ
\`\`\`

**WebSocket Hub Pattern:**
- Centralized connection management
- User-to-connections mapping (one-to-many)
- Efficient message broadcasting and filtering
- Automatic cleanup of stale connections

**Queue Strategy:**
- **Offline Queue:** Stores messages for disconnected users
- **Retry Queue:** Handles delivery failures with exponential backoff
- **Dead Letter Queue:** Captures messages that exceeded retry limit

<br/>

## 📈 Performance Results

**Metrics Achieved:**
- Notification delivery: <100ms latency
- Concurrent WebSocket connections: 10,000+ users
- Message throughput: 5,000+ transactions/second
- Delivery success rate: >99.9%
- Retry success rate: >95% on first retry

**Optimization Techniques:**
- Connection pooling to Redis
- Goroutine-based concurrent processing
- Efficient memory management with context cancellation
- Channel buffering for high-throughput scenarios
- Automatic connection cleanup and resource management

<br/>

## 🧪 Key Functionalities

**Transaction Publishing:**
- Publish transaction events via REST API
- Support for multiple transaction types (TOPUP, TRANSFER, PAYMENT, WITHDRAWAL)
- Custom metadata attachment
- Timestamp tracking and validation

**WebSocket Management:**
- User connection registration
- Multi-device support (multiple connections per user)
- Connection heartbeat and keep-alive
- Graceful disconnection handling
- Message acknowledgment system

**Notification Delivery:**
- Real-time push to connected clients
- Automatic queueing for offline users
- Delivery confirmation tracking
- Message deduplication by transaction ID
- Retry with exponential backoff

**Monitoring & Observability:**
- Real-time connection statistics
- Message delivery metrics
- System health endpoints
- Structured logging with trace IDs
- Error tracking and alerting

<br/>

## 🚧 Technical Challenges & Solutions

**Challenge: Guaranteed Delivery**
- Problem: Ensuring notifications reach users even during network failures
- Solution: Offline queue + retry worker with exponential backoff + at-least-once guarantee

**Challenge: Message Duplication**
- Problem: Preventing same notification from being delivered multiple times
- Solution: Redis Set-based deduplication with message ID tracking

**Challenge: Connection Scalability**
- Problem: Managing thousands of concurrent WebSocket connections efficiently
- Solution: Hub-Spoke pattern + goroutine per connection + efficient channel communication

**Challenge: Fault Tolerance**
- Problem: Handling Redis failures and service disruptions gracefully
- Solution: Connection pooling + automatic reconnection + circuit breaker pattern

**Challenge: Offline User Handling**
- Problem: Delivering accumulated notifications when user reconnects
- Solution: Persistent offline queue + batch delivery on reconnection

<br/>

## 🎓 Key Learnings

**Distributed Systems:**
- At-least-once delivery patterns
- Message queue implementations
- Retry mechanisms and backoff strategies
- Deduplication techniques

**WebSocket Management:**
- Connection lifecycle handling
- Heartbeat and keep-alive mechanisms
- Graceful disconnection and cleanup
- Hub-Spoke architectural pattern

**Golang Concurrency:**
- Goroutine management and pooling
- Channel-based communication patterns
- Context-based cancellation
- Race condition prevention with sync primitives

**Redis Patterns:**
- Pub/Sub for event broadcasting
- Lists for queue implementation
- Sets for deduplication
- Connection pooling for performance

**Production-Ready Features:**
- Structured logging for observability
- Health checks and monitoring
- Graceful shutdown handling
- Docker containerization

<br/>

## 🔧 Tech Stack

- **Golang** - Primary programming language
- **Fiber** - High-performance web framework
- **WebSocket** - Real-time bidirectional communication
- **Redis** - Pub/Sub, queuing, and caching
- **Zap** - Structured logging
- **Docker** - Containerization and deployment
- **Swagger** - API documentation

<br/>

---

*Production-ready notification system demonstrating fintech-grade reliability and real-time capabilities*
`,c=[{slug:"thesis-adaptive-devops",color:"#5e95e3",description:a,shortDescription:"AI-augmented DevSecOps pipeline generator for adaptive CI/CD workflows",links:[],logo:n.Kubernetes,name:"Comparative Analysis of Adaptive DevOps",period:{from:new Date(2024,8,1)},skills:e("docker","kubernetes","jenkins","golang","python"),type:"Undergraduate Thesis"},{slug:"event-driven-kafka",color:"#000000",description:i,shortDescription:"Microservices architecture with Kafka achieving 1000+ orders/min throughput",links:[],logo:n.Kafka,name:"Event-Driven Transaction Processing System",period:{from:new Date(2024,5,1),to:new Date(2024,6,30)},skills:e("golang","kafka","docker","postgresql"),type:"Microservices Backend"},{slug:"devops-observability",color:"#ff6600",description:t,shortDescription:"Jenkins CI/CD pipelines with Prometheus, Grafana, and Loki monitoring",links:[],logo:n.Prometheus,name:"DevOps Observability Stack",period:{from:new Date(2024,4,1),to:new Date(2024,5,30)},skills:e("jenkins","prometheus","grafana","docker","kubernetes"),type:"DevOps Infrastructure"},{slug:"etl-airflow",color:"#017cee",description:r,shortDescription:"ETL pipeline with Apache Airflow orchestrating data from multiple APIs",links:[],logo:n.Airflow,name:"ETL Pipeline with Airflow",period:{from:new Date(2024,2,1),to:new Date(2024,3,30)},skills:e("python","airflow","postgresql","docker"),type:"Data Pipeline"},{slug:"smart-village-kkn",color:"#10b981",description:o,shortDescription:"Smart village tourism website and IoT monitoring dashboard for KKN program",links:[],logo:n.ReactJs,name:"Smart Village KKN Project",period:{from:new Date(2024,11,1),to:new Date(2025,1,10)},skills:e("reactjs","expressjs","mqtt","javascript","typescript"),type:"Community Service Project"},{slug:"whatsapp-reminder-bot",color:"#25D366",description:`Developed chatbot service in Golang to send scheduled reminders via WhatsApp and Telegram.

Implemented message handlers, scheduling logic using cron jobs, and external API integration.

Focused on backend automation and reliable message delivery with error handling and retry mechanisms.

Used WAHA (WhatsApp HTTP API) for seamless integration with messaging platforms.`,shortDescription:"WhatsApp/Telegram reminder chatbot service in Go",links:[],logo:n.Go,name:"WhatsApp Reminder Chatbot",period:{from:new Date(2024,1,1),to:new Date(2024,2,28)},skills:e("golang"),type:"Automation Service"},{slug:"chat-backend-redis",color:"#DC382D",description:s,shortDescription:"Real-time chat backend with Redis Pub/Sub",links:[],logo:n.Redis,name:"Chat Backend Service",period:{from:new Date(2024,0,1),to:new Date(2024,1,28)},skills:e("golang","redis"),type:"Backend Service"},{slug:"cultural-guide-app",color:"#3DDC84",description:`Developed Android application featuring interactive maps and location-based navigation for Prambanan Temple.

Implemented geofencing logic to trigger contextual cultural content based on user proximity to specific areas.

Integrated Firebase for user authentication, cloud data storage, and real-time synchronization.

Supported offline data access to improve user experience in areas with limited connectivity.`,shortDescription:"Cultural guide mobile app with geofencing and offline support",links:[],logo:n.Android,name:"Cultural Guide - Prambanan Temple",period:{from:new Date(2023,10,1),to:new Date(2023,11,30)},skills:e("java","firebase","android"),type:"Mobile Application"},{slug:"iot-monitoring-capstone",color:"#660099",description:`Designed MQTT-based communication protocol for real-time data exchange between IoT devices and backend services.

Implemented data publishing and subscription flows using MQTT for sensor monitoring and system status tracking.

Developed web-based dashboard using React to visualize real-time and historical IoT sensor data.

Built backend services using Express.js to process MQTT messages and expose REST APIs for data access.

Integrated MQTT data flow with web applications to support comprehensive monitoring and analysis use cases.`,shortDescription:"IoT monitoring system with MQTT and web dashboard",links:[],logo:n.MQTT,name:"IoT Monitoring System",period:{from:new Date(2023,8,1),to:new Date(2023,11,30)},skills:e("mqtt","reactjs","expressjs","javascript","typescript"),type:"Capstone Project"}],l="Projects",m={title:l,items:c};export{m as P};
