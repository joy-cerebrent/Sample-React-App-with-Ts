import { ArrowUpRight, DollarSign, MoreHorizontal } from "lucide-react";
import React from "react";

export default function Table({ data, title, cols }: { data: any, title: string; cols: number; }) {
  const keys = Array.from(Object.keys(data[0]));

  return (
    <div className="p-4 rounded border border-stone-300" style={{ gridColumn: `span ${cols}` }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 font-medium">
          <DollarSign size={16} /> {title}
        </h3>
        <button className="text-sm text-violet-500 hover:underline">
          See all
        </button>
      </div>
      <table className="w-full table-auto">
        <TableHead keys={keys} />

        <tbody>
          {data.map(({ cusId, sku, date, price }: any, index: any) => (
            <TableRow
              key={index}
              cusId={cusId}
              sku={sku}
              date={date}
              price={price}
              order={index}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TableHead = ({ keys }: { keys: string[] }) => {
  return (
    <thead>
      <tr className="text-sm font-normal text-stone-500">
        {keys.map((key) => (
          <th className="text-start p-1.5" key={key}>
            {key[0].toUpperCase() + key.slice(1)}
          </th>
        ))}
      </tr>
    </thead>
  );
};

const TableRow = ({
  cusId,
  sku,
  date,
  price,
  order,
}: {
  cusId: string;
  sku: string;
  date: string;
  price: string;
  order: number;
}) => {
  return (
    <tr className={order % 2 ? "bg-stone-100 text-sm" : "text-sm"}>
      <td className="p-1.5">
        <a
          href="#"
          className="text-violet-600 underline flex items-center gap-1"
        >
          {cusId} <ArrowUpRight size={12} />
        </a>
      </td>
      <td className="p-1.5">{sku}</td>
      <td className="p-1.5">{date}</td>
      <td className="p-1.5">{price}</td>
      <td className="w-8">
        <button className="hover:bg-stone-200 transition-colors grid place-content-center rounded text-sm size-8">
          <MoreHorizontal size={12} />
        </button>
      </td>
    </tr>
  );
};
