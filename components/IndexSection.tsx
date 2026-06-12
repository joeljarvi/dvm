"use client";

import { useState } from "react";
import { clients, models } from "@/lib/data";

const sortList = (list: string[], order: "asc" | "desc") =>
  [...list].sort((a, b) =>
    order === "asc" ? a.localeCompare(b, "sv") : b.localeCompare(a, "sv"),
  );

export default function IndexSection() {
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const sortedClients = sortList(clients, order);
  const sortedModels = sortList(models, order);

  return (
    <div className="relative flex flex-col w-full h-full pt-8 px-2.5 font-selecta overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
      <button
        className="self-start text-sm uppercase tracking-wider hover:text-pink-400 mb-4"
        onClick={() => setOrder((o) => (o === "asc" ? "desc" : "asc"))}
      >
        {order === "asc" ? "A–Z" : "Z–A"}
      </button>

      <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Commissioned</p>
      <ul className="flex flex-col gap-1 mb-6">
        {sortedClients.map((name) => (
          <li key={name} className="text-sm uppercase tracking-wide">{name}</li>
        ))}
      </ul>

      <p className="text-xs uppercase tracking-wider opacity-50 mb-1">Personal</p>
      <ul className="flex flex-col gap-1">
        {sortedModels.map((name) => (
          <li key={name} className="text-sm uppercase tracking-wide">{name}</li>
        ))}
      </ul>
    </div>
  );
}
