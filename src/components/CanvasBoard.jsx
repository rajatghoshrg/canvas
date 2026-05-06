import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

const CanvasBoard = forwardRef(
  (
    {
      tool,
      brushColor,
      brushSize,
      boardColor,
    },
    ref
  ) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [isDrawing, setIsDrawing] =
      useState(false);

    const [history, setHistory] = useState([]);

    const [redoHistory, setRedoHistory] =
      useState([]);

    const [cursorPosition, setCursorPosition] =
      useState({
        x: 0,
        y: 0,
      });

    // Resize Canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      const resizeCanvas = () => {
        const ctx =
          canvas.getContext("2d");

        // Save current drawing
        const savedImage =
          canvas.toDataURL();

        // Resize canvas
        canvas.width =
          container.offsetWidth;

        canvas.height =
          Math.min(
            window.innerHeight * 0.75,
            700
          );

        // Fill background
        ctx.fillStyle = boardColor;

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Restore image
        const img = new Image();

        img.src = savedImage;

        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
      };

      resizeCanvas();

      window.addEventListener(
        "resize",
        resizeCanvas
      );

      return () => {
        window.removeEventListener(
          "resize",
          resizeCanvas
        );
      };
    }, []);

    // Update Background Color
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx =
        canvas.getContext("2d");

      // Clear canvas
      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Apply new background
      ctx.fillStyle = boardColor;

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Save fresh state
      saveState();
    }, [boardColor]);

    // Save Canvas State
    const saveState = () => {
      const canvas = canvasRef.current;

      const currentState =
        canvas.toDataURL();

      setHistory((prev) => [
        ...prev,
        currentState,
      ]);
    };

    // Start Drawing
    const startDrawing = (e) => {
      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      setIsDrawing(true);

      ctx.beginPath();

      ctx.moveTo(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );
    };

    // Draw
    // Draw
    const draw = (e) => {
      if (!isDrawing || e.buttons !== 1)
        return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      setCursorPosition({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });

      ctx.lineWidth = brushSize;

      ctx.lineCap = "round";

      ctx.lineJoin = "round";

      ctx.strokeStyle =
        tool === "eraser"
          ? boardColor
          : brushColor;

      ctx.lineTo(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );

      ctx.stroke();
    };

    // Touch Start
    const handleTouchStart = (e) => {
      e.preventDefault();

      const touch = e.touches[0];

      const canvas = canvasRef.current;

      const rect =
        canvas.getBoundingClientRect();

      setCursorPosition({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      });

      const fakeEvent = {
        nativeEvent: {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        },
      };

      startDrawing(fakeEvent);
    };

    // Touch Move
    const handleTouchMove = (e) => {
      e.preventDefault();

      const touch = e.touches[0];

      const canvas = canvasRef.current;

      const rect =
        canvas.getBoundingClientRect();

      const fakeEvent = {
        nativeEvent: {
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        },
      };

      draw(fakeEvent);
    };

    // Stop Drawing
    const stopDrawing = () => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      ctx.closePath();

      setIsDrawing(false);

      // Clear redo history
      setRedoHistory([]);

      saveState();
    };

    // Undo
    const undo = () => {
      if (history.length <= 1) return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      const newHistory = [...history];

      const lastState =
        newHistory.pop();

      setRedoHistory((prev) => [
        ...prev,
        lastState,
      ]);

      setHistory(newHistory);

      const previousState =
        newHistory[
        newHistory.length - 1
        ];

      const img = new Image();

      img.src = previousState;

      img.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.fillStyle = boardColor;

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(img, 0, 0);
      };
    };

    // Redo
    const redo = () => {
      if (redoHistory.length === 0)
        return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      const redoState =
        redoHistory[
        redoHistory.length - 1
        ];

      const updatedRedo = [
        ...redoHistory,
      ];

      updatedRedo.pop();

      setRedoHistory(updatedRedo);

      setHistory((prev) => [
        ...prev,
        redoState,
      ]);

      const img = new Image();

      img.src = redoState;

      img.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.fillStyle = boardColor;

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        ctx.drawImage(img, 0, 0);
      };
    };

    // Save PNG
    const saveCanvas = () => {
      const canvas = canvasRef.current;

      const link =
        document.createElement("a");

      link.download = "painting.png";

      link.href =
        canvas.toDataURL("image/png");

      link.click();
    };

    // Expose Functions
    useImperativeHandle(ref, () => ({
      undo,
      redo,
      saveCanvas,
    }));

    // Initial State
    useEffect(() => {
      saveState();
    }, []);

    const handleMouseMove = (e) => {
      setCursorPosition({
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      });

      draw(e);
    };

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4"
      >
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 backdrop-blur-xl">

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className={`w-full h-full touch-none select-none ${tool === "eraser"
              ? "cursor-none"
              : "cursor-crosshair"
              }`}
            style={{
              touchAction: "none",
            }}

            onMouseDown={startDrawing}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onMouseOut={stopDrawing}

            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={stopDrawing}
          />

          {/* Eraser Preview */}
          {tool === "eraser" && (
            <div
              className="absolute pointer-events-none rounded-full border z-50 transition-all duration-75"
              style={{
                width: brushSize * 1.5,
                height: brushSize * 1.5,
                left: cursorPosition.x,
                top: cursorPosition.y,
                transform: "translate(-50%, -50%)",
                boxShadow:
                  boardColor === "#ffffff"
                    ? "0 0 0 1px rgba(0,0,0,0.2)"
                    : "0 0 0 1px rgba(255,255,255,0.2)",
                borderColor:
                  boardColor === "#ffffff"
                    ? "#000000"
                    : "#ffffff",
                backgroundColor:
                  boardColor === "#ffffff"
                    ? "rgba(0,0,0,0.15)"
                    : "rgba(255,255,255,0.15)",
              }}
            />
          )}

          {/* Floating Save Button */}
          <button
            onClick={saveCanvas}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 px-5 py-3 rounded-2xl bg-white text-black font-medium shadow-xl hover:scale-105 transition-all duration-300"
          >
            Save PNG
          </button>
        </div>
      </div>
    );
  }
);

export default CanvasBoard;