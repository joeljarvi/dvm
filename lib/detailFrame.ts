// The image a home cover was showing when its title was clicked, so the
// project page opens on that same image — the one that grows into it (see
// the shared "project-media" view transition). Module state survives the
// client-side navigation; a direct visit finds nothing and starts at 0.
let pending: { slug: string; frame: number } | null = null;

export function setDetailFrame(slug: string, frame: number) {
  pending = { slug, frame };
}

/** The frame to open `slug` on — read in a state initializer. Left in place
 * (Strict Mode runs initializers twice); clear it once mounted. */
export function peekDetailFrame(slug: string | undefined) {
  return pending && pending.slug === slug ? pending.frame : 0;
}

export function clearDetailFrame() {
  pending = null;
}

// And the way back: the project page leaves the image it's showing, so the
// home column opens scrolled to that project's cover, on that image — the
// one the full-screen image shrinks back into.
let returning: { slug: string; frame: number } | null = null;

export function setReturnFrame(slug: string, frame: number) {
  returning = { slug, frame };
}

/** The project home should open on, if we're coming back from one. Left in
 * place like peekDetailFrame; clear it once mounted. */
export function peekReturn() {
  return returning;
}

export function clearReturn() {
  returning = null;
}
