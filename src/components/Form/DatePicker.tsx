import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { ChevronDown, Calendar } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { DatePickerProps } from '@/types';

export default function DatePicker({
  label,
  error,
  onChange,
  value,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDaySelect = (selectedDay: Date | undefined) => {
    onChange(selectedDay);
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const { bottom } = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      setOpenUpwards(bottom + 300 > viewportHeight); // 300px is the approximate dropdown height
    }
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left w-full">
      <div>
        <label className="text-sm font-medium">{label}</label>
        <button
          type="button"
          ref={buttonRef}
          className={twMerge(
            "relative inline-flex w-full justify-start gap-x-1.5 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 shadow-xs ring-gray-300 ring-inset hover:bg-gray-50",
            error ? "border-red-500" : "border-gray-300"
          )}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen ? "true" : "false"}
          aria-haspopup="true"
        >
          <label
            className={`text-sm font-medium flex items-center gap-2 ${
              value ? "text-black" : "text-zinc-400"
            }`}
          >
            <Calendar className="size-4" />
            {value ? format(value, 'PPP') : "Select a date"}
          </label>

          <ChevronDown
            className={twMerge(
              "absolute top-1/2 right-2 -translate-y-1/2 size-5 transition-transform duration-500",
              isOpen && "rotate-180"
            )}
          />
        </button>

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
              openUpwards ? "-translate-y-0" : "mt-2"
            )}
            style={{
              top: openUpwards ? "auto" : undefined,
              bottom: openUpwards ? "100%" : undefined,
            }}
            role="menu"
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleDaySelect}
              className="p-4 flex justify-center items-center"
              classNames={{
                today: "text-zinc-500",
                selected: "bg-zinc-600 text-white rounded-lg aria-selected:bg-zinc-600",
                chevron: "fill-zinc-600",
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
