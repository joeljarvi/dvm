import { Button } from "@/components/ui/button";

export default function Error404() {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen font-diatype">
      Error 404
      <Button variant="link" size="sm" className="absolute top-0 left-0 z-10">
        Back
      </Button>
    </div>
  );
}
