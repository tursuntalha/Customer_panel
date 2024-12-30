// worker.js
onmessage = function (e) {
    const { action, data } = e.data;
  
    if (action === 'fetchData') {
      // Burada API'den veri çekme işlemi yapılabilir
      // Örnek olarak sabit veri dönebiliriz
      setTimeout(() => {
        postMessage({
          result: [
            { productName: "Ürün 1", stock: 100, price: 25 },
            { productName: "Ürün 2", stock: 50, price: 50 },
          ],
        });
      }, 2000); // 2 saniyelik gecikme simülasyonu
    }
  };
  