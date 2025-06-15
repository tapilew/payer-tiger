# **Payer Tiger** (💲,🐅)

Payer Tiger is a **monetization toolkit** for [X](https://x.com) (f.k.a.
Twitter) and [Arena](https://arena.social) creators that lets them earn directly
from their content with a single click.

It uses a
[Sherry `Dynamic Action`](https://docs.sherry.social/docs/api-reference/action-types/dynamic-actions)
to transform any tweet into an interactive, on-platform paywall or tip jar,
making it fundamentally superior to the high-friction, high-fee models of
Patreon or X's own subscriptions.

## TODO

- [x] Create T3 App
- [x] Create Foundry project
- [ ] Setup Turborepo
- [ ] Update README guide to run locally
- [ ] Deploy HTTPayer servers to cloud (payer server, treasury server, avax facilitator server, demo server)

## The Problem: Creator Monetization is Broken

Creators build massive, engaged audiences on X but struggle to monetize them
directly. Existing solutions are deeply flawed:

- **High Friction:** Off-platform links to Patreon or Gumroad kill conversion
  rates by forcing users to leave the app, create new accounts, and navigate
  complex checkout flows.
- **Inflexible Models:** X Subscriptions are "all or nothing." Creators cannot
  sell access to a single article, video, or receive a one-off tip for a viral
  post.
- **Exorbitant Fees:** Platforms can take up to 30% of a creator's hard-earned
  income, and traditional payment processors add their own fees on top.
- **Global Barriers:** Payouts are tied to traditional banking systems like
  Stripe, creating barriers for creators in many countries.

## The Solution: The Monetization Trigger

Payer Tiger gives power back to the creator. It's a lean, powerful, and open
tool that provides a simple "trigger" they can attach to any piece of content.
This trigger handles all the complexity of crypto payments, making the
experience seamless for their followers.

### How It Works

1. **Creator Sets a Trigger:** A creator posts a teaser of their content (e.g.,
   the first paragraph of an article) and attaches a Payer Tiger action: "Unlock
   Full Article for 1 USDC".
2. **Follower Clicks:** A follower clicks the button directly within the
   Sherry-embedded tweet.
3. **Server-Side Logic:** The Sherry `Dynamic Action` calls our backend API
   endpoint. Our server checks the creator's preferences (e.g., they want to
   receive funds on Celo).
4. **Optimal Transaction:** The server constructs the optimal transaction. If
   the follower is paying from Avalanche, it builds a transaction that routes
   their USDC through Wormhole to the creator's Celo wallet. If they're both on
   the same chain, it's a simple transfer.
5. **Seamless Execution:** The server returns the serialized transaction to the
   user's wallet for a single, simple signature. The follower never has to think
   about bridges or networks.
6. **Content Unlocked:** Upon confirmation, the content is instantly revealed to
   the user, all without ever leaving Twitter.

## Why Payer Tiger is Superior

| Feature         | **Payer Tiger**                     | **Twitter Subscriptions** | **Patreon**             |
| :-------------- | :---------------------------------- | :------------------------ | :---------------------- |
| **Fees**        | Minimal Protocol Fees               | Up to 30%                 | 5-12% + processing      |
| **Model**       | **Flexible:** Pay-per-view, tips    | Subscription Only         | Subscription Only       |
| **Friction**    | **Zero.** On-platform, 1-click.     | Low. On-platform.         | **High.** Off-platform. |
| **Payouts**     | **Instant & Global (USDC)**         | Slow, Bank/Stripe-based   | Slow, Bank/PayPal-based |
| **User Choice** | **Yes.** Pay from AVAX or Celo.     | No. Fiat only.            | No. Fiat only.          |
| **Ownership**   | **Creator-centric.** Open protocol. | **Platform-centric.**     | **Platform-centric.**   |

## Technology Stack

- **Frontend Embedding:** [Sherry](https://sherry.social/)
- **Core Logic:** Sherry
  [Dynamic Action](https://docs.sherry.social/docs/api-reference/action-types/dynamic-actions)
- **Payment Protocol :** [x402](https://x402.org)
- **Blockchains:** [Avalanche](https://build.avax.network),
  [Celo](https://docs.celo.org)
- **Stablecoin:** [USDC](https://usdc.com)
- **Cross-Chain Bridge:** [Wormhole](https://wormhole.com)
- **Framework:** [Next.js](https://nextjs.org) / [Vercel](https://vercel.com)

## Running Locally

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or later)
- [pnpm](https://pnpm.io)
- A wallet extension like [MetaMask](https://metamask.io) or
  [Core](https://core.app)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/payer-tiger.git
   ```
2. Install NPM packages
   ```sh
   cd payer-tiger
   pnpm install
   ```
3. Create a `.env.local` file and add your environment variables (e.g., RPC
   URLs).
   ```env
   AVALANCHE_RPC_URL=...
   CELO_RPC_URL=...
   ```
4. Run the development server
   ````sh
   pnpm dev
   ```
   ````
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see
   the result..
