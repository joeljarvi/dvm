// The metadata block under a cover: one labelled row per field it is given.
// Fields with nothing in them are dropped rather than printed as bare labels,
// since most of Project's are optional.
export default function InfoLayout({
  category,
  title,
  model,
  client,
  agency,
  counter,
}: {
  category?: string;
  title?: string;
  /** Personal work credits a model where commissioned work credits a client. */
  model?: string;
  client?: string;
  agency?: string;
  /** Position within the project's images, e.g. `1/5`. */
  counter?: string;
}) {
  // The title is the one line that answers the panel's hover; the rest hold
  // the block's grey.
  const fields = [
    { label: "title", value: title, lifts: true },
    { label: "model", value: model },
    { label: "client", value: client },
    // Set apart from the credits above it when there is one.
    { label: "agency", value: agency, spaced: true },
  ].filter((f) => f.value);

  if (!fields.length && !counter) return null;

  return (
    <div className="font-selecta relative flex flex-row items-start justify-between gap-x-4 w-full font-normal px-0 tracking-wide text-[0.8rem] text-neutral-400">
      <div className="flex flex-col">
        {fields.map((f) => (
          <h3 key={f.label} className={`flex gap-x-1 ${f.spaced ? "" : ""}`}>
            {/* `group` is on the panel Link this block sits inside. */}
            <span
              className={`transition-colors duration-300 ease-out ${
                f.lifts ? "group-hover:text-blue-700" : ""
              }`}
            >
              {f.value}
            </span>
          </h3>
        ))}
      </div>

      {/* Held to the right edge by the row's justify-between. */}
      {counter && <span className="shrink-0 tabular-nums">{counter}</span>}
    </div>
  );
}
