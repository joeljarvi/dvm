import Counter from "@/components/Counter";

// The metadata line under a cover: what the work is on the left, who it was
// for on the right — now the image counter, swapped in for the caption
// (which moved to sit on the image itself, bottom-center — see Cover).
export default function InfoLayout({
  title,
  model,
  client,
  agency,
  frame,
  total,
  highlight = false,
}: {
  title?: string;
  /** Personal work credits a model where commissioned work credits a client. */
  model?: string;
  client?: string;
  agency?: string;
  /** Which of the project's images is up, 1-based, and how many it has. */
  frame?: number;
  total?: number;
  /** The cover is the one in view, so its title is lit without a pointer. */
  highlight?: boolean;
}) {
  const credits = [model, client, agency].filter(Boolean);
  if (!title && !credits.length && frame === undefined) return null;

  return (
    <div className="flex  justify-between items-baseline gap-x-4 w-full font-selecta  font-normal px-0 tracking-wide text-[0.8rem] text-neutral-400">
      {/* The one line that answers the panel's hover. `group` is on the
          column this block sits inside. */}

      <div className="justify-self-end flex flex-col items-start text-left">
        <h3
          className={`transition-colors duration-300  ease-out group-hover:text-blue-700 ${
            highlight ? "text-blue-700" : ""
          }`}
        >
          {title}
        </h3>
        {model && model !== title && <h3>{model}</h3>}
        {client && client !== title && (
          <h3
            className={`transition-colors duration-300  ease-out group-hover:text-blue-700 ${
              highlight ? "text-blue-700" : ""
            }`}
          >
            {client}
          </h3>
        )}
        {/* Set apart from the credits above it when there is one. */}
        {agency && <h3 className="text-neutral-400"> {agency} </h3>}
      </div>
      <Counter frame={frame} total={total} />
    </div>
  );
}
