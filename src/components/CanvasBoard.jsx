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
          window.innerHeight * 0.75;

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
    const draw = (e) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

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

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4"
      >
        <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black/20 backdrop-blur-xl">
          
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* Floating Save Button */}
          <button
            onClick={saveCanvas}
            className="absolute bottom-6 right-6 px-5 py-3 rounded-2xl bg-white text-black font-medium shadow-xl hover:scale-105 transition-all duration-300"
          >
            Save PNG
          </button>
        </div>
      </div>
    );
  }
);

export default CanvasBoard;