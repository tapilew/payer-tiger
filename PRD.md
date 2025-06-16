# **Product Requirements Document**

**Payer Tiger (💲,🐅)**

### **Preamble for AI Agent**

**Objective:** This document contains the complete specification for the Payer
Tiger Minithon MVP. Your task is to use this PRD as the single source of truth
for development. The architecture and logic have been finalized to meet the
hackathon's complexity requirements within the given time constraints. Focus on
implementing the specified user stories and technical flows precisely.

## **Project Overview**

Payer Tiger is a decentralized monetization protocol and application that allows
content creators to receive direct, low-friction payments from their audience.
It leverages the Sherry SDK for a seamless user experience within social
platforms and uses on-chain smart contracts for censorship-resistant payment
routing and verification.

1. **Logical thinking**
   - **what is the game?** The game is to create a monetization system where the
     core payment rails are a public good, owned by the users, not a central
     platform. We win by empowering creators with a censorship-resistant income
     stream and providing followers with a seamless way to pay.
   - **project overview:** This project will deliver a functional
     proof-of-concept demonstrating an end-to-end payment and secure content
     delivery flow. A user will pay a creator for content via a Sherry Mini-App,
     with the payment routed and logged by our on-chain `PayerRouter` contract.
     Access to the content will be secured via a signature-gated viewer page.

### **Level**

Medium to Hard. The project involves smart contract interaction, a multicall
transaction pattern, backend state management, and a signature-based
authentication flow.

### **Type of Project**

Fintech, Web3, Creator Economy, Decentralized Protocol

### **Skills Required**

- **Frontend:** Next.js (App Router), TypeScript, `viem`/`wagmi`
- **Backend:** Next.js (Route Handlers), Node.js
- **Smart Contracts:** Solidity, Foundry
- **Web3 Concepts:** ERC20 (`approve`/`transferFrom`), multicall transaction
  patterns, EIP-4361 (Sign-In with Ethereum)
- **Deployment:** Vercel

2. **Analytical thinking**
   - **how do i play this game?** By building the specified MVP exactly as
     described, focusing on a flawless end-to-end demo.
   - **main objective and goal of this game?** To submit a winning project for
     the Sherry Minithon that demonstrates a complex, useful, and secure smart
     contract interaction.
   - **skills and tools:** See "Skills Required" above.

### **Participants**

- **Luis Tapia:** Product Design & Project Lead
- **Brandyn Hamilton:** Smart Contract Development
- **Juan Kong:** Product Management

### **Status**

In Development

### **Target release**

Sherry Minithon Submission Deadline (June 15, 2025)

## **Customer Information (Buyer Persona)**

- **Creator (The "Seller"):** A crypto-savvy content creator who produces
  valuable digital content (articles, videos, analysis). They are frustrated
  with the fees and restrictions of Web2 platforms and desire a direct,
  censorship-resistant way to monetize their work.
- **Follower (The "Buyer"):** A member of the broad public who follows the
  creator. For the MVP, we assume they are crypto-curious and have a
  browser-based EVM wallet (e.g., MetaMask, Core) with `USDC` on Avalanche Fuji.
  In further stages of the project the blockchain complexity will be abstracted
  away. We assume they can manage a wallet for now.

## **Goals (Business Objectives)**

1. **Primary Goal:** Deliver a functional, end-to-end MVP that meets all Sherry
   Minithon requirements for "complex smart contract interaction."
2. **Secondary Goal:** Prove the core value proposition of a secure, on-chain
   payment system combined with a signature-gated content delivery mechanism.
3. **Tertiary Goal:** Establish a foundational codebase for a future,
   fully-featured Payer Tiger protocol.

## **Background and Strategic Fit**

This project is a self-contained proof-of-concept designed to win the Sherry
Minithon. It explores a new primitive for the creator economy, aligning with the
broader industry trend towards decentralized and user-owned systems.

## **Assumptions**

- The `PayerRouter` smart contract is deployed on Avalanche Fuji at a known
  address.
- The user (follower) has a browser wallet installed and funded with `USDC` and
  `AVAX` (for gas) on Avalanche Fuji.
- The creator setup (on-chain registration, content paywalling) will be handled
  manually by the development team for the MVP demo.
- The application state (paywalled content, access records) will be managed via
  local JSON files in the Next.js project for the MVP. A database is not
  required.
- The user experience is optimized for desktop browsers.

## **Key Features (User Stories)**

3. **Computational thinking**
   - **how to fit the logic of the game into a complicated set of problems?** By
     breaking the flow into distinct user stories and defining the precise
     technical implementation for each step, from payment to secure delivery.
   - **how do you enforce these rules?** The rules are enforced by a combination
     of the immutable logic in the `PayerRouter` smart contract and the
     authorization checks in our backend API.

### **Epic: MVP End-to-End Monetization Flow**

#### **User Story 1: Creator Onboarding (Manual MVP Flow)**

**As a** Payer Tiger developer (acting on behalf of a creator), **I want to**
register the creator's payment information on-chain and set up their paywalled
content, **so that** the system is ready for a consumer to make a payment.

**Acceptance Criteria:**

1. **On-Chain Registration:** The developer can use a tool like Remix to call
   `addPayee(creatorHandle, creatorAddress)` on the deployed `PayerRouter`
   contract.
2. **Content Paywalling:** The developer can add a new entry to a local
   `paywall.json` file. The entry must contain a `contentId`, `title`, the
   secret `unlockableUrl`, and a `priceUSDC`.

#### **User Story 2: Follower Payment & Access (Core MVP Flow)**

**As a** follower, **I want to** pay for a piece of content with a single click
and securely access it, **so that** I can support the creator and consume their
premium work without friction.

**Acceptance Criteria:**

1. **Payment Initiation:** The user clicks a Sherry Dynamic Action button
   ("Unlock for X USDC").
2. **Backend Orchestration:** The backend API
   (`/api/payer-tiger/unlock-content`) receives the request and executes the
   following logic: a. It looks up the `priceUSDC` from `paywall.json` using the
   `contentId`. b. It calls `getPayee` on the `PayerRouter` contract to resolve
   the creator's address. c. It constructs a **multicall transaction** that
   bundles two atomic calls: i. An `approve` call to the `USDC` contract. ii. A
   call to `payAndLogAccess` on the `PayerRouter` contract. d. It returns the
   single `serializedTransaction` to Sherry.
3. **User Signature:** The user is prompted by their wallet to sign **one
   transaction**.
4. **Access Granting:** Upon successful transaction confirmation, the backend
   writes the user's wallet address and the `contentId` to the
   `access_records.json` file.
5. **Redirection:** The user is automatically redirected to the secure viewer
   page: `/viewer?contentId=...`.
6. **Secure Verification:** The `/viewer` page prompts the user to sign a
   gas-less message (SIWE).
7. **Content Delivery:** Upon successful signature verification against the
   `access_records.json`, the premium content is rendered inside an `<iframe>`
   on the `/viewer` page.

8. **Procedural thinking**
   - **how do i excel in this game?** By implementing the detailed UX/UI flow
     below flawlessly, ensuring the multicall transaction works, and the
     signature-gated access is secure.

## **UX/UI (User Interaction and Design)**

The MVP will have one single user-facing page: `/viewer`. It should be clean,
minimalist, and functional. Use Avalanche-branded UI components or a simple,
clean design.

### **The `/viewer` Page Flow:**

1. **Initial State:** User lands on `/viewer?contentId=...`. The page displays:
   - A title: "Payer Tiger Content Access"
   - A message: "Please verify wallet ownership to access your purchased
     content."
   - A single button: **"Verify with Wallet"**.
2. **Verification Step:** User clicks the button.
   - The application connects to their wallet.
   - The wallet prompts the user to sign a message (e.g., "Sign this message to
     prove you own this wallet and access your content. Nonce: 123456").
3. **Loading State:** While the backend verifies the signature, the button is
   disabled and shows a loading spinner.
4. **Success State:** If the backend returns success:
   - The title and button are removed.
   - The premium content is rendered in their place, embedded within an
     `<iframe>` that takes up the main view.
5. **Failure State:** If the backend returns an error (signature invalid,
   address not in access list):
   - An error message is displayed: "Access Denied. This wallet address has not
     purchased this content."

## **Questions**

- **How is content paywalled for the MVP?**
  - **Answer:** Via a manual entry in a backend `paywall.json` file.
- **How is access secured to prevent link sharing?**
  - **Answer:** Via a signature-gated `/viewer` page that requires the user to
    prove ownership of the wallet that made the purchase (Sign-In with
    Ethereum).

## **Not Doing (MVP Scope)**

- **No Creator UI/Dashboard:** All creator setup is manual.
- **No `HTTPayer` Integration:** The payment flow requires a user-signed
  transaction.
- **No Cross-Chain Functionality:** The system is exclusively for Avalanche
  Fuji.
- **No Other Tokens:** Payments are exclusively in `USDC`.
- **No Database:** State is managed with local JSON files.
