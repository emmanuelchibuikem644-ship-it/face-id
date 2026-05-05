export default function StatCard({ icon, value, label, color }) {
  return (
    <div className="flex items-center gap-4 bg-white p-5 rounded-xl shadow-sm border w-full">
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-semibold">{value}</h2>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}