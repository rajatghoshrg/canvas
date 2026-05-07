import React from "react";
import { Type } from "lucide-react";

import {
  FaPencilAlt,
  FaEraser,
  FaUndo,
  FaRedo,
  FaSave,
} from "react-icons/fa";

export default function Toolbar({
  tool,
  setTool,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  undo,
  redo,
  saveCanvas,
}) {
  const tools = [
    {
      name: "pencil",
      label: "Pencil",
      icon: <FaPencilAlt size={18} />,
      action: () => setTool("pencil"),
    },
    {
      name: "eraser",
      label: "Eraser",
      icon: <FaEraser size={18} />,
      action: () => setTool("eraser"),
    },
    {
      name: "text",
      label: "Text",
      icon: <Type size={18} />,
      action: () => setTool("text"),
    }
  ];

  const actionButtons = [
    {
      name: "undo",
      label: "Undo",
      icon: <FaUndo size={18} />,
      action: undo,
    },
    {
      name: "redo",
      label: "Redo",
      icon: <FaRedo size={18} />,
      action: redo,
    },
  ];

  return (
    <div className="w-full flex justify-center px-4 py-4">

      {/* Glass Toolbar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-3 md:gap-4 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl transition-all duration-300 hover:border-white/20">

        {/* Drawing Tools */}
        <div className="flex items-center gap-3">
          {tools.map((item) => {
            const isActive =
              tool === item.name;

            return (
              <button
                key={item.name}
                aria-label={item.label}
                onClick={item.action}
                className={`
                  relative p-3 rounded-2xl border
                  transition-all duration-300
                  hover:scale-105 active:scale-95
                  ${isActive
                    ? "bg-white text-black border-white shadow-lg ring-2 ring-white/50"
                    : "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:border-white/30"
                  }
                `}
              >
                {item.icon}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden lg:block h-10 w-px bg-white/10" />

        {/* Brush Size */}
        <div className="flex items-center gap-3 text-white">
          <span className="text-sm text-zinc-300 whitespace-nowrap">
            Brush Size
          </span>

          <input
            type="range"
            min="1"
            max="50"
            value={brushSize}
            onChange={(e) =>
              setBrushSize(
                Number(e.target.value)
              )
            }
            className="w-28 md:w-36 accent-white cursor-pointer"
          />

          <span className="text-sm w-8 text-center font-medium">
            {brushSize}
          </span>
        </div>

        {/* Divider */}
        <div className="hidden lg:block h-10 w-px bg-white/10" />

        {/* Brush Color */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-300 whitespace-nowrap">
            Brush
          </span>

          {/* Circle Color Picker */}
          <label className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 cursor-pointer hover:scale-105 transition-all duration-300">

            <input
              type="color"
              value={brushColor}
              onChange={(e) =>
                setBrushColor(e.target.value)
              }
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: brushColor,
              }}
            />
          </label>
        </div>

        {/* Divider */}
        <div className="hidden lg:block h-10 w-px bg-white/10" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">

          {/* Undo / Redo */}
          {actionButtons.map((item) => (
            <button
              key={item.name}
              aria-label={item.label}
              onClick={item.action}
              className="p-3 rounded-2xl border border-white/10 bg-white/10 text-white transition-all duration-300 hover:bg-white hover:text-black hover:scale-105 active:scale-95"
            >
              {item.icon}
            </button>
          ))}

          {/* Save Button */}
          <button
            aria-label="Save PNG"
            onClick={saveCanvas}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-medium shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <FaSave size={16} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}