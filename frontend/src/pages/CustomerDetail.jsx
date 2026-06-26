import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../services/api.js';
import ChurnBadge from '../components/ChurnBadge.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [sentimentData, setSentimentData] = useState([]);

  useEffect(() => {
    api.get(`/customers/${id}`).then(res => setCustomer(res.data)).catch(console.error);
    api.get(`/customers/${id}/orders`).then(res => setOrders(res.data)).catch(console.error);
    api.get(`/customers/${id}/notes`).then(res => setNotes(res.data)).catch(console.error);
    api.get(`/ai/sentiment-timeline/${id}`).then(res => setSentimentData(res.data)).catch(console.error);
  }, [id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    const res = await api.post(`/customers/${id}/notes`, { content: newNote });
    setNotes(prev => [res.data, ...prev]);
    setNewNote('');
    try { const sentiment = await api.post(`/ai/analyze-sentiment/${res.data.id}`); console.log('Sentiment:', sentiment.data); } catch {}
    api.get(`/ai/sentiment-timeline/${id}`).then(res => setSentimentData(res.data)).catch(console.error);
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div>
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-gray-400">{customer.email} • {customer.company}</p>
            <p className="text-sm mt-2">Status: {customer.status} | Orders: {customer.order_count} | Revenue: ${customer.total_revenue?.toFixed(2)}</p>
          </div>
          <ChurnBadge label={customer.churn_label} />
        </div>
      </div>

      {sentimentData.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-4">Sentiment Timeline</h2>
          <Line data={{
            labels: sentimentData.map(s => new Date(s.date).toLocaleDateString()),
            datasets: [{ label: 'Sentiment', data: sentimentData.map(s => s.score), borderColor: '#3b82f6', fill: false, tension: 0.1 }]
          }} options={{ responsive: true, scales: { y: { min: -1, max: 1 } } }} />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Orders</h2>
          <table className="w-full text-sm"><thead><tr className="text-gray-400"><th>Date</th><th>Product</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{orders.map(o => <tr key={o.id} className="border-t border-gray-700"><td className="py-1">{new Date(o.order_date).toLocaleDateString()}</td><td>{o.product_name}</td><td>${o.total_amount?.toFixed(2)}</td><td>{o.status}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Notes</h2>
          <div className="flex gap-2 mb-4">
            <input value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." className="flex-1 bg-gray-700 p-2 rounded text-sm" />
            <button onClick={addNote} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-sm">Add</button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notes.map(n => (
              <div key={n.id} className="bg-gray-700 p-2 rounded text-sm">
                <p>{n.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {n.sentiment_label && <span className={`mr-2 ${n.sentiment_label === 'positive' ? 'text-green-400' : n.sentiment_label === 'negative' ? 'text-red-400' : 'text-yellow-400'}`}>{n.sentiment_label}</span>}
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
