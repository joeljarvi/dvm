"use client";

import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export default function StudioPage() {
  return (
    <div data-lenis-prevent className="h-dvh w-full">
      <NextStudio config={config} />
    </div>
  );
}
