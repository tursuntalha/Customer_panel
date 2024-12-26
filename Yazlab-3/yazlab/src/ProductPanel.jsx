import React, { useState } from 'react';

const ProductPanel = () => {
  // Başlangıçta bazı örnek ürünler
  const [products, setProducts] = useState([
    { id: 1, name: 'Ürün 1', stock: 50, price: 100 },
    { id: 2, name: 'Ürün 2', stock: 30, price: 200 },
    { id: 3, name: 'Ürün 3', stock: 20, price: 150 },
  ]);

  // Stok güncelleme fonksiyonu
  const updateStock = (id, newStock) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id ? { ...product, stock: newStock } : product
      )
    );
  };

  return (
    <div className="container p-6">
      <h1 className="text-xl font-bold mb-4">Ürün Tablosu</h1>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Ürün Adı</th>
            <th className="border p-2">Stok Miktarı</th>
            <th className="border p-2">Fiyat</th>
            <th className="border p-2">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="border p-2">{product.name}</td>
              <td className="border p-2">
                <input
                  type="number"
                  value={product.stock}
                  onChange={(e) =>
                    updateStock(product.id, parseInt(e.target.value))
                  }
                  className="border p-1 w-20"
                />
              </td>
              <td className="border p-2">{product.price} TL</td>
              <td className="border p-2">
                <button
                  onClick={() => updateStock(product.id, product.stock - 1)}
                  className="bg-blue-500 text-white py-1 px-3 rounded"
                >
                  Stok Azalt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPanel;
