import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../services/api.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [revenueData, setRevenueData] = useState({ labels: [], values: [] });
  const [topCustomers, setTopCustomers] = useState([]);

  useEffect(() => {
    api.get('/analytics/kpi').then(res => setKpi(res.data)).catch(console.error);
    api.get('/analytics/revenue-chart').then(res => setRevenueData(res.data)).catch(console.error);
    api.get('/analytics/top-customers').then(res => setTopCustomers(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {kpi && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold">{kpi.total_customers}</p><p className="text-gray-400">Total Customers</p></div>
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold text-green-400">{kpi.active_customers}</p><p className="text-gray-400">Active</p></div>
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold text-red-400">{kpi.at_risk_customers}</p><p className="text-gray-400">At Risk</p></div>
          <div className="bg-gray-800 p-4 rounded-lg"><p className="text-2xl font-bold text-blue-400">${kpi.total_revenue.toFixed(2)}</p><p className="text-gray-400">Revenue</p></div>
        </div>
      )}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Revenue (6 months)</h2>
          {revenueData.labels?.length > 0 && (
            <Bar data={{ labels: revenueData.labels, datasets: [{ label: 'Revenue', data: revenueData.values, backgroundColor: '#3b82f6' }] }}
              options={{ responsive: true, plugins: { legend: { display: false } } }} />
          )}
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Top Customers</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400"><th className="text-left">Name</th><th className="text-right">Orders</th><th className="text-right">Revenue</th></tr></thead>
            <tbody>
              {topCustomers.map(c => (
                <tr key={c.id} className="border-t border-gray-700">
                  <td className="py-2"><Link to={`/customers/${c.id}`} className="text-blue-400">{c.name}</Link></td>
                  <td className="text-right">{c.order_count}</td>
                  <td className="text-right">${c.total_revenue?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
