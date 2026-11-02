import { getHash, setHash } from "./hash";
import { setOpenedSection } from "./section";
import { REVEAL_DURATION } from "./motion";
import type { Section } from "./hover";

export function switchSection(
  section: Exclude<Section, null>,
  syncHash = false,
) {
  const hash = getHash();

  if (hash === "index") {
    setOpenedSection(section);
    return;
  }

  if (hash === "about") {
    setHash("");
    window.setTimeout(() => {
      setOpenedSection(section);
      if (syncHash) setHash(section);
    }, REVEAL_DURATION * 1000);
    return;
  }

  setOpenedSection(section);
  if (syncHash) setHash(section);
}
