import { twMerge } from "tailwind-merge";

interface ProgressBarProps {
  steps: {
    id: string;
    name: string
  }[];
  currentStep: number;
}

export default function FormProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <div className="w-full flex gap-2 mb-6">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-col items-start w-full">
          <div
            className={twMerge(
              "h-2 w-full rounded-md transition-all duration-300",
              currentStep >= index ? "bg-blue-500" : "bg-zinc-300"
            )}
          />
          <h2 className={twMerge(
            "text-xs font-semibold text-zinc-700 mt-2",
            currentStep === index && "text-blue-700"
          )}>
            {step.id}
          </h2>
          <p className="text-xs text-zinc-700 font-medium">
            {step.name}
          </p>
        </div>
      ))}
    </div>
  );
};