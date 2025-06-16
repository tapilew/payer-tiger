# Payer Tiger (💲,🐅)

Payer Tiger is a monetization toolkit for creators on platforms like X (f.k.a.
Twitter) and Arena. It leverages the Sherry SDK to enable direct, on-platform,
and low-friction payments, allowing creators to earn from their content with a
single click.

## TODO

- [x] Create T3 App
- [x] Create Foundry project
- [x] Setup Turborepo
- [ ] Deploy HTTPayer servers to cloud
  - [ ] payer server
  - [ ] treasury server
  - [ ] avax facilitator server
  - [ ] demo server

## The Problem: Creator Monetization is Broken

Creators build valuable communities but face significant friction when trying to
monetize their work. The current landscape is inefficient and costly:

- **High Friction:** Off-platform links to Patreon or Gumroad kill conversion by
  forcing users through cumbersome, multi-step checkout flows.
- **Inflexible Models:** Platform subscriptions are often "all-or-nothing,"
  preventing creators from selling access to individual articles, videos, or
  receiving one-off tips.
- **Exorbitant Fees:** Centralized platforms and payment processors can take a
  substantial cut of a creator's revenue.
- **Global Barriers:** Payouts are tied to traditional banking systems, creating
  accessibility issues for creators in many parts of the world.

## The Solution: The On-Chain Monetization Trigger

Payer Tiger solves this by providing a simple, powerful, and decentralized
"trigger" that creators can attach to any piece of content. Our solution is a
**Sherry Dynamic Action** that facilitates a direct, user-signed payment to the
creator, using our on-chain `PayerRouter` contract for address resolution and a
secure, signature-gated delivery mechanism.

### How It Works: A Two-Part System

Payer Tiger operates as a system of two distinct but connected applications: a
**Creator Setup** process and a **Consumer Mini-App** for payments and access.

#### 1. Creator Setup (MVP Manual Flow)

For the hackathon MVP, we've focused on the core on-chain and backend logic. The
creator setup is a manual, developer-driven process that demonstrates the
system's foundation:

- **On-Chain Registration:** A creator interacts directly with our `PayerRouter`
  smart contract on Avalanche Fuji (e.g., via Remix or Etherscan) to create an
  immutable, on-chain link between their social handle (`@creatorX`) and their
  wallet address.
- **Content Paywalling:** The creator's premium content (e.g., an unlisted video
  or a private document link) is registered in a simple `paywall.json` file in
  our backend. This file maps a `contentId` to the secret content URL and its
  price.

#### 2. The Consumer Payment & Access Flow

This is the core user journey, powered by a single Sherry Dynamic Action that
orchestrates a complex series of events to meet the Minithon's requirements.

1. **Initiate Payment:** A follower clicks the "Unlock Content" button on a
   post.
2. **Backend Orchestration (The "Complex Logic"):** Sherry sends a `POST`
   request to our Next.js backend. This backend is the brain of the operation
   and performs our **complex custom logic**: a. **Price & Address Resolution:**
   It reads our `paywall.json` to determine the price and makes a read call to
   the `PayerRouter` contract to resolve the creator's wallet address. b.
   **Transaction Building:** It constructs a **single, powerful transaction**
   that bundles two calls using a multicall pattern: i. An `approve` call to the
   USDC contract, allowing our `PayerRouter` to spend the user's funds. ii. A
   call to the `payAndLogAccess` function on our `PayerRouter` contract, which
   transfers the funds and emits an on-chain event logging the access.
3. **User-Signed Transaction:** The backend returns this single, bundled
   `serializedTransaction` to Sherry. The user's wallet prompts them for **one
   signature** to approve the entire operation.
4. **Secure Access Control:** Upon successful on-chain payment confirmation, the
   backend records the user's wallet address in an `access_records.json` file,
   granting them a non-transferable "access token" for that specific piece of
   content.
5. **Signature-Gated Delivery:** The user is automatically redirected to a
   secure `/viewer` page on our Next.js app. To access the content, the user
   must sign a **free, gas-less message** to prove ownership of the wallet that
   paid. Our backend verifies this signature against the `access_records.json`
   before securely delivering the content, preventing link-sharing.

### Architectural Flow

```mermaid
graph TD
    A[User]
    B[MiniApp]
    C[Backend]
    D[PaywallRouter]
    F[Fuji]
    G[Access]
    H[Viewer]
    I[Verify]

    A --> B
    B --> C
    C --> D
    C --> C
    C --> B
    B --> F
    F --> C
    C --> G
    C --> H
    H --> I
    I --> G
    I --> H
```

### Technology Stack

- **Frontend Embedding:** Sherry SDK
- **Core Logic:** Sherry Dynamic Action
- **Backend & Viewer:** Next.js (Route Handlers & App Router)
- **Smart Contracts:** Solidity, Foundry (`PayerRouter`)
- **Blockchain:** Avalanche Fuji
- **Stablecoin:** USDC
- **Libraries:** `viem`, `wagmi`

### Hackathon MVP Scope vs. Future Vision

- **Hackathon MVP Focus:** Our submission is a robust, end-to-end system
  demonstrating a **complex, multi-step smart contract interaction and secure
  delivery flow**. We prove the core value proposition by enabling a user to pay
  a creator directly via a single user-signed transaction, with payment routing
  handled by our on-chain `PayerRouter` and content access secured by
  cryptographic signatures.

- **Future Vision (Post-Hackathon):** The infrastructure built for this MVP is
  the foundation for our long-term vision. The next phases include:
  - **Creator Portal:** Building a full-fledged Next.js dashboard for creators
    to self-serve onboarding and content management.
  - **Wallet-less Payments:** Integrating our `HTTPayer` service and the `x402`
    protocol to offer a fully abstracted payment experience, allowing users
    without Web3 wallets to pay seamlessly and dramatically expanding the
    accessible market for creators.
