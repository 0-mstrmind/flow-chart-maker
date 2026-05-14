import { useEffect, useRef, useState, useCallback } from "react";
import {
  Excalidraw,
  convertToExcalidrawElements,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { useQueryStore } from "../store/query";

/** Normalize Mermaid syntax to only use shapes/arrows supported by @excalidraw/mermaid-to-excalidraw */
function sanitizeMermaid(code: string): string {
  // Process line by line to avoid cross-line regex corruption
  const lines = code
    .replace(/^```(?:mermaid)?\s*/im, "")
    .replace(/\s*```\s*$/im, "")
    .split("\n");

  const fixed = lines.map((line) => {
    // Normalize flowchart → graph
    line = line.replace(/^(\s*)flowchart\s+(TD|LR|BT|RL)/i, "$1graph $2");

    // Fix arrow variants BEFORE any shape substitutions
    line = line.replace(/--\[/g, "-->"); // --[ → -->
    line = line.replace(/--->+/g, "-->");  // ---> → -->
    // Single-dash -> only when not already part of -->
    line = line.replace(/(?<=[^-])->(?!>)/g, "-->");

    // Convert stadium shapes ([Label]) → (Label)
    line = line.replace(/\(\[([^\]]*)\]\)/g, "($1)");

    // Convert hexagon {{Label}} → {Label}
    line = line.replace(/\{\{([^}]*)\}\}/g, "{$1}");

    // Convert asymmetric shape >Label] → [Label]
    // Only match when it looks like a standalone node definition, NOT inside an arrow chain
    line = line.replace(/(?<!\-)\s*>([^\[\]>]*)\]/g, " [$1]");

    return line;
  });

  return fixed.join("\n").trim();
}

const DrawingCanvas = () => {
  const { data } = useQueryStore();
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertAndRender = useCallback(async (mermaidSyntax: string) => {
    const api = excalidrawAPIRef.current;
    if (!api) return;

    setIsConverting(true);
    setError(null);

    const cleaned = sanitizeMermaid(mermaidSyntax);
    console.log("[DrawingCanvas] Mermaid to parse:\n", cleaned);

    try {
      const { elements: skeletonElements } =
        await parseMermaidToExcalidraw(cleaned);

      const excalidrawElements = convertToExcalidrawElements(skeletonElements);

      api.updateScene({ elements: excalidrawElements });
      api.scrollToContent(excalidrawElements, {
        fitToContent: true,
        animate: true,
        duration: 400,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[DrawingCanvas] Parse failed:", msg);
      console.error("[DrawingCanvas] Raw input was:\n", cleaned);
      setError(`Diagram parse error: ${msg.split("\n")[0]}`);
    } finally {
      setIsConverting(false);
    }
  }, []);

  useEffect(() => {
    if (!data) return;
    convertAndRender(data);
  }, [data, convertAndRender]);

  // Dismiss error toast after 5 seconds
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div style={{ height: "100vh", position: "relative" }} className="z-10">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
        }}
        theme="dark"
        initialData={{
          appState: { collaborators: new Map() },
        }}
      />

      {/* Loading overlay — shown above canvas without destroying it */}
      {isConverting && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            zIndex: 30,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              color: "#e4e4e7",
              fontFamily: "inherit",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              Generating diagram…
            </span>
          </div>
        </div>
      )}

      {/* Error toast */}
      {error && (
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#3f1515",
            border: "1px solid #7f1d1d",
            color: "#fca5a5",
            padding: "10px 18px",
            borderRadius: "10px",
            fontSize: "13px",
            zIndex: 40,
            maxWidth: "420px",
            textAlign: "center",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {error}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DrawingCanvas;