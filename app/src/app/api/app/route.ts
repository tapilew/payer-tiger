import path from "path";
import {
	type ExecutionResponse,
	type Metadata,
	createMetadata,
} from "@sherrylinks/sdk";
import fs from "fs/promises";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	http,
	createPublicClient,
	encodeFunctionData,
	parseAbi,
	serializeTransaction,
} from "viem";
import { avalancheFuji } from "viem/chains";

const PAYER_ROUTER_ADDRESS = "0x994519B71387380F30Be925a75a5593cffacd401";
const USDC_ADDRESS = "0x5425890298aed601595a70AB815c96711a31Bc65"; // Fuji USDC

// PayerRouter ABI
const payerRouterAbi = parseAbi([
	"function getPayee(string calldata _handle) external view returns (address)",
	"function payAndLogAccess(bytes32 contentId, string calldata creatorHandle, address token, uint256 amount) external",
	"event ContentAccessed(bytes32 indexed contentId, address indexed payer, address indexed creator, uint256 amount)",
]);

const DATA_DIR = path.join(process.cwd(), "src/data");
const PAYWALL_PATH = path.join(DATA_DIR, "paywall.json");
const ACCESS_RECORDS_PATH = path.join(DATA_DIR, "access_records.json");

async function ensureFileExists(filePath: string, defaultContent: string) {
	try {
		await fs.access(filePath);
	} catch {
		await fs.writeFile(filePath, defaultContent, "utf-8");
	}
}

async function readJsonFile(filePath: string, defaultValue: any) {
	await ensureFileExists(filePath, JSON.stringify(defaultValue, null, 2));
	const content = await fs.readFile(filePath, "utf-8");
	try {
		return JSON.parse(content);
	} catch {
		return defaultValue;
	}
}

// GET endpoint - Returns Sherry metadata
export async function GET(req: NextRequest) {
	try {
		const host = req.headers.get("host") || "localhost:3000";
		const protocol = req.headers.get("x-forwarded-proto") || "http";
		const serverUrl = `${protocol}://${host}`;

		const metadata: Metadata = {
			url: "https://payer-tiger-app.vercel.app",
			icon: "https://utfs.io/f/IN4OjmY4wMHBvmNvMjUNZrU4ew9VXkhMBbluWpziOGf6Rt7y",
			title: "Payer Tiger 💲🐅",
			baseUrl: serverUrl,
			description: "Pay creators for premium content with USDC on Avalanche",
			actions: [
				{
					type: "dynamic",
					label: "Unlock Content",
					description: "Pay the creator to unlock premium content",
					chains: { source: "fuji" },
					path: "/api/app",
					params: [
						{
							name: "creatorHandle",
							label: "Creator Handle",
							type: "text",
							required: true,
							description: "The creator's handle (e.g., @creator)",
						},
						{
							name: "contentId",
							label: "Content ID",
							type: "text",
							required: true,
							description: "The ID of the content to unlock",
						},
					],
				},
			],
		};

		// Use Sherry SDK to validate and create metadata
		const validatedMetadata = createMetadata(metadata);

		return NextResponse.json(validatedMetadata, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error) {
		console.error("Error creating metadata:", error);
		return NextResponse.json(
			{ error: "Failed to create metadata" },
			{
				status: 500,
			},
		);
	}
}

// POST endpoint - Returns transaction for execution
export async function POST(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const creatorHandle = searchParams.get("creatorHandle");
		const contentId = searchParams.get("contentId");

		if (!creatorHandle || !contentId) {
			return NextResponse.json(
				{ error: "Missing creatorHandle or contentId" },
				{
					status: 400,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					},
				},
			);
		}

		// 1. Lookup priceUSDC from paywall.json (dynamic)
		const paywallData = await readJsonFile(PAYWALL_PATH, []);
		if (paywallData.length === 0) {
			// Auto-populate with a default entry for development/testing
			const defaultEntry = {
				contentId: "abc123",
				title: "Premium Article: The Future of Web3",
				unlockableUrl: "https://example.com/premium-content",
				priceUSDC: "1000000",
			};
			paywallData.push(defaultEntry);
			await fs.writeFile(
				PAYWALL_PATH,
				JSON.stringify(paywallData, null, 2),
				"utf-8",
			);
		}
		const paywallEntry = paywallData.find(
			(item: any) => item.contentId === contentId,
		);
		if (!paywallEntry) {
			return NextResponse.json(
				{ error: "Content not found" },
				{
					status: 404,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					},
				},
			);
		}

		const { priceUSDC } = paywallEntry;

		// 2. Ensure access_records.json exists (for future use)
		await ensureFileExists(ACCESS_RECORDS_PATH, JSON.stringify([], null, 2));

		// 3. Get creator address from contract
		const client = createPublicClient({
			chain: avalancheFuji,
			transport: http(),
		});

		let creatorAddress: string;
		try {
			creatorAddress = (await client.readContract({
				address: PAYER_ROUTER_ADDRESS,
				abi: payerRouterAbi,
				functionName: "getPayee",
				args: [creatorHandle],
			})) as string;
		} catch (e) {
			return NextResponse.json(
				{ error: "Creator handle not found on-chain" },
				{
					status: 404,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
						"Access-Control-Allow-Headers": "Content-Type, Authorization",
					},
				},
			);
		}

		// 4. Convert contentId to bytes32
		const contentIdBytes32 = contentId.padEnd(66, "0") as `0x${string}`;

		// 5. Encode the payAndLogAccess transaction
		const payAndLogAccessData = encodeFunctionData({
			abi: payerRouterAbi,
			functionName: "payAndLogAccess",
			args: [contentIdBytes32, creatorHandle, USDC_ADDRESS, BigInt(priceUSDC)],
		});

		// 6. Create the transaction object
		const transaction = {
			to: PAYER_ROUTER_ADDRESS as `0x${string}`,
			data: payAndLogAccessData,
			chainId: avalancheFuji.id,
			type: "legacy" as const,
		};

		// 7. Serialize the transaction
		const serializedTransaction = serializeTransaction(transaction);

		// 8. Return ExecutionResponse using Sherry SDK types
		const response: ExecutionResponse = {
			serializedTransaction,
			chainId: avalancheFuji.name,
		};

		return NextResponse.json(response, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error) {
		console.error("Error in POST request:", error);
		return NextResponse.json(
			{
				error: "Internal Server Error",
				details: error instanceof Error ? error.message : String(error),
			},
			{
				status: 500,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
				},
			},
		);
	}
}

// OPTIONS endpoint for CORS
export async function OPTIONS() {
	return new NextResponse(null, {
		status: 204,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers":
				"Content-Type, Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version",
		},
	});
}
