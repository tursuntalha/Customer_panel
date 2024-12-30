import React, { useState, useEffect } from 'react';

const CustomerPanel = () => {
  const [customers, setCustomers] = useState([]);
  const [order, setOrder] = useState({
    product: '',
    quantity: '',
  });
  const [logs, setLogs] = useState([]); // Logları saklayacak state
  const [queue, setQueue] = useState([]); // Sipariş sırası
  const [isProcessing, setIsProcessing] = useState(false); // Sipariş işleniyor mu

  // Başlangıçta rastgele müşteri verisi oluşturma
  const generateRandomCustomers = () => {
    const customerTypes = ['Premium', 'Standard'];
    const totalCustomers = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // 5-10 arasında müşteri sayısı
    const premiumCustomerCount = 2; // Başlangıçta en az 2 premium müşteri olmalı

    let customers = [];

    for (let i = 0; i < totalCustomers; i++) {
      const customerType = i < premiumCustomerCount ? 'Premium' : customerTypes[Math.floor(Math.random() * customerTypes.length)];
      const budget = Math.floor(Math.random() * (3000 - 500 + 1)) + 500; // Bütçe 500 ile 3000 arasında olmalı
      const customer = {
        customerId: i + 1,
        customerName: `Müşteri ${i + 1}`,
        budget,
        customerType,
        totalSpent: 0,
      };
      customers.push(customer);
    }
    return customers;
  };

  useEffect(() => {
    const randomCustomers = generateRandomCustomers();
    setCustomers(randomCustomers);
  }, []);

  // Log oluşturma fonksiyonu
  const createLog = (logType, customerId, product, quantity, result) => {
    const log = {
      logId: Date.now(),
      customerId,
      logType,
      customerType: customers.find(c => c.customerId === customerId)?.customerType,
      product,
      quantity,
      transactionTime: new Date().toISOString(),
      result,
    };

    // Logları güncelle
    setLogs(prevLogs => [log, ...prevLogs]);

    // Logu backend'e gönderme
    fetch('http://localhost:3001/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    })
      .then(response => response.json())
      .then(data => console.log('Log başarıyla kaydedildi:', data))
      .catch(error => console.error('Log kaydı hatası:', error));
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
  
    const customer = customers[0]; // Örnek olarak ilk müşteriyi seçiyoruz
    const productPrice = 100; // Ürün fiyatı (örnek)
    const totalPrice = productPrice * order.quantity;
  
    const logTypes = ['Stok Yetersiz', 'Para Yetersiz', 'Ürün Kalmadı'];
    const randomLogType = logTypes[Math.floor(Math.random() * logTypes.length)];
  
    // Sipariş işleme animasyonu başlatma
    setIsProcessing(true);
    createLog('Bilgilendirme', customer.customerId, order.product, order.quantity, 'Sipariş işleniyor...');
  
    // Siparişi kuyruk listesine ekle
    setQueue(prevQueue => [...prevQueue, customer]);
  
    setTimeout(() => {
      if (totalPrice > customer.budget) {
        createLog('Hata', customer.customerId, order.product, order.quantity, 'Müşteri bakiyesi yetersiz');
        alert('Bütçeniz yetersiz!');
        setIsProcessing(false);
  
        // Sipariş bitmeden önce kuyruktan çıkar
        setQueue(prevQueue => prevQueue.filter(c => c.customerId !== customer.customerId));
        return;
      }
  
      if (randomLogType === 'Para Yetersiz') {
        createLog('Hata', customer.customerId, order.product, order.quantity, 'Bütçe yetersiz');
        alert('Para yetersiz logu oluşturuldu');
        setIsProcessing(false);
  
        // Sipariş bitmeden önce kuyruktan çıkar
        setQueue(prevQueue => prevQueue.filter(c => c.customerId !== customer.customerId));
        return;
      }
  
      if (randomLogType === 'Stok Yetersiz') {
        createLog('Hata', customer.customerId, order.product, order.quantity, 'Stok yetersiz');
        alert('Stok yetersiz logu oluşturuldu');
        setIsProcessing(false);
  
        // Sipariş bitmeden önce kuyruktan çıkar
        setQueue(prevQueue => prevQueue.filter(c => c.customerId !== customer.customerId));
        return;
      }
  
      createLog('Bilgilendirme', customer.customerId, order.product, order.quantity, 'Sipariş başarıyla tamamlandı');
      alert('Sipariş başarıyla verildi');
      setOrder({ product: '', quantity: '' });
      setIsProcessing(false);
  
      // Sipariş tamamlandıktan sonra kuyruktan çıkar
      setQueue(prevQueue => prevQueue.filter(c => c.customerId !== customer.customerId));
    }, 2000); // 2 saniye sonra sipariş işlemi sonlanır
  };

  // Log tipi için CSS sınıfı seçme
  const getLogClass = (logType) => {
    switch (logType) {
      case 'Hata':
        return 'bg-danger text-white';
      case 'Bilgilendirme':
        return 'bg-success text-white';
      default:
        return 'bg-info text-white';
    }
  };

  // Bekleme paneli animasyonu
  const getQueueClass = (index) => {
    return index === 0 ? 'active' : '';
  };

  return (
    <div className="container py-5">
      <h1 className="text-center mb-5 text-primary">Müşteri Paneli</h1>

      {/* Sipariş Oluşturma Formu */}
      <div className="card shadow-lg p-4 mb-4 rounded">
        <h2 className="mb-3 text-center">Sipariş Oluşturma Formu</h2>
        <form onSubmit={handleOrderSubmit} className="row g-3">
          <div className="col-md-6">
            <label htmlFor="product" className="form-label">Ürün Seçimi</label>
            <input
              type="text"
              id="product"
              className="form-control shadow-sm"
              placeholder="Ürün adı girin"
              value={order.product}
              onChange={(e) => setOrder({ ...order, product: e.target.value })}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="quantity" className="form-label">Adet</label>
            <input
              type="number"
              id="quantity"
              className="form-control shadow-sm"
              placeholder="Adet girin"
              value={order.quantity}
              onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
              required
            />
          </div>
          <div className="col-12 text-center">
            <button type="submit" className="btn btn-primary" disabled={isProcessing}>
              {isProcessing ? 'İşleniyor...' : 'Sipariş Ver'}
            </button>
          </div>
        </form>
      </div>

      {/* Loglar */}
      <div className="mt-5">
        <h2 className="mb-3">Loglar</h2>
        <div className="log-list">
          {logs.map((log) => (
            <div key={log.logId} className={`log-item p-3 mb-2 rounded ${getLogClass(log.logType)}`}>
              <strong>{log.transactionTime}</strong> - {log.product} (x{log.quantity})<br />
              <small>{log.result}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Bekleme ve Öncelik Paneli */}
      <div className="mt-5">
        <h2 className="mb-3">Bekleyen Müşteriler</h2>
        <div className="queue-list">
          {queue.map((customer, index) => (
            <div key={customer.customerId} className={`queue-item p-3 mb-2 rounded ${getQueueClass(index)} shadow-sm`}>
              <strong>{customer.customerName}</strong> - {customer.customerType}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerPanel;
