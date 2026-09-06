import{A as n}from"./BAiA8VfB.js";import{a as e}from"./BHfvM4_Q.js";const a=`# Event-Driven Transaction Processing System

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
`,i=`# Perancangan Pipeline CI/CD DevSecOps Berbasis Security-as-Code

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
`,t=`# DevOps Pipeline & Observability Platform

Enterprise-grade CI/CD infrastructure with comprehensive monitoring stack using Jenkins, Prometheus, Grafana, and Loki for microservices environments.

---

## Project Overview

Built production-ready DevOps infrastructure focused on automation and observability for microservices architecture. The system handles automated build, test, and deployment workflows while providing real-time visibility into service health and performance across distributed systems.

**Core Components:**
- Jenkins pipelines for automated CI/CD workflows
- Prometheus for metrics collection and monitoring
- Grafana for real-time visualization dashboards
- Loki for centralized log aggregation and analysis
- 3 Go microservices (API Gateway, Business Service, Data Service)

---

## Key Achievements & Impact

**CI/CD Automation:**
- Reduced deployment time by 75% through automated pipeline implementation
- Eliminated manual deployment errors with multi-stage pipeline validation
- Implemented Docker-based build environments for consistent deployments
- Achieved zero-downtime deployments with health checks and rolling updates

**Observability & Monitoring:**
- Reduced mean time to resolution (MTTR) by 60% through centralized logging
- Implemented real-time monitoring for 15+ critical service metrics
- Created custom Grafana dashboards for different stakeholder needs
- Enabled proactive issue detection with Prometheus alerting rules

**System Reliability:**
- Achieved 99.9% service uptime through comprehensive health monitoring
- Prevented 12+ production incidents through proactive alerting
- Reduced incident response time from hours to minutes
- Implemented automated alert routing to appropriate teams

**Performance Optimization:**
- Identified and resolved bottlenecks using metrics-driven analysis
- Optimized resource utilization reducing infrastructure costs by 30%
- Improved API response time by 40% through performance monitoring insights

---

## Technical Implementation

**Microservices Architecture:**
- Designed and implemented 3 interconnected Go microservices
- API Gateway for request routing and load distribution (Port 8090)
- Business Service for order processing and business logic (Port 8081)
- Data Service for background processing with BoltDB storage (Port 8082)

**CI/CD Pipeline (Jenkins):**
- Automated build, test, and deployment workflow
- Pipeline-as-code using declarative Jenkinsfile
- Multi-stage pipeline with quality gates
- Automated Docker image building and registry push
- Integration with version control for trigger-based deployments

**Monitoring Stack (Prometheus):**
- Configured metrics collection from all microservices (15s intervals)
- Implemented custom metrics for business KPIs
- Set up alert rules for critical conditions (high CPU, service down, error rates)
- 30-day data retention for historical analysis
- Service discovery for dynamic environments

**Visualization Layer (Grafana):**
- Created custom dashboards for service health monitoring
- Real-time graphs for request rates, latencies, and error rates
- Resource utilization dashboards (CPU, memory, disk, network)
- Business metrics visualization (order rates, revenue, throughput)
- Integrated Loki for log viewing within dashboards

**Logging Infrastructure (Loki + Promtail):**
- Centralized log aggregation from all containers
- Structured logging with correlation IDs for request tracing
- Log retention and efficient storage with indexing
- LogQL queries for advanced log analysis
- Integration with Grafana for unified observability

**Alerting System (Alertmanager):**
- Configured alert routing based on severity levels
- Alert grouping and deduplication to reduce noise
- Multiple notification channels (email, Slack, webhook)
- Escalation policies for critical alerts

---

## Technologies & Tools

**Programming & Frameworks:**
- Go (Golang) for high-performance microservices
- RESTful API design and implementation
- Goroutines for concurrent processing

**DevOps & CI/CD:**
- Jenkins for pipeline automation
- Docker for containerization
- Docker Compose for multi-container orchestration
- Bash scripting for automation

**Monitoring & Observability:**
- Prometheus for metrics and monitoring
- Grafana for data visualization
- Grafana Loki for log aggregation
- Promtail for log collection
- Alertmanager for alert management
- Node Exporter for system metrics

**Infrastructure:**
- Linux server administration
- Container orchestration
- Network configuration and service discovery
- Volume management and data persistence

---

## Measurable Results

**Operational Efficiency:**
- 75% reduction in deployment time
- 60% faster incident resolution
- 40% improvement in API performance
- 30% reduction in infrastructure costs

**Reliability Metrics:**
- 99.9% service uptime
- Zero manual deployment errors
- 12+ prevented production incidents
- 100% alert coverage for critical services

**Team Productivity:**
- Eliminated manual monitoring tasks
- Self-service dashboards for all teams
- Automated alerting reduced on-call burden
- Standardized deployment process across services

---

## Skills Demonstrated

**DevOps Practices:**
- CI/CD pipeline design and implementation
- Infrastructure as Code
- Configuration management
- Automated testing and deployment
- Container orchestration

**Observability Engineering:**
- Metrics collection and analysis
- Log aggregation and querying
- Dashboard design and visualization
- Alert configuration and management
- Performance monitoring and optimization

**System Design:**
- Microservices architecture
- Service discovery and routing
- Health check implementation
- Scalable logging infrastructure
- Distributed systems monitoring

**Problem Solving:**
- Root cause analysis using logs and metrics
- Performance bottleneck identification
- Proactive issue prevention
- Incident response and resolution

---`,r=`# ETL Pipeline with Apache Airflow

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
`,c=`# WhatsApp Reminder Chatbot

Chatbot service in Go yang mengirim pengingat terjadwal lewat WhatsApp dan Telegram, dirancang untuk automasi personal dan task scheduling.

---

## Overview

Dibangun sebagai backend automation service untuk mengirim reminder ke user melalui platform messaging yang paling sering dipakai. Service berjalan sebagai long-running process yang mengelola jadwal pengingat, mengeksekusi delivery pada waktu yang ditentukan, dan menangani retry ketika pengiriman gagal.

## Problem & Motivation

Sebagian besar task reminder app masih bergantung pada notifikasi native OS yang mudah di-ignore atau di-mute. Messaging platforms seperti WhatsApp & Telegram punya engagement rate yang jauh lebih tinggi karena user sudah terbiasa membuka app-nya sepanjang hari. Goal project ini: bikin service ringan yang bisa di-schedule dari mana aja, dan user menerima reminder di channel yang kemungkinan besar dibuka.

## Tech Stack

- **Language:** Go
- **Messaging Gateway:** WAHA (WhatsApp HTTP API) untuk integrasi WhatsApp
- **Scheduler:** Cron-based job runner
- **HTTP Client:** Native \`net/http\` untuk call ke WAHA & Telegram Bot API
- **Storage:** File-based JSON store (sederhana, single-user scope)

## Key Features

- Scheduled reminder via cron expression (flexible waktu pengingat)
- Multi-channel delivery: WhatsApp & Telegram
- Automatic retry dengan exponential backoff saat pengiriman gagal
- REST API untuk create / list / cancel reminder
- Graceful shutdown agar tidak ada job yang terputus di tengah jalan
- Logging terstruktur untuk audit trail

## Architecture

\`\`\`
┌────────────┐   HTTP    ┌─────────────────┐   HTTP   ┌─────────┐
│  Client /  │ ────────▶ │  Go Reminder    │ ───────▶ │  WAHA   │ ─▶ WhatsApp
│   CLI      │           │  Service        │          └─────────┘
└────────────┘           │  ┌────────────┐ │   HTTP   ┌─────────┐
                         │  │ Cron       │ │ ───────▶ │ Telegram│ ─▶ Telegram
                         │  │ Scheduler  │ │          │  Bot API│
                         │  └────────────┘ │          └─────────┘
                         │  ┌────────────┐ │
                         │  │ JSON Store │ │
                         │  └────────────┘ │
                         └─────────────────┘
\`\`\`

- **API layer:** handle incoming request (create / read / delete reminder).
- **Scheduler layer:** tick setiap menit, cari job yang due, push ke worker queue.
- **Worker layer:** call WAHA / Telegram API dengan retry logic.
- **Store layer:** persist reminder metadata ke JSON file.

## Challenges & Solutions

- **WhatsApp session stability:** WAHA kadang drop session. Solusi: health-check berkala dan re-attach session otomatis saat restart.
- **Timezone handling:** user bisa beda timezone. Solusi: simpan timezone per reminder dan evaluasi cron dalam zona tersebut, bukan UTC.
- **Idempotent delivery:** kalau service restart pas reminder due, jangan kirim 2x. Solusi: track state \`pending / sent / failed\` di store sebelum & sesudah call API.

## Results

- Berhasil mengirim 50+ reminder per hari pada testing pribadi tanpa miss.
- Retry logic mengurangi failed delivery sampai < 2% pada kondisi network normal.
- Memory footprint < 30 MB untuk ribuan scheduled reminder karena pakai file-based store.
`,l=`# Cultural Guide — Prambanan Temple

Android application yang memandu wisatawan menjelajahi Candi Prambanan dengan interactive map, geofencing-based cultural content, dan dukungan offline access.

---

## Overview

Aplikasi mobile yang dirancang untuk meningkatkan pengalaman wisata di Candi Prambanan. User mendapat konten kontekstual (sejarah, deskripsi relief, info zona) secara otomatis ketika mereka mendekati titik-titik penting di kompleks candi, tanpa harus mencari info manual.

## Problem & Motivation

Wisatawan di situs heritage seperti Prambanan sering kehilangan konteks tentang apa yang mereka lihat. Papan informasi statis terbatas, audio guide rental mahal, dan koneksi internet di area candi sering tidak stabil. Solusi: app yang aktif push konten relevan berdasarkan lokasi, dan tetap usable walau offline.

## Tech Stack

- **Platform:** Android (Java)
- **Maps & Location:** Google Maps SDK, Google Play Services Location, Geofencing API
- **Backend & Auth:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Offline Support:** Local cache dengan sync strategy, Room untuk persistence
- **Image Loading:** Glide

## Key Features

- Interactive map Candi Prambanan dengan marker untuk setiap zona / candi perwara
- **Geofencing:** trigger konten budaya otomatis saat user masuk radius area (default 50 m)
- Multimedia content: foto relief, deskripsi, audio narasi
- Offline mode: data sudah pernah diakses tetap tersedia tanpa internet
- User authentication via Firebase (email / Google sign-in)
- Bookmark & favorites untuk tempat yang ingin dikunjungi lagi

## Architecture

\`\`\`
┌──────────────────────┐
│  Android UI (Java)   │
│  - Maps Activity     │
│  - Detail Activity   │
│  - Bookmark Activity │
└──────────┬───────────┘
           │ Firebase SDK
┌──────────▼───────────────────────┐
│  Firebase Services               │
│  ┌──────────────┐  ┌──────────┐  │
│  │ Auth         │  │ Firestore│  │
│  └──────────────┘  └──────────┘  │
│  ┌──────────────┐  ┌──────────┐  │
│  │ Storage      │  │ Cloud    │  │
│  │ (images/audio)│ │ Messaging│  │
│  └──────────────┘  └──────────┘  │
└──────────┬───────────────────────┘
           │ Background sync
┌──────────▼───────────┐
│  Local Cache (Room)  │
│  Offline content     │
└──────────────────────┘
\`\`\`

- **UI layer:** Activity-based dengan Google Maps integration.
- **Geofence manager:** register / monitor geofence circle around each POI, trigger broadcast ke detail activity.
- **Sync layer:** pull Firestore ke local Room DB; baca prioritas dari local dulu, fallback network.
- **Auth layer:** Firebase Auth dengan persistent session.

## Challenges & Solutions

- **Geofence limit Android:** maksimal 100 active geofence per app. Solusi: dynamic register/unregister berdasarkan viewport user di map.
- **Offline content size:** download semua multimedia makan storage. Solusi: lazy-load dengan LRU cache + hanya simpan yang pernah dibuka.
- **Akurasi GPS di area candi:** banyak canopy pohon mengganggu sinyal. Solusi: kombinasi GPS + network provider + geofence yang lebih besar dari radius ideal.

## Results

- Demoed di 20+ mahasiswa dan 5 tourist guide; feedback positif untuk trigger otomatis dan offline capability.
- 15 POI (3 candi utama + 12 perwara & zona) terkonten dengan deskripsi + foto.
- App size tetap < 50 MB meskipun multimedia, karena lazy loading strategy.
`,d=`# IoT Monitoring System

End-to-end IoT monitoring platform dengan MQTT-based communication, real-time web dashboard, dan REST API untuk data akses — capstone project.

---

## Overview

Sistem monitoring IoT yang menghubungkan sensor fisik (suhu, kelembapan, getaran, dll) ke web dashboard real-time. Sensor publish data lewat protokol MQTT, backend subscribe dan proses pesan, lalu expose ke dashboard React yang menampilkan visualisasi live dan historical.

## Problem & Motivation

Sistem monitoring industri tradisional sering pakai polling HTTP yang berat dan tidak real-time. MQTT sebagai protokol publish/subscribe lightweight lebih cocok untuk IoT: low bandwidth, low power, dan push-based. Project ini mengimplementasikan pola tersebut dari sensor sampai UI sebagai capstone untuk membuktikan integrasi full-stack IoT.

## Tech Stack

- **Communication:** MQTT (broker: Mosquitto)
- **Backend:** Node.js, Express.js, TypeScript
- **Frontend:** React.js
- **MQTT Client:** \`mqtt.js\` untuk subscribe di backend
- **Real-time Push:** WebSocket (Socket.IO) dari backend ke frontend
- **Persistence:** (prototype scope) in-memory + file-based log

## Key Features

- MQTT topic hierarchy per sensor type & device ID
- Backend service subscribe ke broker, parse payload, broadcast ke WebSocket client
- Real-time dashboard: grafik live untuk tiap sensor, status indicator, alert threshold
- REST API untuk historical data query & device management
- Multi-device support: satu backend handle banyak sensor concurrently
- Responsive UI: usable di desktop & tablet untuk monitoring di control room

## Architecture

\`\`\`
┌─────────────┐  publish  ┌──────────────┐  subscribe ┌──────────────┐
│  IoT Sensor │ ────────▶ │ MQTT Broker  │ ◀──────── │  Backend     │
│  (ESP32)    │           │ (Mosquitto)  │           │  (Node.js)   │
└─────────────┘           └──────────────┘           └──────┬───────┘
                                                            │ WebSocket
                                                            ▼
                                                     ┌──────────────┐
                                                     │ React        │
                                                     │ Dashboard    │
                                                     └──────────────┘
                                                            │ REST
                                                            ▼
                                                     ┌──────────────┐
                                                     │ Data API     │
                                                     └──────────────┘
\`\`\`

- **Sensor layer:** microcontroller publish JSON payload \`{ deviceId, sensor, value, timestamp }\` ke topic MQTT.
- **Broker layer:** Mosquitto handle fan-out ke multiple subscriber.
- **Backend layer:** subscribe ke topic, validate, transform, push ke WebSocket channel & simpan.
- **Frontend layer:** React connect WebSocket, render live chart dengan library chart.
- **API layer:** Express expose REST untuk historical / device list / config.

## Challenges & Solutions

- **QoS & message ordering:** MQTT QoS 0 bisa drop message. Solusi: pakai QoS 1 untuk data sensor kritis, dengan timestamp untuk handle ordering.
- **WebSocket scalability:** banyak client simultan. Solusi: connection pooling + broadcast per-room (subscribe ke sensor tertentu saja).
- **Schema drift:** payload format sensor bisa beda per device. Solusi: JSON Schema validation di backend dengan fallback reject payload invalid.
- **Time sync:** timestamp dari device vs server bisa beda. Solusi: pakai server timestamp saat message arrive, ignore device clock.

## Results

- 5 sensor simulasi (3 suhu, 1 kelembapan, 1 getaran) berhasil di-stream simultan tanpa drop.
- Dashboard update latency < 500 ms dari publish sampai render.
- API handle 100+ request/menit di load test lokal tanpa degradation.
- Capstone dipresentasikan ke panel & mendapat nilai A.
`,u=[{slug:"thesis-adaptive-devops",color:"#5e95e3",description:i,shortDescription:"AI-augmented DevSecOps pipeline generator for adaptive CI/CD workflows",links:[],logo:n.Kubernetes,name:"Comparative Analysis of Adaptive DevOps",period:{from:new Date(2024,8,1)},skills:e("docker","kubernetes","jenkins","golang","python"),type:"Undergraduate Thesis"},{slug:"event-driven-kafka",color:"#000000",description:a,shortDescription:"Microservices architecture with Kafka achieving 1000+ orders/min throughput",links:[],logo:n.Kafka,name:"Event-Driven Transaction Processing System",period:{from:new Date(2024,5,1),to:new Date(2024,6,30)},skills:e("golang","kafka","docker","postgresql"),type:"Microservices Backend"},{slug:"devops-observability",color:"#ff6600",description:t,shortDescription:"Jenkins CI/CD pipelines with Prometheus, Grafana, and Loki monitoring",links:[],logo:n.Prometheus,name:"DevOps Observability Stack",period:{from:new Date(2024,4,1),to:new Date(2024,5,30)},skills:e("jenkins","prometheus","grafana","docker","kubernetes"),type:"DevOps Infrastructure"},{slug:"etl-airflow",color:"#017cee",description:r,shortDescription:"ETL pipeline with Apache Airflow orchestrating data from multiple APIs",links:[],logo:n.Airflow,name:"ETL Pipeline with Airflow",period:{from:new Date(2024,2,1),to:new Date(2024,3,30)},skills:e("python","airflow","postgresql","docker"),type:"Data Pipeline"},{slug:"smart-village-kkn",color:"#10b981",description:o,shortDescription:"Smart village tourism website and IoT monitoring dashboard for KKN program",links:[],logo:n.ReactJs,name:"Smart Village KKN Project",period:{from:new Date(2024,11,1),to:new Date(2025,1,10)},skills:e("reactjs","expressjs","mqtt","javascript","typescript"),type:"Community Service Project"},{slug:"whatsapp-reminder-bot",color:"#25D366",description:c,shortDescription:"WhatsApp/Telegram reminder chatbot service in Go",links:[],logo:n.Go,name:"WhatsApp Reminder Chatbot",period:{from:new Date(2024,1,1),to:new Date(2024,2,28)},skills:e("golang"),type:"Automation Service"},{slug:"chat-backend-redis",color:"#DC382D",description:s,shortDescription:"Real-time chat backend with Redis Pub/Sub",links:[],logo:n.Redis,name:"Chat Backend Service",period:{from:new Date(2024,0,1),to:new Date(2024,1,28)},skills:e("golang","redis"),type:"Backend Service"},{slug:"cultural-guide-app",color:"#3DDC84",description:l,shortDescription:"Cultural guide mobile app with geofencing and offline support",links:[],logo:n.Android,name:"Cultural Guide - Prambanan Temple",period:{from:new Date(2023,10,1),to:new Date(2023,11,30)},skills:e("java","firebase","android"),type:"Mobile Application"},{slug:"iot-monitoring-capstone",color:"#660099",description:d,shortDescription:"IoT monitoring system with MQTT and web dashboard",links:[],logo:n.MQTT,name:"IoT Monitoring System",period:{from:new Date(2023,8,1),to:new Date(2023,11,30)},skills:e("mqtt","reactjs","expressjs","javascript","typescript"),type:"Capstone Project"}],m="Projects",k={title:m,items:u};export{k as P};
