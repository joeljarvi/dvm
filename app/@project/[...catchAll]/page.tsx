// Match any route the @project slot doesn't otherwise handle and render null,
// so navigating to /personal or /commissioned closes an open project modal.
// The (.) interception routes are more specific and still win at their URLs.
export default function CatchAll() {
  return null;
}
