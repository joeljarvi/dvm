"use client";

import { Analytics } from "@vercel/analytics/next";

export default function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) =>
        new URL(event.url).pathname.startsWith("/studio") ? null : event
      }
    />
  );
}
