# Security Scan Project

A comprehensive, automated security scanning tool designed to identify
vulnerabilities, misconfigurations, and security weaknesses in web
applications and network infrastructure.

> **Disclaimer:** This tool is strictly intended for educational
> purposes and authorized security testing. The authors are not
> responsible for any misuse or damage caused by this tool. Do not use
> it against systems or networks for which you do not have explicit,
> written permission to test.

------------------------------------------------------------------------

## Overview

This platform provides a centralized interface for performing various
security reconnaissance and analysis tasks. It utilizes a distributed
architecture consisting of a React frontend, a Node.js API, and
Python-based microservices to handle heavy scanning workloads
asynchronously.

------------------------------------------------------------------------

## Key Features

-   **IP Reconnaissance:** Gathers detailed information about target IP
    addresses.
-   **Port Scanning:** Identifies open ports and services using
    integrated Nmap wrappers.
-   **SSL/TLS Analysis:** Evaluates the security posture of SSL/TLS
    configurations.
-   **Subdomain Enumeration:** Discovers subdomains using specialized
    engines like Amass and Subfinder.
-   **Historical Tracking:** Stores and categorizes past scan results by
    target for longitudinal security monitoring.

------------------------------------------------------------------------

## System Architecture

### Frontend

-   **React:** Dashboard-driven user interface\
-   **Context API:** Global state management for authentication and
    sockets\
-   **Lucide React:** Icon system for UI consistency

### Backend

-   **Node.js & Express:** API routing and scan orchestration\
-   **PostgreSQL:** Primary data store\
-   **Socket.io:** Real-time communication\
-   **RabbitMQ (amqplib):** Message broker for async job distribution

### Microservices

-   **Python Workers:** Execute scanning logic via queue system\
-   **pika:** RabbitMQ client for Python workers\
-   **Engine Wrappers:** Integrations with Nmap, Amass, Subfinder

------------------------------------------------------------------------

## Installation

### Prerequisites

-   Node.js and npm\
-   Python 3.x\
-   PostgreSQL\
-   RabbitMQ

------------------------------------------------------------------------

### Backend Setup

``` bash
cd backend
npm install
npm run dev
```

------------------------------------------------------------------------

### Frontend Setup

``` bash
cd frontend
npm install
npm run dev
```

------------------------------------------------------------------------

### Microservice Setup

``` bash
cd microservices
pip install -r requirements.txt
python worker.py
```

------------------------------------------------------------------------

### Docker Setup

Run RabbitMQ using Docker:

``` bash
docker run -it --rm \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:4-management
```

------------------------------------------------------------------------

## Scan Validation Rules

-   **IP Targets:** IP_RECON, IP_PORT_SCAN\
-   **Domain Targets:** SSL/TLS, IP_PORT_SCAN, SUBDOMAIN_ENUM

------------------------------------------------------------------------

## Summary

This project follows a distributed, asynchronous architecture using
RabbitMQ for message brokering between the backend and Python workers.
The implementation aligns with the defined scan validation rules and
ensures scalability for handling intensive security scanning tasks.
