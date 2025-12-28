import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play } from "lucide-react";

export default function ContentCard({ content, user }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(createPageUrl(`Watch?id=${content.id}`));
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden content-card-hover">
        <img
          src={content.poster_url}
          alt={content.title}
          className="w-full h-full object-cover bg-gradient-to-br from-gray-800 to-black"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-semibold text-sm mb-1 line-clamp-2 text-white">
              {content.title}
            </h3>
            {content.release_year && (
              <p className="text-xs text-gray-300">{content.release_year}</p>
            )}
            {content.rating && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-yellow-500 text-xs">★</span>
                <span className="text-xs text-white">{content.rating}</span>
              </div>
            )}
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-current" />
          </div>
        </div>
      </div>
    </div>
  );
}