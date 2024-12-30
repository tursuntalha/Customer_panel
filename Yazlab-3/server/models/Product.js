// models/ProductModel.js
const mongoose = require('mongoose');

const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  productId: { type: String, unique: true, default: uuidv4 },
  productName: { type: String, required: true },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
});


const ProductModel = mongoose.model('Product', productSchema);

module.exports = ProductModel;
