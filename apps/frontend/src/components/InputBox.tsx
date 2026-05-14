import { useState, useRef } from "react";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ArrowUp, Loader2 } from "lucide-react";
import { useQueryStore } from "../store/query";

const InputBox = () => {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { getData } = useQueryStore();

  const handleSubmit = async () => {
    if (!value.trim() || isLoading) return;
    setIsLoading(true);
    const success = await getData(value);
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

  return (
    <div className="fixed z-20 bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
      <div
        className={`
          relative flex items-end gap-2 rounded-2xl border p-3 shadow-lg
          bg-zinc-900 transition-all duration-200
          ${
            isFocused
              ? "border-zinc-500 shadow-zinc-900/50 shadow-xl"
              : "border-zinc-700 shadow-zinc-950/50"
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
          placeholder="Enter your query here…"
          rows={1}
          disabled={isLoading}
          className="
            flex-1 resize-none border-0 bg-transparent p-1 text-sm
            text-zinc-100 placeholder:text-zinc-500
            focus-visible:ring-0 focus-visible:ring-offset-0
            min-h-9 max-h-40 leading-relaxed
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
          className="
            h-8 w-8 shrink-0 rounded-xl mb-0.5
            bg-zinc-100 hover:bg-white
            disabled:bg-zinc-700 disabled:text-zinc-500
            text-zinc-900 transition-all duration-150
            hover:scale-105 active:scale-95
          "
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
          ) : (
            <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
          )}
        </Button>
      </div>

      <p className="mt-2 text-center text-[11px] text-zinc-600">
        Press{" "}
        <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-zinc-400">
          Enter
        </kbd>{" "}
        to send ·{" "}
        <kbd className="rounded bg-zinc-800 px-1 py-0.5 font-mono text-zinc-400">
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
};

export default InputBox;