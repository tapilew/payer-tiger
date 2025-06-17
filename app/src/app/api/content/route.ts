import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/data");
const PAYWALL_PATH = path.join(DATA_DIR, "paywall.json");

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

// GET - Fetch all content
export async function GET() {
    try {
        const paywallData = await readJsonFile(PAYWALL_PATH, []);
        return NextResponse.json({ content: paywallData });
    } catch (error) {
        console.error("Error fetching content:", error);
        return NextResponse.json(
            { error: "Failed to fetch content" },
            { status: 500 },
        );
    }
}

// POST - Create new content
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { contentId, title, unlockableUrl, priceUSDC } = body;

        if (!contentId || !title || !unlockableUrl || !priceUSDC) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        // Read existing content
        const paywallData = await readJsonFile(PAYWALL_PATH, []);

        // Check if content ID already exists
        const existingContent = paywallData.find((item: any) =>
            item.contentId === contentId
        );
        if (existingContent) {
            return NextResponse.json(
                { error: "Content ID already exists" },
                { status: 409 },
            );
        }

        // Add new content
        const newContent = {
            contentId,
            title,
            unlockableUrl,
            priceUSDC,
            createdAt: new Date().toISOString(),
        };

        paywallData.push(newContent);

        // Save back to file
        await fs.writeFile(
            PAYWALL_PATH,
            JSON.stringify(paywallData, null, 2),
            "utf-8",
        );

        return NextResponse.json({
            message: "Content created successfully",
            content: newContent,
        });
    } catch (error) {
        console.error("Error creating content:", error);
        return NextResponse.json(
            { error: "Failed to create content" },
            { status: 500 },
        );
    }
}

// OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
