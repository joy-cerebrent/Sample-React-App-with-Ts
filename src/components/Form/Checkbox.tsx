import React from "react";
import { CheckboxProps } from "@/types";

export default function Checkbox({
  title,
  description,
  checked,
  error,
  onChange
}: CheckboxProps) {
  return (
    <>
      <div className="flex items-center space-x-4 py-2">
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <div>
          <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${checked ? "bg-blue-600" : "bg-gray-300"
              }`}
            role="switch"
            aria-checked={checked}
          >
            <span
              className={`inline-block h-4 w-4 transform bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"
                }`}
            />
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm -mt-4">{error}</p>}
    </>
  );
};
