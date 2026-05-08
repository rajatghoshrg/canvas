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

    const [isTyping, setIsTyping] =
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

    const [hoveredTextId, setHoveredTextId] =
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

    // Background
    useEffect(() => {
      const canvas = canvasRef.current;

      const ctx =
        canvas.getContext("2d");

      ctx.fillStyle = boardColor;

      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );
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
        fontSize: 24,
        isEditing: true,
      };

      setTexts((prev) => [...prev, newText]);

      setSelectedTextId(newText.id);
    };

    // Start Drawing
    const startDrawing = (e) => {
      if (tool === "text") return;

      if (isTyping) return;

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

      if (isTyping) return;

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

      if (isTyping) return;

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
        if (selectedTextId) return;

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

      if (isTyping) return;

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

      const exportCanvas =
        document.createElement("canvas");

      exportCanvas.width = canvas.width;

      exportCanvas.height =
        canvas.height;

      const exportCtx =
        exportCanvas.getContext("2d");

      exportCtx.fillStyle = boardColor;

      exportCtx.fillRect(
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );

      exportCtx.drawImage(canvas, 0, 0);

      texts.forEach((item) => {
        exportCtx.font = `bold ${item.fontSize}px Arial`;

        exportCtx.fillStyle =
          boardColor === "#ffffff"
            ? "#000000"
            : "#ffffff";

        const lines =
          item.text.split("\n");

        lines.forEach((line, index) => {
          exportCtx.fillText(
            line,
            item.x,
            item.y +
            index *
            item.fontSize *
            1.4
          );
        });
      });

      const link =
        document.createElement("a");

      link.download = "painting.png";

      link.href =
        exportCanvas.toDataURL(
          "image/png"
        );

      link.click();
    };

    useImperativeHandle(ref, () => ({
      undo,
      redo,
      saveCanvas,
    }));

    useEffect(() => {
      saveState();
    }, []);

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
      setTexts((prev) =>
        prev.map((text) =>
          text.id === id
            ? {
              ...text,
              x,
              y,
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

          const { x, y } =
            getCoordinates(
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
              clientX:
                touch.clientX,
              clientY:
                touch.clientY,
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
            onMouseMove={
              handleMouseMove
            }
            onMouseUp={stopDrawing}
            onMouseLeave={
              stopDrawing
            }
            onMouseOut={
              stopDrawing
            }
            onTouchStart={
              handleTouchStart
            }
            onTouchMove={
              handleTouchMove
            }
            onTouchEnd={
              stopDrawing
            }
            onClick={
              handleCanvasClick
            }
          />

          {/* TEXTS */}
          {texts.map((item) => (
            <div
              key={item.id}
              className="absolute z-50"
              onMouseEnter={() =>
                setHoveredTextId(item.id)
              }
              onMouseLeave={() =>
                setHoveredTextId(null)
              }
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
              {(hoveredTextId ===
                item.id ||
                selectedTextId ===
                item.id) && (
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
                    absolute
                    -top-5
                    left-1/2
                    -translate-x-1/2
                    w-10
                    h-2
                    rounded-full
                    bg-white/40
                    cursor-grab
                    active:cursor-grabbing
                    transition-all
                    duration-200
                  "
                  />
                )}

              {/* FONT CONTROLS */}
              {selectedTextId ===
                item.id &&
                item.isEditing && (
                  <div className="absolute -top-10 left-0 flex items-center gap-2 bg-black/70 px-2 py-1 rounded-lg border border-white/20">

                    <button
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        setTexts((prev) =>
                          prev.map((text) =>
                            text.id === item.id
                              ? {
                                ...text,
                                fontSize:
                                  Math.max(
                                    12,
                                    text.fontSize - 2
                                  ),
                              }
                              : text
                          )
                        )
                      }
                      className="w-7 h-7 rounded bg-white text-black font-bold"
                    >
                      -
                    </button>

                    <span className="text-white text-sm">
                      {
                        item.fontSize
                      }
                    </span>

                    <button
                      onMouseDown={(e) =>
                        e.preventDefault()
                      }
                      onClick={() =>
                        setTexts((prev) =>
                          prev.map((text) =>
                            text.id === item.id
                              ? {
                                ...text,
                                fontSize:
                                  Math.min(
                                    120,
                                    text.fontSize + 2
                                  ),
                              }
                              : text
                          )
                        )
                      }
                      className="w-7 h-7 rounded bg-white text-black font-bold"
                    >
                      +
                    </button>
                  </div>
                )}

              {/* Editing */}
              {item.isEditing ? (
                <textarea
                  value={item.text}
                  rows={2}
                  autoFocus
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onFocus={() => {
                    setIsTyping(true);

                    setSelectedTextId(
                      item.id
                    );
                  }}
                  onBlur={() => {
                    setTexts((prev) =>
                      prev.map(
                        (text) =>
                          text.id ===
                            item.id
                            ? {
                              ...text,
                              isEditing:
                                false,
                            }
                            : text
                      )
                    );

                    setIsTyping(false);
                  }}
                  onInput={(e) => {
                    e.target.style.height =
                      "auto";

                    e.target.style.height =
                      e.target
                        .scrollHeight +
                      "px";
                  }}
                  onChange={(e) =>
                    setTexts((prev) =>
                      prev.map(
                        (text) =>
                          text.id ===
                            item.id
                            ? {
                              ...text,
                              text:
                                e.target
                                  .value,
                            }
                            : text
                      )
                    )
                  }
                  className="
                    min-w-[120px]
                    w-auto
                    max-w-[70vw]
                    outline-none
                    resize-none
                    font-semibold
                    px-3 py-2
                    border-2
                    pointer-events-auto
                  "
                  style={{
                    height: "auto",

                    fontFamily:
                      "Arial",

                    lineHeight: "1.4",

                    fontSize: `${item.fontSize}px`,

                    color:
                      boardColor ===
                        "#ffffff"
                        ? "#000000"
                        : "#ffffff",

                    backgroundColor:
                      "transparent",

                    borderColor:
                      boardColor ===
                        "#ffffff"
                        ? "#000000"
                        : "#ffffff",
                  }}
                />
              ) : (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={() =>
                    setSelectedTextId(
                      item.id
                    )
                  }
                  onDoubleClick={() =>
                    setTexts((prev) =>
                      prev.map(
                        (text) =>
                          text.id ===
                            item.id
                            ? {
                              ...text,
                              isEditing:
                                true,
                            }
                            : text
                      )
                    )
                  }
                  className="
                    px-3 py-2
                    font-semibold
                    whitespace-pre-wrap
                    cursor-text
                  "
                  style={{
                    fontFamily:
                      "Arial",

                    lineHeight: "1.4",

                    fontSize: `${item.fontSize}px`,

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
                      w-8
                      h-8
                      rounded-full
                      bg-red-500
                      text-white
                      text-xs
                      flex
                      items-center
                      justify-center
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
                z-40
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
              z-50
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