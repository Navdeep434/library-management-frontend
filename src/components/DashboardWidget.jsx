export default function DashboardWidget({ title, value, color }) {
  return (
    <div className={`p-4 rounded-lg shadow text-white ${color}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}
