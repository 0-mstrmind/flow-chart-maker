import { useState, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUp, Loader2, Pencil, Sparkles } from "lucide-react";
import { useQueryStore } from "../store/query";

type Mode = "generate" | "edit";

const InputBox = () => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("generate");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getData, editData, currentMermaid } = useQueryStore();

  const hasDiagram = Boolean(currentMermaid);

  const handleSubmit = async () => {
    if (!value.trim() || isLoading) return;
    setIsLoading(true);

    const success =
      mode === "edit" && hasDiagram
        ? await editData(value)
        : await getData(value);

    setIsLoading(false);
    if (success) {
      setValue("");
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleModeSwitch = (next: Mode) => {
    setMode(next);
    setValue("");
    textareaRef.current?.focus();
  };

  return (
    <div className="fixed z-20 bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center">
        {/* Mode toggle — only visible when a diagram exists */}
        {hasDiagram && (
          <div className="flex justify-center mb-4 transition-all duration-300">
            <div className="flex items-center gap-1 p-1 bg-zinc-950/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
              <button
                onClick={() => handleModeSwitch("generate")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  mode === "generate"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Sparkles size={14} />
                New
              </button>
              <button
                onClick={() => handleModeSwitch("edit")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                  mode === "edit"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                }`}
              >
                <Pencil size={14}/>
                Edit
              </button>
            </div>
          </div>
        )}

        {/* Input container */}
        <div
          className={`
            relative flex items-end gap-3 rounded-3xl p-3 shadow-2xl w-full
            bg-zinc-950/70 backdrop-blur-xl transition-all duration-300
            ${
              isFocused
                ? "border border-zinc-400/30 shadow-[0_8px_30px_rgba(255,255,255,0.08)]"
                : "border border-white/10 shadow-black/50 hover:border-white/20"
            }
          `}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              mode === "edit" && hasDiagram
                ? "Describe your changes... (e.g. 'add a retry step after the error node')"
                : "Describe a diagram to generate..."
            }
            rows={1}
            disabled={isLoading}
            className="
              flex-1 resize-none border-0 bg-transparent px-2 py-1.5 text-[15px]
              text-zinc-100 placeholder:text-zinc-500
              focus-visible:ring-0 focus-visible:ring-offset-0
              min-h-[44px] max-h-48 leading-relaxed
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#3f3f46 transparent",
            }}
          />

          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="icon"
            className={`
              h-[40px] w-[40px] shrink-0 rounded-2xl mb-0.5
              transition-all duration-300 ease-out
              ${
                !value.trim() || isLoading
                  ? "bg-zinc-800/80 text-zinc-600 cursor-not-allowed"
                  : mode === "edit" && hasDiagram
                  ? "bg-zinc-900 text-white border border-zinc-700/50 shadow-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-zinc-900 text-white border border-zinc-700/50 shadow-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
              }
            `}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
            ) : mode === "edit" && hasDiagram ? (
              <Pencil className="h-4 w-4 ml-0.5" strokeWidth={2.5} />
            ) : (
              <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
            )}
          </Button>
        </div>

        <p className="mt-4 text-center text-[11px] font-medium text-zinc-500 tracking-wide">
          Press{" "}
          <kbd className="rounded-md bg-zinc-800/80 border border-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 shadow-sm">
            Enter
          </kbd>{" "}
          to send <span className="mx-1.5 text-zinc-700">•</span>{" "}
          <kbd className="rounded-md bg-zinc-800/80 border border-white/5 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 shadow-sm">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
};

export default InputBox;