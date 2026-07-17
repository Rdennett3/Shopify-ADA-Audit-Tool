"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ScanStatusPollerProps {
    hasActiveScans: boolean;
    intervalMs?: number;
}

export default function ScanStatusPoller({
    hasActiveScans,
    intervalMs = 5000,
}: ScanStatusPollerProps) {
    const router = useRouter();

    useEffect(() => {
        if (!hasActiveScans) {
            return;
        }

        const refreshDashboard = () => {
            // Avoid unnecessary refreshes while the browser tab is hidden.
            if (document.visibilityState === "visible") {
                router.refresh();
            }
        };

        const intervalId = window.setInterval(
            refreshDashboard,
            intervalMs
        );

        return () => {
            window.clearInterval(intervalId);
        };
    }, [hasActiveScans, intervalMs, router]);

    return null;
}