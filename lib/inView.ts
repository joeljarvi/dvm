import { useEffect, useState, type RefObject } from "react";

/**
 * Whether an element is showing, by IntersectionObserver. Used to mark the
 * cover a column is currently parked on — with several covers in a scroller,
 * the one in view is the one being looked at.
 *
 * `threshold` is how much of it has to be visible to count.
 */
export function useInView(ref: RefObject<Element | null>, threshold = 0.6) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return inView;
}
