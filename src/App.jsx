import React, {
  useState,
  useRef,
} from "react";

import Toolbar from "./components/Toolbar";
import CanvasBoard from "./components/CanvasBoard";
import BoardColor from "./components/BoardColor";

export default function App() {
  // Tool State
  const [tool, setTool] =
    useState("pencil");

  // Brush Size
  const [brushSize, setBrushSize] =
    useState(5);

  // Brush Color
  const [brushColor, setBrushColor] =
    useState("#ffffff");

  // Board Color
  const [boardColor, setBoardColor] =
    useState("#111111");

  // Canvas Ref
  const canvasRef = useRef(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl" />

      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen flex-col items-center px-4 py-6 md:px-8">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Edu Canvas 
          </h1>

          <p className="mt-2 text-sm md:text-base text-zinc-400">
            Interactive Drawing & Learning Workspace
          </p>
        </div>

        {/* Top Controls */}
        <div className="w-full max-w-7xl flex flex-col gap-4">

          {/* Board Colors */}
          <BoardColor
            boardColor={boardColor}
            setBoardColor={setBoardColor}
          />
          
          {/* Toolbar */}
          <Toolbar
            tool={tool}
            setTool={setTool}
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            brushColor={brushColor}
            setBrushColor={setBrushColor}
            undo={() =>
              canvasRef.current?.undo()
            }
            redo={() =>
              canvasRef.current?.redo()
            }
            saveCanvas={() =>
              canvasRef.current?.saveCanvas()
            }
          />
        </div>

        {/* Canvas Section */}
        <div className="mt-6 flex w-full flex-1 items-center justify-center">
          
          <div className="w-full max-w-7xl h-[75vh] md:h-[80vh] overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.05)] transition-all duration-500 hover:border-white/20">
            
            <CanvasBoard
              ref={canvasRef}
              tool={tool}
              brushSize={brushSize}
              brushColor={brushColor}
              boardColor={boardColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}