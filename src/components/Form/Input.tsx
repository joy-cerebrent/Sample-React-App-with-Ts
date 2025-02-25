import { InputFieldProps } from "@/types";
import { twMerge } from "tailwind-merge";

export default function Input({
  label,
  type,
  placeholder,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  error,
  registration,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-y-1 w-full">
      <label className="text-sm font-medium">{label}</label>
      <div className="w-full flex items-stretch">
        {LeftIcon && (
          <div className="bg-zinc-200 flex items-center justify-center px-2 rounded-l-lg">
            <LeftIcon className="text-zinc-500 size-5" />
          </div>
        )}
        <input
          {...registration}
          type={type}
          placeholder={placeholder}
          className={twMerge(
            "w-full px-3 py-2 rounded-lg border shadow-sm text-sm placeholder:text-sm placeholder:text-zinc-400 focus:outline-none",
            error ? "border-red-500" : "border-gray-300",
            LeftIcon ? "rounded-l-none" : "rounded-l-lg",
            RightIcon ? "rounded-r-none" : "rounded-r-lg",
          )}
        />
        {RightIcon && (
          <div className="bg-zinc-200 flex items-center justify-center px-2 rounded-r-lg">
            <RightIcon className="text-zinc-500 size-5" />
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};