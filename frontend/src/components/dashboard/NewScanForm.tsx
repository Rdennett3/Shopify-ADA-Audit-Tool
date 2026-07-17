"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface CreateScanResponse {
    jobId?: string;
    scanMode?: string;
    error?: string;
}

export default function NewScanForm() {
    const router = useRouter();

    const [url, setUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setMessage(null);

        if (!url.trim()) {
            setError("Enter a website URL.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/scans", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url,
                }),
            });

            const body = (await res.json()) as CreateScanResponse;

            if (!res.ok) {
                throw new Error(body.error ?? "The scan could not be created.");
            }

            setUrl("");
            setMessage("The representative scan was added to the queue.");

            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "The scan could not be created."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-950">
                    Run a new scan
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                    This currently runs a representative 20-page sample across
                    the discovered page templates.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 lg:flex-row lg:items-end"
            >
                <div className="flex-1">
                    <label
                        htmlFor="scan-url"
                        className="mb-2 block text-sm font-semibold text-slate-800"
                    >
                        Website URL
                    </label>

                    <input
                        id="scan-url"
                        name="url"
                        type="text"
                        inputMode="url"
                        autoComplete="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                        disabled={isSubmitting}
                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "Adding scan…" : "Run representative scan"}
                </button>
            </form>

            <div
                aria-live="polite"
                className="mt-4 min-h-6 text-sm"
            >
                {error && (
                    <p className="font-medium text-red-700">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="font-medium text-green-700">
                        {message}
                    </p>
                )}
            </div>
        </section>
    );
}