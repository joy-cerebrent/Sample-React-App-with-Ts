import clsx from "clsx";
import { TrendingDown, TrendingUp } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string;
  pillText: string;
  trend: "up" | "down";
  period: string;
  cols: number;
};

export default function StatCard({
  title,
  value,
  pillText,
  trend,
  period,
  cols
}: StatCardProps) {
  return (
    <div className="p-4 rounded border border-stone-300" style={{ gridColumn: `span ${cols}` }}>
      <div className="flex mb-8 items-start justify-between">
        <div>
          <h3 className="text-stone-500 mb-2 text-sm">
            {title}
          </h3>
          <p className="text-3xl font-semibold">
            {value}
          </p>
        </div>

        <span
          className={clsx("text-xs flex items-center gap-1 font-medium px-2 py-1 rounded",
            trend === "up"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          )}
        >
          {trend === "up" ? <TrendingUp /> : <TrendingDown />} {pillText}
        </span>
      </div>

      <p className="text-xs text-stone-500">
        {period}
      </p>
    </div>
  );
}