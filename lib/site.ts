export const SITE_TITLE = "Daniel von Malmborg";
export const SITE_DESCRIPTION = "Photographer & Producer";

export const SITE_SUMMARY =
  "Daniel von Malmborg is a photographer and creative producer working in advertising for brands and agencies that value quality over quantity — portraying designed objects, spaces and the people behind the craft.";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://dvm-zeta.vercel.app")
).replace(/\/$/, "");

export const FALLBACK_PHONE = "+46708247484";
export const FALLBACK_EMAIL = "daniel@danielvonmalmborg.com";
export const INSTAGRAM_URL = "https://www.instagram.com/daniel.external/";
