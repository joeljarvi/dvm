import AboutSection from "@/components/AboutSection";
import Layer from "@/components/Layer";

// Level 4 — intercepts /about, layered on top of everything else.
export default function AboutModal() {
  return (
    <Layer level={3}>
      <AboutSection />
    </Layer>
  );
}
