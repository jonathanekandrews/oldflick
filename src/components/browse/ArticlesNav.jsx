import React from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ArticlesNav() {
  const location = useLocation();
  const isActive = location.pathname.includes("Articles");

  return (
    <Link to={createPageUrl("Articles")}>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
          isActive
            ? "text-[var(--oldflick-gold)] bg-[var(--oldflick-gold)]/10"
            : "text-white hover:text-[var(--oldflick-gold)] hover:bg-[var(--oldflick-gold)]/5"
        }`}
      >
        <BookOpen className="w-4 h-4" />
        <span>ARTICLES</span>
      </button>
    </Link>
  );
}
