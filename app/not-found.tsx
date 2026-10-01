import Error404 from "@/components/Error404";

// Every 404 on the site — unmatched URLs and `notFound()` calls alike (e.g. an
// unknown project in app/[category]/[slug]).
export default function NotFound() {
  return <Error404 />;
}
