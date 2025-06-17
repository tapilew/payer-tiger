import { http, cookieStorage, createConfig, createStorage } from "wagmi";
import { avalanche, avalancheFuji, mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

interface EIP1193Provider {
	request<T = unknown>(args: {
		method: string;
		params?: object | unknown[] | undefined | unknown;
	}): Promise<T>;
	on(event: string, listener: (...args: unknown[]) => void): void;
	removeListener(event: string, listener: (...args: unknown[]) => void): void;
}

declare global {
	interface Window {
		avalanche?: EIP1193Provider;
	}
}

export function getConfig() {
	const connectors = [];

	// Prioritize Core wallet when available
	if (typeof window !== "undefined" && window.avalanche) {
		connectors.push(
			injected({
				target() {
					if (!window.avalanche) return undefined;
					return {
						id: "CoreWallet",
						name: "Core",
						provider: window.avalanche,
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
