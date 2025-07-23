"use client";

export default function ExecutionChart({ data = [] }) {
  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full">
      <div className="flex items-end gap-4 h-48 px-4">
        {data.map((entry) => (
          <div key={entry.month} className="flex flex-col items-center w-10">
            <div
              className="bg-blue-600 w-full rounded-t"
              style={{
                height: `${(entry.count / maxValue) * 100}%`,
                minHeight: "2px",
                transition: "height 0.3s ease",
              }}
              title={`${entry.count} books`}
            ></div>
            <span className="text-sm mt-2">{entry.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
