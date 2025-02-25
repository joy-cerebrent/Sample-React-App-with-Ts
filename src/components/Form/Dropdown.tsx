import { DropdownProps } from "@/types";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { twMerge } from "tailwind-merge";

export default function Dropdown({
  label,
  options,
  value,
  leftIcon: LeftIcon,
  enableSearch = false,
  error,
  onChange,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // For filtering options
  const [openUpwards, setOpenUpwards] = useState(false); // State for dropdown direction
  const buttonRef = useRef<HTMLButtonElement>(null); // Ref for the button

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery(""); // Reset search query after selection
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const { bottom } = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      setOpenUpwards(bottom + 250 > viewportHeight); // Adjust threshold based on dropdown height
    }
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
              "relative inline-flex w-full justify-start gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50",
              error ? "border-red-500" : "border-gray-300",
              LeftIcon && "rounded-l-none"
            )}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen ? "true" : "false"}
            aria-haspopup="true"
          >
            <label
              className={`text-sm font-medium ${
                value ? "text-black" : "text-zinc-400"
              }`}
            >
              {value || "Select from the following"}
            </label>

            <ChevronDown
              className={twMerge(
                "absolute top-1/2 right-2 -translate-y-1/2 size-5 transition-transform duration-500",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed top-0 left-0 h-screen w-screen bg-transparent"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={twMerge(
              "absolute z-10 mt-2 w-full origin-top rounded-md bg-white ring-1 shadow-lg ring-black/5 focus:outline-hidden",
              openUpwards
                ? "bottom-full"
                : "mt-2"
            )}
            style={{
              maxHeight: "250px", // Fixed height
              overflowY: "auto", // Scrollable when needed
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
                filteredOptions.map((option, index) => (
                  <a
                    href="#"
                    key={index}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </a>
                ))
              ) : (
                <p className="px-4 py-2 text-sm text-gray-500">
                  No results found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
