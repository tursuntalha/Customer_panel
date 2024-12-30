import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductPanel = () => {
  const [productData, setProductData] = useState({
    productName: '',
    stock: '',
    price: '',
  });

  const [products, setProducts] = useState([]); // Ürünleri tutmak için state

  // Ürünleri veri tabanından almak için useEffect
  useEffect(() => {
    axios
      .get('http://localhost:3001/api/products') // Backend'den ürünleri çekiyoruz
      .then((response) => {
        setProducts(response.data); // Alınan ürün verilerini state'e kaydediyoruz
      })
      .catch((error) => {
        console.error('Ürünler alınırken hata:', error);
      });
  }, []); // Boş array, sadece component ilk render olduğunda çalışır

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post('http://localhost:3001/products', productData)
      .then((response) => {
        console.log('Ürün başarıyla eklendi:', response.data);
        setProductData({
          productName: '',
          stock: '',
          price: '',
        });
        // Ürün başarıyla eklenince tekrar ürünleri çekiyoruz
        axios
          .get('http://localhost:3001/api/products')
          .then((response) => setProducts(response.data));
      })
      .catch((error) => {
        console.error('Ürün eklenirken hata:', error);
      });
  };

  return (
    <div className="container mt-5">
      <h2>Ürün Ekle</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="productName" className="form-label">
            Ürün Adı
          </label>
          <input
            type="text"
            id="productName"
            name="productName"
            value={productData.productName}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="stock" className="form-label">
            Stok
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={productData.stock}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="price" className="form-label">
            Fiyat
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={productData.price}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Ürünü Kaydet
        </button>
      </form>

      <h3 className="mt-5">Ürün Listesi</h3>
      <div className="row">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product._id} className="col-md-4">
              <div className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">{product.productName}</h5>
                  <p className="card-text">Stok: {product.stock}</p>
                  <p className="card-text">Fiyat: {product.price} ₺</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Henüz ürün eklenmedi.</p>
        )}
      </div>
    </div>
  );
};

export default ProductPanel;
