# FastAPI Provider Service (Crossmint Gateway & Web3 Orchestrator)

## Description

The FastAPI Provider Service is a secure, centralized API Gateway and Business Logic Orchestrator for our suite of personal fintech projects, including **Payer Tiger** and **Sherry Mini-Apps**. It abstracts away the complexities of Web3, compliance, and multi-service orchestration, providing a simple, high-level API for client-side Next.js applications.

## What It Does

- Acts as the single point of entry for all complex, shared Web3 infrastructure.
- Manages secure wallet creation, transaction signing, and payment flows via Crossmint WaaS.
- Enforces on-chain and off-chain compliance for enterprise-grade Avalanche EERC tokens on Evergreen Subnets.
- Integrates with Chainsettle for real-world data and compliance oracles.
- Handles HTTPayer API monetization and payment logic.
- Stores and manages all application data, compliance lists, and audit logs in CockroachDB.

## Key Features

- **Crossmint WaaS Integration:** Secure, API-driven wallet management and transaction orchestration.
- **Avalanche EERC Token Management:** Full support for compliant, enterprise-grade tokens on Evergreen Subnets, including compliance checks and admin actions.
- **Chainsettle Oracle Integration:** Real-time KYC, jurisdiction, and compliance data for transaction pre-checks.
- **HTTPayer Client:** Automated stablecoin payments for API monetization.
- **CockroachDB Storage:** Distributed, ACID-compliant data store for all business and compliance data.
- **Secure API Gateway:** Isolates all sensitive keys and logic from client-side exposure.
- **Reusable & Scalable:** Designed for use by multiple frontend clients and future expansion.

## Architecture Overview

This service acts as a **provider** layer, sitting between all Next.js client applications and the external Web3 infrastructure (blockchains, oracles, payment APIs). It centralizes all sensitive operations, compliance logic, and orchestration, allowing frontends to remain simple and secure.

## Technologies Used

- **FastAPI** (Python): High-performance, async web framework.
- **CockroachDB:** Distributed, PostgreSQL-compatible database.
- **web3.py:** EVM blockchain interaction and contract encoding.
- **Pydantic:** Data validation and settings management.
- **SQLAlchemy:** ORM for database models and migrations.
- **Pytest:** Testing framework.

## Setup / Installation

1. **Clone the repository:**

   ```bash
   git clone <REPO_URL>
   cd providers
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   - Copy `.env.example` to `.env` and fill in required secrets (Crossmint, Chainsettle, DB, etc).

5. **Run database migrations:**
   ```bash
   alembic upgrade head
   ```

## How to Run

```bash
uvicorn app.main:app --reload
```

## Testing

- Run all tests with:
  ```bash
  pytest
  ```

## Contributing

Contributions are welcome! Please open issues or submit pull requests.
