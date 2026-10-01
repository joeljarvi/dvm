import { getHash, setHash } from "./hash";
import { setOpenedSection } from "./section";
import { REVEAL_DURATION } from "./motion";
import type { Section } from "./hover";

/**
 * Switches which home column is open. Index stays up over the swap — it
 * follows the open column. If About is up, its drawer closes first and the column swap only starts once that fade-out
 * has actually finished — firing both at once reads as the drawer and the
 * width change fighting for attention, since the drawer's own panel fade
 * (see InfoOverlay.tsx) already takes the full reveal transition to clear.
 */
export function switchSection(section: Exclude<Section, null>, syncHash = false) {
  const hash = getHash();

  // The hash stays on Index; the column underneath is switched in place.
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
