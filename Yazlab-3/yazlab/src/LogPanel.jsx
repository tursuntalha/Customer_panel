import React, { useState, useEffect } from 'react';

const LogPanel = () => {
  // Başlangıçta boş bir log listesi
  const [logs, setLogs] = useState([]);

  // Log eklemek için kullanılan fonksiyon
  const addLog = (message) => {
    setLogs((prevLogs) => [message, ...prevLogs]);
  };

  // Örnek log mesajlarını otomatik olarak eklemek için useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      addLog("Müşteri 1 (premium) product1'den 10 adet sipariş verdi.");
      addLog("Müşteri 2 (normal) product2'den 50 adet, product5'ten 30 adet sipariş verdi.");
      addLog("Müşteri 3 (premium) product3'ten 10 adet, product4'ten 100 adet sipariş verdi.");
      addLog("Müşteri 1 (premium) siparişi işleme alındı.");
      addLog("Müşteri 2 (normal) product5'ten 30 adet almak istedi. Yetersiz Stok.");
      addLog("Müşteri 4'ün siparişi stok yetersizliğinden iptal edildi.");
    }, 5000); // Her 5 saniyede bir log ekler

    return () => clearInterval(interval); // Temizleme
  }, []);

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Log Paneli</h2>
      <div className="h-64 overflow-y-auto mb-4">
        <ul className="space-y-2">
          {logs.map((log, index) => (
            <li key={index} className="text-sm">
              <p className="bg-gray-100 p-2 rounded-md shadow-sm">{log}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LogPanel;
