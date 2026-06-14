# Security Scan

A comprehensive, automated security scanning tool designed to identify vulnerabilities, misconfigurations, and security weaknesses in web applications and network infrastructure.

> **Disclaimer:** This tool is strictly intended for educational purposes and authorized security testing. The authors are not responsible for any misuse or damage caused by this tool. Do not use it against systems or networks for which you do not have explicit, written permission to test.

---

## Overview

This platform provides a centralized interface for performing various security reconnaissance and analysis tasks. It utilizes a distributed architecture consisting of a React frontend, a Node.js API, and Python-based microservices to handle heavy scanning workloads asynchronously.

---

## Key Features

- **IP Reconnaissance:** Gathers detailed information about target IP addresses.
- **Port Scanning:** Identifies open ports and services using integrated Nmap wrappers.
- **SSL/TLS Analysis:** Evaluates the security posture of SSL/TLS configurations.
- **Subdomain Enumeration:** Discovers subdomains using specialized engines like Amass and Subfinder.
- **Bug Bounty Recon Scans:** Adds DNS records, HTTP headers, CORS, tech stack detection, directory discovery, JS secret checks, well-known files, takeover fingerprints, archived URLs, WAF detection, and wrappers for common open-source tools.
- **Historical Tracking:** Stores and categorizes past scan results by target for longitudinal security monitoring.

---

## System Architecture

### Frontend
- **React (Vite):** Dashboard-driven user interface.
- **Context API:** Global state management for authentication and sockets.
- **Lucide React:** Icon system for UI consistency.

### Backend
- **Node.js & Express:** API routing and scan orchestration.
- **PostgreSQL:** Primary data store for scans and user data.
- **Socket.io:** Real-time communication for scan progress and results.
- **RabbitMQ (amqplib):** Message broker for async job distribution.

### Microservices
- **Python Workers:** Execute scanning logic asynchronously via a queue system.
- **pika:** RabbitMQ client for Python workers.
- **Engine Wrappers:** Integrations with specific engines (e.g., Nmap, Amass, Subfinder).

### Optional External Scanner Binaries
Some scans are native Python checks, while these wrappers call open-source binaries if they are installed in the worker container or host `PATH`:

- `nuclei` for template-based vulnerability scanning
- `httpx` for web probing and technology detection
- `naabu` for fast port discovery
- `katana` for crawling and endpoint discovery
- `dnsx` for DNS resolution
- `ffuf` for content discovery
- `gau` or `waybackurls` for archived URL discovery
- `wafw00f` for WAF detection
- `subzy` for takeover checks

If a binary is missing, the worker records a failed finding with an install hint instead of crashing.

---

## Environment Configuration

The application uses different environment variables depending on how you run it (locally vs. Docker). Each service has `.env.example` and `.env.docker` files.

### 1. Backend (`backend/`)
Create a `.env` file based on `.env.example` for local development, or use `.env.docker` for Docker.
- **Server:** `PORT=5000`
- **Database:** `DB_HOST`, `DB_USER`, `DB_DATABASE`, `DB_PASSWORD`, `DB_PORT`
- **Security:** `JWT_SECRET`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
- **Integrations:** `FRONTEND_URL`, `RABBITMQ_URL`

### 2. Frontend (`frontend/`)
Create a `.env` file based on `.env.example`.
- `VITE_API_URL`: Points to the backend API (e.g., `http://localhost:5000`).
- `VITE_SOCKET_URL`: Points to the backend Socket.io server (e.g., `http://localhost:5000`).

### 3. Microservices (`microservices/`)
Create a `.env` file based on `.env.example`.
- **Database:** `DB_HOST`, `DB_DATABASE`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`
- **Message Broker:** `RABBITMQ_HOST`

---

## Running with Docker (Recommended)

The easiest way to start the entire stack is using Docker Compose. This automatically builds all containers and networks them correctly using the configurations defined in their respective `.env.docker` files.

### Prerequisites
- Docker and Docker Compose installed.

### Steps
1. Navigate to the root directory.
2. Ensure you have the `docker-compose.yaml` present.
3. Build and run the services:
   ```bash
   docker compose up --build
   ```
4. Access the services:
   - **Frontend:** `http://localhost:80`
   - **Backend API:** `http://localhost:5000`
   - **RabbitMQ Management UI:** `http://localhost:15672` (Username/Password: default RabbitMQ credentials)
   - **PostgreSQL Database:** Exposed internally on port `5432`.

---

## Local Development Setup

If you prefer to run the services individually on your local machine, follow these steps.

### Prerequisites
- Node.js (v25+) and npm
- Python 3.12+
- PostgreSQL
- RabbitMQ

### 1. RabbitMQ Setup
You can run RabbitMQ independently via Docker:
```bash
docker run -it --rm \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:4-management
```

### 2. Database Setup
Ensure PostgreSQL is running and create a database corresponding to your `.env` configuration (default: `securityscan`).

### 3. Backend Setup
```bash
cd backend
cp .env.example .env # Update with your local database credentials
npm install
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### 5. Microservice Setup
```bash
cd microservices
cp .env.example .env # Update DB_HOST and RABBITMQ_HOST to localhost
pip install -r requirements.txt
python worker.py
```

---

## Scan Validation Rules

- **IP Targets:** `IP_RECON`, `IP_PORT_SCAN`, `HTTP_HEADERS`, `CORS_AUDIT`, `TECH_STACK`, `DIRECTORY_DISCOVERY`, `JS_SECRET_SCAN`, `NUCLEI_SCAN`, `HTTPX_PROBE`, `NAABU_SCAN`, `KATANA_CRAWL`, `FFUF_CONTENT_DISCOVERY`, `WAF_DETECTION`
- **Domain Targets:** `SSL/TLS`, `IP_PORT_SCAN`, `SUBDOMAIN_ENUM`, `DNS_RECORDS`, `HTTP_HEADERS`, `CORS_AUDIT`, `TECH_STACK`, `DIRECTORY_DISCOVERY`, `WELL_KNOWN_FILES`, `JS_SECRET_SCAN`, `SUBDOMAIN_TAKEOVER`, `NUCLEI_SCAN`, `HTTPX_PROBE`, `NAABU_SCAN`, `KATANA_CRAWL`, `DNSX_LOOKUP`, `FFUF_CONTENT_DISCOVERY`, `ARCHIVE_URLS`, `WAF_DETECTION`, `SUBZY_TAKEOVER`

---

## Summary

This project follows a distributed, asynchronous architecture using RabbitMQ for message brokering between the Node.js backend and Python workers. It ensures scalability for handling intensive security scanning tasks, while Docker simplifies orchestration and deployment.
