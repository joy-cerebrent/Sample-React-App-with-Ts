import { LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react"

interface PromptInputProps {
  icon: React.ElementType;
  placeholder?: string;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handlePromptSubmit: () => void;
  loading: boolean;
};

export default function PromptInput({
  icon: Icon,
  placeholder = "Enter your prompt...",
  prompt,
  setPrompt,
  handlePromptSubmit,
  loading,
}: PromptInputProps) {
  // const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        inputRef.current?.blur();
      }

      if (event.key === "Enter" && document.activeElement === inputRef.current) {
        event.preventDefault();
        handlePromptSubmit();
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [prompt]);

  return (
    <div className="flex gap-4 justify-center mb-4">
      <div className={`
            bg-stone-200 rounded flex flex-1 items-center px-3 py-2 text-sm transition-all duration-300
            ${typeof window !== undefined && document?.activeElement === inputRef.current && "shadow-xl"}
          `}>
        <Icon
          className="mr-2 text-stone-500"
          size={16}
        />

        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          // onFocus={() => setIsFocused(true)}
          // onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full bg-transparent placeholder:text-stone-400 focus:outline-none"
        />

        <span className="ml-2 bg-stone-300 text-stone-500 text-xs px-2 py-0.5 rounded whitespace-nowrap hidden sm:block">
          Ctrl + K
        </span>
      </div>

      <button
        onClick={handlePromptSubmit}
        className="w-[5.5rem] h-[2.25rem] flex justify-center items-center gap-2 text-sm text-violet-700 bg-violet-100 hover:bg-violet-100 hover:shadow-xl transition-all rounded overflow-hidden"
      >
        <span className={`
          relative transition-transform duration-300 
          ${loading && "-translate-y-[150%]"}
        `}>
          Generate
          <LoaderCircle
            className="animate-spin size-5 absolute top-[150%] left-[calc(50%_-_0.75rem)]"
          />
        </span>
      </button>
    </div>
  );
}