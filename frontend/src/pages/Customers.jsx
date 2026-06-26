import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import ChurnBadge from '../components/ChurnBadge.jsx';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/customers/').then(res => setCustomers(res.data)).catch(console.error); }, []);

  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  const refreshChurn = async () => {
    await api.post('/ai/batch-update-churn');
    api.get('/customers/').then(res => setCustomers(res.data));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <button onClick={refreshChurn} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm">Refresh Churn Scores</button>
      </div>
      <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)}
        className="w-full p-2 mb-4 bg-gray-700 rounded" />
      <div className="grid gap-3">
        {filtered.map(c => (
          <Link key={c.id} to={`/customers/${c.id}`} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:ring-2 ring-blue-500">
            <div>
              <p className="font-bold">{c.name}</p>
              <p className="text-sm text-gray-400">{c.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">${c.total_revenue?.toFixed(2)}</span>
              <ChurnBadge label={c.churn_label} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
