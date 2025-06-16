import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
    createPublicClient,
    encodeFunctionData,
    http,
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

// Sample paywall data (in a real app, this would come from a database)
const paywallData = [
    {
        contentId: "abc123",
        title: "Premium Article: The Future of Web3",
        unlockableUrl: "https://example.com/premium-content",
        priceUSDC: "1000000", // 1 USDC (6 decimals)
    },
];

// GET endpoint - Returns Sherry metadata
export async function GET(req: NextRequest) {
    try {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const serverUrl = `${protocol}://${host}`;

        const metadata = {
            url: "https://payer-tiger.com",
            icon: "https://avatars.githubusercontent.com/u/117962315",
            title: "Payer Tiger 💲🐅",
            baseUrl: serverUrl,
            description:
                "Pay creators for premium content with USDC on Avalanche",
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
                            description:
                                "The creator's handle (e.g., @creator)",
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

        return NextResponse.json(metadata, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    } catch (error) {
        console.error("Error creating metadata:", error);
        return NextResponse.json({ error: "Failed to create metadata" }, {
            status: 500,
        });
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
                        "Access-Control-Allow-Methods":
                            "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                },
            );
        }

        // 1. Lookup priceUSDC from paywall data
        const paywallEntry = paywallData.find((item) =>
            item.contentId === contentId
        );
        if (!paywallEntry) {
            return NextResponse.json(
                { error: "Content not found" },
                {
                    status: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods":
                            "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                },
            );
        }

        const { priceUSDC } = paywallEntry;

        // 2. Get creator address from contract
        const client = createPublicClient({
            chain: avalancheFuji,
            transport: http(),
        });

        let creatorAddress: string;
        try {
            creatorAddress = await client.readContract({
                address: PAYER_ROUTER_ADDRESS,
                abi: payerRouterAbi,
                functionName: "getPayee",
                args: [creatorHandle],
            }) as string;
        } catch (e) {
            return NextResponse.json(
                { error: "Creator handle not found on-chain" },
                {
                    status: 404,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods":
                            "GET, POST, PUT, DELETE, OPTIONS",
                        "Access-Control-Allow-Headers":
                            "Content-Type, Authorization",
                    },
                },
            );
        }

        // 3. Convert contentId to bytes32
        const contentIdBytes32 = contentId.padEnd(66, "0") as `0x${string}`;

        // 4. Encode the payAndLogAccess transaction
        const payAndLogAccessData = encodeFunctionData({
            abi: payerRouterAbi,
            functionName: "payAndLogAccess",
            args: [
                contentIdBytes32,
                creatorHandle,
                USDC_ADDRESS,
                BigInt(priceUSDC),
            ],
        });

        // 5. Create the transaction object
        const transaction = {
            to: PAYER_ROUTER_ADDRESS as `0x${string}`,
            data: payAndLogAccessData,
            chainId: avalancheFuji.id,
            type: "legacy" as const,
        };

        // 6. Serialize the transaction
        const serializedTransaction = serializeTransaction(transaction);

        // 7. Return ExecutionResponse
        const response = {
            serializedTransaction,
            chainId: avalancheFuji.name,
        };

        return NextResponse.json(response, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        });
    } catch (error) {
        console.error("Error in POST request:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            {
                status: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods":
                        "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers":
                        "Content-Type, Authorization",
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
