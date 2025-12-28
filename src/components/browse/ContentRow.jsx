import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play, Info } from "lucide-react";

export default function ContentRow({ title, content, user }) {
  const navigate = useNavigate();

  const handleClick = (contentId) => {
    navigate(createPageUrl(`Watch?id=${contentId}`));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <h2 className="text-sm font-semibold tracking-wider uppercase mb-4 text-gray-300">{title}</h2>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {content.map((item) => (
            <div
              key={item.id}
              className="flex-none w-48 sm:w-56 snap-start group cursor-pointer"
              onClick={() => handleClick(item.id)}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden content-card-hover">
                <img
                  src={item.poster_url}
                  alt={item.title}
                  className="w-full h-full object-cover bg-gradient-to-br from-gray-800 to-black"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                    {item.release_year && (
                      <p className="text-xs text-gray-300">{item.release_year}</p>
                    )}
                    {item.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-xs">{item.rating}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
}