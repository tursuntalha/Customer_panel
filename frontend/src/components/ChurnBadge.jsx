export default function ChurnBadge({ label }) {
  const colors = { high: 'bg-red-600', medium: 'bg-yellow-600', low: 'bg-green-600' };
  return <span className={`${colors[label] || 'bg-gray-600'} px-2 py-0.5 rounded text-xs font-bold`}>{label?.toUpperCase()}</span>;
}
