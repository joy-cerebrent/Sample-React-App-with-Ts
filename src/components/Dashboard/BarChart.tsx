"use client";

import React from "react";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  BarChart,
} from "recharts";
import { BarChart2 } from "lucide-react";

export default function BarChartComponent({
  title = "Sales",
  data,
  cols,
}: {
  title: string;
  data: Array<{ name: string; Mobile: number; Desktop: number }>;
  cols: number;
}) {
  return (
    <div
      className="overflow-hidden rounded border border-stone-300"
      style={{ gridColumn: `span ${cols}` }}
    >
      <div className="p-4">
        <h3 className="flex items-center gap-1.5 font-medium">
          <BarChart2 size={16} />
          {title}
        </h3>
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: -24,
              bottom: 0,
            }}
          >
            <CartesianGrid stroke="#e4e4e7" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              className="text-xs font-bold"
              padding={{ right: 4 }}
            />
            <YAxis
              className="text-xs font-bold"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
            />
            <Bar dataKey="Mobile" fill="#18181b" />
            <Bar dataKey="Desktop" fill="#5b21b6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
