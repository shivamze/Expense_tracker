"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const EXPENSE_COLORS: Record<string, string> = {
  Food: "#22c55e",
  Transport: "#3b82f6",
  Utilities: "#6366f1",
  Rent: "#f59e0b",
  Entertainment: "#ef4444",
  Healthcare: "#ec4899",
  Shopping: "#14b8a6",
  Education: "#a855f7",
  Other: "#64748b",
};

export default function PieChartComponent({ data }: { data: any[] }) {
    return (
      <div className="h-[300px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`expense-${index}`}
                  fill={EXPENSE_COLORS[entry.category] || "#94a3b8"}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toLocaleString("en-IN")}`,
                "Amount",
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
}