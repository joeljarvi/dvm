'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '../../../sanity.config'

export default function StudioPage() {
  // `data-lenis-prevent` so Studio scrolls natively — the root Lenis
  // would otherwise capture the wheel and touch and this would sit stuck.
  return (
    <div data-lenis-prevent className="h-dvh w-full">
      <NextStudio config={config} />
    </div>
  )
}
