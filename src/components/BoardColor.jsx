import React from "react";

export default function BoardColor({
  boardColor,
  setBoardColor,
}) {
  const colors = [
    {
      name: "White",
      value: "#ffffff",
      text: "text-black",
      border: "border-zinc-300",
    },
    {
      name: "Black",
      value: "#111111",
      text: "text-white",
      border: "border-white/10",
    },
    {
      name: "Green",
      value: "#14532d",
      text: "text-white",
      border: "border-green-400/20",
    },
  ];

  return (
    <div className="w-full flex justify-center px-4">
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:border-white/20">
        
        {/* Title */}
        <span className="hidden sm:block text-sm text-zinc-300 font-medium">
          Board Color
        </span>

        {/* Color Buttons */}
        {colors.map((color) => {
          const isActive =
            boardColor === color.value;

          return (
            <button
              key={color.name}
              aria-label={color.name}
              onClick={() =>
                setBoardColor(color.value)
              }
              className={`
                relative overflow-hidden
                px-4 md:px-5 py-2
                rounded-2xl
                font-medium text-sm
                border
                transition-all duration-300
                hover:scale-105
                active:scale-95
                ${color.border}
                ${
                  isActive
                    ? "scale-105 shadow-lg ring-2 ring-white/60"
                    : "hover:border-white/30"
                }
              `}
              style={{
                backgroundColor: color.value,
              }}
            >
              {/* Glow Effect */}
              {isActive && (
                <div className="absolute inset-0 bg-white/10 blur-xl" />
              )}

              {/* Text */}
              <span
                className={`relative z-10 ${color.text}`}
              >
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}