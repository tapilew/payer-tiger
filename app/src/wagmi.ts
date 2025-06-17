import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { avalanche, avalancheFuji, mainnet, sepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

export function getConfig() {
  const connectors = [];

  // Prioritize Core wallet when available
  if (typeof window !== "undefined" && (window as any).avalanche) {
    connectors.push(
      injected({
        target() {
          return {
            id: "CoreWallet",
            name: "Core",
            provider: (window as any).avalanche,
          };
        },
      }),
    );
  }

  // Fallback to generic injected wallet (MetaMask, Rabby, etc.)
  connectors.push(injected());

  return createConfig({
    chains: [mainnet, sepolia, avalanche, avalancheFuji],
    connectors,
    storage: createStorage({
      storage: cookieStorage,
    }),
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
      [avalanche.id]: http(),
      [avalancheFuji.id]: http(),
    },
  });
}

declare module "wagmi" {
  interface Register {
    config: ReturnType<typeof getConfig>;
  }
}
