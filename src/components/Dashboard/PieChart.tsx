import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const COLORS = ["#18181b", "#5b21b6", "#10b981", "#ef4444"];

export default function PieChartComponent({
  title,
  data,
  cols
}: {
  title: string;
  data: any;
  cols: number;
}) {
  return (
    <div
      className="overflow-hidden rounded border border-stone-300"
      style={{ gridColumn: `span ${cols}` }}
    >
      <div className="p-4">
        <h3 className="flex items-center gap-1.5 font-medium">{title}</h3>
      </div>

      <div className="h-64 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#5b21b6"
            >
              {data.map((_entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              wrapperClassName="text-sm rounded"
              labelClassName="text-xs text-stone-500"
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
