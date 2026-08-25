// Crumbs read as file names: lowercase, ASCII, hyphen-joined. Björk & Berries
// becomes bjork-and-berries.
//
// NFD splits an accented letter into its base plus a combining mark, so
// stripping the marks turns å/ä into a and ö into o. The Nordic letters that
// have no decomposition are mapped by hand before that.
const LETTERS: Record<string, string> = {
  ø: "o",
  æ: "ae",
  œ: "oe",
  ß: "ss",
  đ: "d",
  ð: "d",
  þ: "th",
  ł: "l",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[øæœßđðþł]/g, (c) => LETTERS[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
