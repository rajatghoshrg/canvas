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

    const [texts, setTexts] = useState([]);

    const [selectedTextId, setSelectedTextId] =
      useState(null);

    const [draggingTextId, setDraggingTextId] =
      useState(null);

    // Resize Canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;

      const resizeCanvas = () => {
        const ctx =
          canvas.getContext("2d");

        const savedImage =
          canvas.toDataURL();

        canvas.width =
          container.offsetWidth;

        canvas.height =
          Math.min(
            window.innerHeight * 0.75,
            700
          );

        ctx.fillStyle = boardColor;

        ctx.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

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

    // Background Change
    useEffect(() => {
      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

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

      saveState();
    }, [boardColor]);

    // Save State
    const saveState = () => {
      const canvas = canvasRef.current;

      const currentState =
        canvas.toDataURL();

      setHistory((prev) => [
        ...prev,
        currentState,
      ]);
    };

    // Coordinates
    const getCoordinates = (e) => {
      const canvas = canvasRef.current;

      const rect =
        canvas.getBoundingClientRect();

      return {
        x:
          ((e.clientX - rect.left) /
            rect.width) *
          canvas.width,

        y:
          ((e.clientY - rect.top) /
            rect.height) *
          canvas.height,
      };
    };

    // Add Text
    const addText = (x, y) => {
      const newText = {
        id: Date.now(),
        text: "Text",
        x,
        y,
        isEditing: true,
      };

      setTexts((prev) => [...prev, newText]);

      setSelectedTextId(newText.id);
    };

    // Start Drawing
    const startDrawing = (e) => {
      if (tool === "text") return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      setIsDrawing(true);

      ctx.beginPath();

      const { x, y } = getCoordinates(
        e.nativeEvent
      );

      ctx.moveTo(x, y);
    };

    // Draw
    const draw = (e) => {
      if (tool === "text") return;

      if (!isDrawing) return;

      if (
        e.nativeEvent &&
        "buttons" in e.nativeEvent &&
        e.nativeEvent.buttons !== 1
      )
        return;

      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      const { x, y } = getCoordinates(
        e.nativeEvent
      );

      setCursorPosition({
        x,
        y,
      });

      ctx.lineWidth = brushSize;

      ctx.lineCap = "round";

      ctx.lineJoin = "round";

      ctx.strokeStyle =
        tool === "eraser"
          ? boardColor
          : brushColor;

      ctx.lineTo(x, y);

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
          clientX: touch.clientX,
          clientY: touch.clientY,
        },
      };

      if (tool === "text") {
        const { x, y } = getCoordinates({
          clientX: touch.clientX,
          clientY: touch.clientY,
        });

        addText(x, y);

        return;
      }

      startDrawing(fakeEvent);
    };

    // Touch Move
    const handleTouchMove = (e) => {
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
          clientX: touch.clientX,
          clientY: touch.clientY,
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

    // Mouse Move
    const handleMouseMove = (e) => {
      const { x, y } = getCoordinates(
        e.nativeEvent
      );

      setCursorPosition({
        x,
        y,
      });

      draw(e);
    };

    // Canvas Click
    const handleCanvasClick = (e) => {
      if (tool !== "text") return;

      if (selectedTextId) return;

      const { x, y } = getCoordinates(
        e.nativeEvent
      );

      addText(x, y);
    };

    // Move Text
    const moveText = (id, x, y) => {
      const canvas = canvasRef.current;

      const paddingX = 120;
      const paddingY = 60;

      const clampedX = Math.max(
        0,
        Math.min(
          x,
          canvas.width - paddingX
        )
      );

      const clampedY = Math.max(
        0,
        Math.min(
          y,
          canvas.height - paddingY
        )
      );

      setTexts((prev) =>
        prev.map((text) =>
          text.id === id
            ? {
              ...text,
              x: clampedX,
              y: clampedY,
            }
            : text
        )
      );
    };

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center p-4"

        onMouseMove={(e) => {
          if (!draggingTextId) return;

          const { x, y } = getCoordinates(
            e.nativeEvent
          );

          moveText(
            draggingTextId,
            x,
            y
          );
        }}

        onTouchMove={(e) => {
          e.preventDefault();

          if (!draggingTextId) return;

          const touch = e.touches[0];

          const { x, y } =
            getCoordinates({
              clientX: touch.clientX,
              clientY: touch.clientY,
            });

          moveText(
            draggingTextId,
            x,
            y
          );
        }}

        onMouseUp={() =>
          setDraggingTextId(null)
        }

        onTouchEnd={() =>
          setDraggingTextId(null)
        }

        onTouchCancel={() =>
          setDraggingTextId(null)
        }
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
            onClick={handleCanvasClick}
          />

          {/* TEXTS */}
          {texts.map((item) => (
            <div
              key={item.id}
              className="absolute"
              style={{
                left: item.x,
                top: item.y,
                cursor:
                  draggingTextId ===
                    item.id
                    ? "grabbing"
                    : "grab",
              }}
            >
              {/* Drag Handle */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setDraggingTextId(
                    item.id
                  );
                }}

                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setDraggingTextId(
                    item.id
                  );
                }}

                className="
                  w-10 h-2 mb-2 mx-auto
                  rounded-full
                  bg-white/30
                  cursor-grab
                  active:cursor-grabbing
                "
              />

              {item.isEditing ? (
                <textarea
                  value={item.text}
                  rows={2}
                  autoFocus

                  onChange={(e) =>
                    setTexts((prev) =>
                      prev.map((text) =>
                        text.id === item.id
                          ? {
                            ...text,
                            text:
                              e.target.value,
                          }
                          : text
                      )
                    )
                  }

                  onBlur={() => {
                    setTexts((prev) =>
                      prev.map((text) =>
                        text.id === item.id
                          ? {
                            ...text,
                            isEditing: false,
                          }
                          : text
                      )
                    );

                    setSelectedTextId(
                      null
                    );
                  }}

                  className="
                    min-w-[120px]
                    max-w-[220px]
                    max-w-[70vw]
                    outline-none
                    resize-none
                    font-semibold
                    text-lg
                    px-3 py-2
                    rounded-xl
                    border
                    shadow-lg
                  "

                  style={{
                    color:
                      boardColor ===
                        "#ffffff"
                        ? "#000000"
                        : "#ffffff",

                    backgroundColor:
                      boardColor ===
                        "#ffffff"
                        ? "rgba(255,255,255,0.95)"
                        : "rgba(0,0,0,0.85)",

                    borderColor:
                      boardColor ===
                        "#ffffff"
                        ? "#000000"
                        : "#ffffff",
                  }}
                />
              ) : (
                <div
                  onClick={() =>
                    setSelectedTextId(
                      item.id
                    )
                  }

                  onDoubleClick={() =>
                    setTexts((prev) =>
                      prev.map((text) =>
                        text.id === item.id
                          ? {
                            ...text,
                            isEditing: true,
                          }
                          : text
                      )
                    )
                  }

                  onTouchStart={() =>
                    setTexts((prev) =>
                      prev.map((text) =>
                        text.id === item.id
                          ? {
                            ...text,
                            isEditing: true,
                          }
                          : text
                      )
                    )
                  }

                  className="
                    px-3 py-2
                    rounded-xl
                    font-semibold
                    text-lg
                    whitespace-pre-wrap
                    cursor-text
                  "

                  style={{
                    color:
                      boardColor ===
                        "#ffffff"
                        ? "#000000"
                        : "#ffffff",
                  }}
                >
                  {item.text}
                </div>
              )}

              {/* Delete */}
              {selectedTextId ===
                item.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      setTexts((prev) =>
                        prev.filter(
                          (text) =>
                            text.id !==
                            item.id
                        )
                      );

                      setSelectedTextId(
                        null
                      );
                    }}

                    className="
                    absolute
                    -top-3
                    -right-3
                    w-6
                    h-6
                    rounded-full
                    bg-red-500
                    text-white
                    text-xs
                  "
                  >
                    ✕
                  </button>
                )}
            </div>
          ))}

          {/* Eraser Preview */}
          {tool === "eraser" && (
            <div
              className="
                absolute
                pointer-events-none
                rounded-full
                border
                z-50
                transition-all
                duration-75
              "
              style={{
                width:
                  brushSize * 1.5,

                height:
                  brushSize * 1.5,

                left:
                  cursorPosition.x,

                top:
                  cursorPosition.y,

                transform:
                  "translate(-50%, -50%)",

                boxShadow:
                  boardColor ===
                    "#ffffff"
                    ? "0 0 0 1px rgba(0,0,0,0.2)"
                    : "0 0 0 1px rgba(255,255,255,0.2)",

                borderColor:
                  boardColor ===
                    "#ffffff"
                    ? "#000000"
                    : "#ffffff",

                backgroundColor:
                  boardColor ===
                    "#ffffff"
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(0,0,0,0.85)",
              }}
            />
          )}

          {/* Save Button */}
          <button
            onClick={saveCanvas}
            className="
              absolute
              bottom-4
              right-4
              md:bottom-6
              md:right-6
              px-5
              py-3
              rounded-2xl
              bg-white
              text-black
              font-medium
              shadow-xl
              hover:scale-105
              transition-all
              duration-300
            "
          >
            Save PNG
          </button>
        </div>
      </div>
    );
  }
);

export default CanvasBoard;