let pending: { slug: string; frame: number } | null = null;

export function setDetailFrame(slug: string, frame: number) {
  pending = { slug, frame };
}

export function peekDetailFrame(slug: string | undefined) {
  return pending && pending.slug === slug ? pending.frame : 0;
}

export function clearDetailFrame() {
  pending = null;
}

let returning: { slug: string; frame: number } | null = null;

export function setReturnFrame(slug: string, frame: number) {
  returning = { slug, frame };
}

export function peekReturn() {
  return returning;
}

export function clearReturn() {
  returning = null;
}
