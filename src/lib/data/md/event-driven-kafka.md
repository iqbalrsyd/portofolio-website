# Event-Driven Transaction Processing System

---

An event-driven backend system built with **Golang** and **Apache Kafka** to process e-commerce transactions asynchronously across three microservices. The system achieves **1000+ orders/minute** throughput with **<50ms response time** through parallel processing and message streaming.

<br/>

## 📊 Overview

Built a microservices architecture where Order, Payment, and Inventory services communicate through Kafka event streams instead of direct API calls. This approach eliminates bottlenecks and enables independent scaling of each component.

**Architecture Flow:**
```
Client → Order Service (REST API)
              ↓
         Apache Kafka
         ↙         ↘
Payment Service   Inventory Service
     ↓                 ↓
PostgreSQL        PostgreSQL
```

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

Used topic partitioning with `customer_id` as partition key to:
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
