"use client";

import { Analytics } from "@vercel/analytics/next";

// Vercel Web Analytics: cookieless page views (see the Vercel dashboard).
// Only counted on the deployed site; the Sanity Studio isn't counted.
export default function SiteAnalytics() {
  return (
    <Analytics
      beforeSend={(event) =>
        new URL(event.url).pathname.startsWith("/studio") ? null : event
      }
    />
  );
}
