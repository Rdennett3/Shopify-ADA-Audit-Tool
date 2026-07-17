import { NextResponse } from "next/server";
import { createScan } from "@/lib/api";

function normalizeUrl(value: string): string {
    const trimmed = value.trim();

    if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
    }

    return trimmed;
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (typeof body.url !== "string" || !body.url.trim()) {
            return NextResponse.json(
                {
                    error: "Enter a website URL.",
                },
                {
                    status: 400,
                }
            );
        }

        const url = normalizeUrl(body.url);

        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                {
                    error: "Enter a valid website URL.",
                },
                {
                    status: 400,
                }
            );
        }

        // Keep full scans disabled in the interface for now.
        const result = await createScan({
            url,
            scanMode: "sample",
        });

        return NextResponse.json(result, {
            status: 201,
        });
    } catch (error) {
        console.error("Create scan route failed:", error);

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "The scan could not be created.",
            },
            {
                status: 500,
            }
        );
    }
}