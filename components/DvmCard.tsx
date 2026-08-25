import Wordmark from "./Wordmark";

// The blue plate the name sits on. `blank` swaps the lettering for solid bars
// — same footprint, no text — for the places the card is decoration rather
// than a masthead.
export default function DvmCard({
  variant = "text",
  color = "bg-blue-900",
  children,
}: {
  variant?: "text" | "blank";
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`relative ${color} h-[33.3dvh] lg:h-[45dvh]   flex flex-col items-start lg:items-start  justify-between p-8 group shadow-md  aspect-video gap-y-4`}
    >
      <Wordmark blank={variant === "blank"} />
      {children}
    </div>
  );
}
