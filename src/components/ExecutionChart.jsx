"use client";

export default function ExecutionChart({ data = [] }) {
  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end gap-4 h-56 px-4 min-w-[500px]">
        {data.map((entry) => {
          const barHeight = (entry.count / maxValue) * 100;

          return (
            <div key={entry.month} className="flex flex-col items-center w-14">
              {/* Count Label */}
              <span className="text-xs text-gray-700 mb-1">{entry.count}</span>

              {/* Bar */}
              <div
                className="bg-blue-600 w-full rounded-t"
                style={{
                  height: `${barHeight}%`,
                  minHeight: "8px",
                  transition: "height 0.3s ease",
                }}
                title={`${entry.count} books`}
              ></div>

              {/* Month Label */}
              <span className="text-xs mt-2">{entry.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
