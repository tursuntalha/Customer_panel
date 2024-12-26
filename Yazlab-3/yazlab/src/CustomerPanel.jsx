import React, { useState } from 'react';

const CustomerPanel = () => {
  // Örnek müşteri verileri
  const [customers, setCustomers] = useState([
    { id: 1, name: 'Ahmet', type: 'Premium', budget: 10000, waitTime: '2 gün', priorityScore: 90 },
    { id: 2, name: 'Ayşe', type: 'Normal', budget: 5000, waitTime: '5 gün', priorityScore: 60 },
    { id: 3, name: 'Mehmet', type: 'Premium', budget: 15000, waitTime: '1 gün', priorityScore: 95 },
  ]);

  // Sipariş oluşturma form durumu
  const [order, setOrder] = useState({
    product: '',
    quantity: '',
  });

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    alert(`Ürün: ${order.product}, Adet: ${order.quantity} sipariş verildi.`);
    setOrder({ product: '', quantity: '' }); // Formu sıfırla
  };

  return (
    <div className="container py-5">
      {/* Başlık */}
      <h1 className="text-center mb-5">Müşteri Paneli</h1>

      {/* Müşteri Listesi Tablosu */}
      <div className="mb-5">
        <h2 className="mb-3">Müşteri Listesi</h2>
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>Customer ID</th>
              <th>Ad</th>
              <th>Tür</th>
              <th>Bütçe</th>
              <th>Bekleme Süresi</th>
              <th>Öncelik Skoru</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.type}</td>
                <td>{customer.budget} ₺</td>
                <td>{customer.waitTime}</td>
                <td>{customer.priorityScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sipariş Oluşturma Formu */}
      <div>
        <h2 className="mb-3">Sipariş Oluşturma Formu</h2>
        <form onSubmit={handleOrderSubmit} className="row g-3">
          <div className="col-md-6">
            <label htmlFor="product" className="form-label">Ürün Seçimi</label>
            <input
              type="text"
              id="product"
              className="form-control"
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
              className="form-control"
              placeholder="Adet girin"
              value={order.quantity}
              onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
              required
            />
          </div>
          <div className="col-12 text-center">
            <button type="submit" className="btn btn-primary">Sipariş Ver</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerPanel;
