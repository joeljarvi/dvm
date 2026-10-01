import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  // Off: fetches are already cached by Next and refreshed by the webhook at
  // /api/revalidate. The Sanity CDN lags a publish, so a refetch right after
  // the webhook would cache the old content again.
  useCdn: false,
})
