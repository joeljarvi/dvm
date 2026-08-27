// The metadata line under a cover: what the work is on the left, who it was
// for on the right. The image counter is its own component, above this.
export default function InfoLayout({
  title,
  model,
  client,
  agency,
  highlight = false,
}: {
  title?: string;
  /** Personal work credits a model where commissioned work credits a client. */
  model?: string;
  client?: string;
  agency?: string;
  /** The cover is the one in view, so its title is lit without a pointer. */
  highlight?: boolean;
}) {
  const credits = [model, client, agency].filter(Boolean);
  if (!title && !credits.length) return null;

  return (
    <div className="flex justify-between items-start gap-x-4 w-full font-selecta  font-normal px-0 tracking-wide text-[0.8rem] text-neutral-300">
      {/* The one line that answers the panel's hover. `group` is on the
          column this block sits inside. */}
      <h3
        className={`transition-colors duration-300  ease-out group-hover:text-blue-700 ${
          highlight ? "text-blue-700" : ""
        }`}
      >
        {title}
      </h3>

      <div className="justify-self-end flex flex-col items-end text-right">
        {model && <h3>{model}</h3>}
        {client && (
          <h3
            className={`transition-colors duration-300  ease-out group-hover:text-blue-700 ${
              highlight ? "text-blue-700" : ""
            }`}
          >
            {client}
          </h3>
        )}
        {/* Set apart from the credits above it when there is one. */}
        {agency && <h3 className="text-neutral-300"> {agency} </h3>}
      </div>
    </div>
  );
}
