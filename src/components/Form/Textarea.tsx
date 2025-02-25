import { TextareaProps } from "@/types";
import { twMerge } from "tailwind-merge";

export default function Textarea({
  label,
  placeholder,
  rows = 5,
  error,
  registration
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea
        {...registration}
        placeholder={placeholder}
        className={twMerge(
          "px-3 py-1.5 rounded-lg border shadow-sm text-sm placeholder:text-sm placeholder:text-zinc-400 resize-none focus:outline-none",
          error ? "border-red-500" : "border-gray-300"
        )}
        rows={rows}
      ></textarea>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
