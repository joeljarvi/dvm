// Match any route the @overlay slot doesn't otherwise handle and render null,
// so navigating to /personal or /commissioned closes an open about/index modal.
// The (.) interception routes are more specific and still win at their URLs.
export default function CatchAll() {
  return null;
}
