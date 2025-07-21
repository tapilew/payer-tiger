# Architecture: FastAPI Provider Service

## Introduction

The FastAPI Provider Service is the secure, scalable, and compliant backend for our fintech ecosystem. It centralizes all sensitive Web3 operations, compliance logic, and multi-service orchestration, acting as the trusted gateway between our Next.js client applications and the broader Web3 infrastructure. This separation ensures security, scalability, abstraction, and regulatory compliance—critical for modern, institutional-grade digital asset platforms.

---

## System Overview

**Conceptual Diagram Description:**

- **Clients:** Next.js applications (e.g., Payer Tiger, Sherry Mini-Apps) interact only with the FastAPI Provider via HTTPS.
- **Provider Service (FastAPI):** Sits at the center, exposing high-level REST APIs. It manages all business logic, compliance, and orchestration.
- **External Integrations:**
  - **Crossmint WaaS:** For wallet management and transaction execution.
  - **Avalanche Evergreen Subnet:** For EERC token operations and on-chain compliance.
  - **Chainsettle Oracle:** For real-world compliance/KYC data.
  - **HTTPayer APIs:** For monetized API consumption.
  - **CockroachDB:** For all persistent data (paywalls, access records, compliance lists, audit logs).
- **Flow:** Clients send requests → FastAPI Provider performs compliance checks, orchestrates with external services, and returns results to clients.

---

## Core Components / Modules

- **`app/main.py`:** Application entry point; FastAPI app instantiation, middleware, and router registration.
- **`app/api/`:** API routers for each domain:
  - `payments.py`: Payment orchestration endpoints.
  - `eerc.py`: EERC token management and admin actions.
  - `compliance.py`: Compliance check endpoints.
  - `webhooks.py`: Secure webhook receivers (e.g., Crossmint, Chainsettle).
- **`app/services/`:** Business logic and external API wrappers:
  - `crossmint.py`: Crossmint WaaS integration.
  - `eerc_manager.py`: EERC contract interaction and compliance logic.
  - `chainsettle.py`: Chainsettle oracle client.
  - `httpayer_client.py`: HTTPayer API payment logic.
  - `db.py`: Database access and utility functions.
- **`app/db/`:** Database configuration and models:
  - `models.py`: SQLAlchemy models (Paywall, AccessRecord, EERCToken, ComplianceList, AuditLog, etc.).
  - `alembic/`: Database migrations.
- **`app/auth/`:** JWT authentication, user/session management.
- **`app/config/`:** Pydantic-based settings and environment variable management.
- **`app/utils/`:** Common utilities (e.g., `web3_utils.py` for address checksums, encoding).

---

## Data Flow & Processing Pipelines

### **Payment Orchestration**

1. **Client** sends a payment initiation request to FastAPI.
2. **FastAPI**:
   - Looks up paywall and compliance data in CockroachDB.
   - Encodes the transaction using `web3.py`.
   - Submits the transaction to Crossmint WaaS for signing and broadcasting.
   - Stores transaction and audit data in CockroachDB.
3. **Crossmint** executes the transaction on the target blockchain (Avalanche C-Chain or Evergreen Subnet).
4. **FastAPI** returns transaction status and tracking info to the client.

### **EERC Compliance Pipeline**

1. **Client** requests an EERC token transfer or admin action.
2. **FastAPI**:
   - Performs local whitelist/blacklist checks (CockroachDB).
   - Queries Chainsettle for real-time KYC/jurisdictional data.
   - Calls EERC contract on the Evergreen Subnet to check on-chain compliance (e.g., `canTransfer`).
   - If all checks pass, encodes and submits the transaction to Crossmint.
   - Logs all compliance check results and actions for auditability.

### **Webhook Processing**

1. **External service** (e.g., Crossmint) sends a webhook to FastAPI.
2. **FastAPI**:
   - Verifies the webhook signature for authenticity.
   - Processes the event asynchronously (e.g., updates transaction status, triggers notifications).
   - Ensures idempotency and logs all webhook events.

---

## Key Technologies & Justification

- **FastAPI:** Chosen for its async performance, type safety, and modern Python ecosystem.
- **CockroachDB:** Provides distributed, ACID-compliant, highly available storage with PostgreSQL compatibility—ideal for financial and compliance data.
- **web3.py:** Industry-standard for EVM blockchain interaction in Python.
- **Pydantic:** Ensures robust data validation and type safety.
- **SQLAlchemy:** Powerful ORM for complex data models and migrations.

---

## Security Considerations

- **API Key Management:** All sensitive keys (Crossmint, Chainsettle, DB) are managed via environment variables or cloud secrets managers. Never exposed to clients.
- **Webhook Signature Verification:** All incoming webhooks are verified using HMAC or provider-specific methods to prevent spoofing.
- **Authentication:** JWT-based authentication, with HttpOnly cookies for session security.
- **Principle of Least Privilege:** All external integrations and internal modules operate with the minimum required permissions.

---

## Scalability & Resilience

- **Async FastAPI:** Handles high concurrency and throughput.
- **CockroachDB:** Distributed architecture ensures high availability and fault tolerance.
- **Stateless API:** Enables horizontal scaling and easy deployment in cloud-native environments.

---

## Future Enhancements

- **Role-Based Access Control (RBAC):** Fine-grained permissions for admin endpoints.
- **Advanced Monitoring & Observability:** Integration with Prometheus/Grafana for metrics and alerting.
- **Multi-chain Support:** Expand to additional blockchains and token standards.
- **Automated Compliance Reporting:** Scheduled exports and dashboards for regulatory audits.
