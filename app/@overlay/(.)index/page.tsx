import IndexSection from "@/components/IndexSection";
import Layer from "@/components/Layer";

// Level 4 — intercepts /index, layered on top of everything else.
export default function IndexModal() {
  return (
    <Layer level={4}>
      <IndexSection />
    </Layer>
  );
}
