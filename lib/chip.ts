// The section-label plate: a solid chip carrying the `cutout` inset shadow, so
// it reads as a hole cut through whatever sits behind it. Shared by the home
// panel labels (plain spans inside a Link) and the About/Index buttons in the
// nav, so the two sets stay one family.
//
// The leading overrides exist to beat the shadcn Button base and size classes
// when this is passed as `className` — they are inert on a plain span. The
// hover override neutralises the Button variant's hover fill: the plate does
// not light up, since the panel or bar underneath owns the hover feedback.
export const chip =
  "rounded-none border-0 h-auto bg-background hover:bg-background text-foreground text-xl font-selecta font-medium tracking-wide px-2 cutout";
