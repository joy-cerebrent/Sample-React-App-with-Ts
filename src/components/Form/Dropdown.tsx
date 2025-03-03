import clsx from "clsx";
import { ChevronDown, LucideIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";

export type DropdownProps = {
  label: string;
  options: string[] | {
    label?: string;
    options: string[];
  }[];
  value: string;
  disabled?: boolean;
  leftIcon?: LucideIcon;
  enableSearch?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

export default function Dropdown({
  label,
  options,
  value,
  disabled = false,
  leftIcon: LeftIcon,
  enableSearch = false,
  error,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openUpwards, setOpenUpwards] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (option: string) => {
    if (disabled) return;

    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isOptionGroup = (
    option: string | { label?: string; options: string[] }
  ): option is { label?: string; options: string[] } => {
    return typeof option === "object" && "options" in option;
  };

  const filteredOptions = Array.isArray(options)
    ? options
      .map((option) => {
        if (isOptionGroup(option)) {
          const filteredSubOptions = option.options.filter((subOption) =>
            subOption.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (
            (option.label &&
              option.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
            filteredSubOptions.length > 0
          ) {
            return { label: option.label, options: filteredSubOptions };
          }
          return null;
        }

        return option.toLowerCase().includes(searchQuery.toLowerCase())
          ? option
          : null;
      })
      .filter(Boolean)
    : [];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen && buttonRef.current) {
      const { bottom } = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      setOpenUpwards(bottom + 250 > viewportHeight);
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-full">
      <div>
        <label className="text-sm font-medium">{label}</label>

        <div className="flex items-stretch">
          {LeftIcon && (
            <div className="bg-zinc-200 flex items-center justify-center px-2 rounded-l-lg">
              <LeftIcon className="text-zinc-500 size-5" />
            </div>
          )}
          <button
            type="button"
            ref={buttonRef}
            className={twMerge(
              "relative inline-flex w-full justify-start gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset",
              !disabled && "hover:bg-gray-50",
              error ? "border-red-500" : "border-gray-300",
              LeftIcon && "rounded-l-none",
              disabled && "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen ? "true" : "false"}
            aria-haspopup="true"
            disabled={disabled}
          >
            <label
              className={`text-sm font-medium ${value ? "text-black" : "text-zinc-400"
                }`}
            >
              {value || "Select from the following"}
            </label>

            <ChevronDown
              className={twMerge(
                "absolute top-1/2 right-2 -translate-y-1/2 size-5 transition-transform duration-500",
                isOpen && "rotate-180",
                disabled && "text-gray-400"
              )}
            />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed top-0 left-0 h-screen w-screen bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={twMerge(
              "absolute z-10 w-full origin-top rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden",
              openUpwards ? "bottom-full" : "mt-2"
            )}
            style={{
              maxHeight: "250px",
              overflowY: "auto",
            }}
            role="menu"
            aria-orientation="vertical"
          >
            {enableSearch && (
              <div className="px-3 py-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none"
                />
              </div>
            )}
            <div className="py-1" role="none">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  if (isOptionGroup(option!)) {
                    return (
                      <div key={index}>
                        <p className={clsx(
                          "px-4 py-2 text-sm font-semibold text-gray-600 border-t",
                          !enableSearch && index === 0 && "border-none"
                        )}>
                          {option.label}
                        </p>
                        {option.options.map((subOption, subIndex) => (
                          <p
                            key={`${index}-${subIndex}`}
                            className="block px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => handleSelect(subOption)}
                          >
                            {subOption}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <p
                      key={index}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => handleSelect(option as string)}
                    >
                      {option as string}
                    </p>
                  );
                })
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">No results found</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

