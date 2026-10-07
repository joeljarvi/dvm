// The site's name and tagline — the page metadata (app/layout.tsx), and the
// home page's screen-reader heading, read the same.
export const SITE_TITLE = "Daniel von Malmborg";
export const SITE_DESCRIPTION = "Photographer & Producer";

// The live site's address, for absolute URLs in metadata, the sitemap and
// robots.txt. NEXT_PUBLIC_SITE_URL wins if set; otherwise Vercel's production
// domain (its custom domain once one is added, e.g. danielvonmalmborg.com);
// otherwise the vercel.app address.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://dvm-zeta.vercel.app")
).replace(/\/$/, "");

export const INSTAGRAM_URL = "https://www.instagram.com/daniel.external/";
