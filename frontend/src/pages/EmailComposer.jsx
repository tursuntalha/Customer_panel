import { useState, useEffect } from 'react';
import api from '../services/api.js';

export default function EmailComposer() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [intent, setIntent] = useState('Thank you for your recent purchase');
  const [language, setLanguage] = useState('Turkish');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { api.get('/customers/').then(res => setCustomers(res.data)).catch(console.error); }, []);

  const generateDraft = async () => {
    if (!selectedCustomer) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/generate-email', { customer_id: parseInt(selectedCustomer), intent, language });
      setDraft(res.data.email);
    } catch (err) { setDraft('Error generating email'); }
    setLoading(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">AI Email Composer</h1>
      <div className="bg-gray-800 p-6 rounded-lg mb-6 space-y-4">
        <div>
          <label className="text-sm text-gray-400">Customer</label>
          <select value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1">
            <option value="">Select a customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400">Intent</label>
          <select value={intent} onChange={e => setIntent(e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1">
            <option>Thank you for your recent purchase</option>
            <option>Win back inactive customer</option>
            <option>Follow up on support ticket</option>
            <option>Happy birthday / anniversary</option>
            <option>New product announcement</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400">Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-gray-700 p-2 rounded mt-1">
            <option>Turkish</option><option>English</option>
          </select>
        </div>
        <button onClick={generateDraft} disabled={loading || !selectedCustomer}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Generating...' : 'Generate Draft'}
        </button>
      </div>
      {draft && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Draft</h2>
            <button onClick={copyToClipboard} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 text-sm">
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-900 p-4 rounded">{draft}</pre>
        </div>
      )}
    </div>
  );
}
