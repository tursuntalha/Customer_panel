const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerId: { type: Number, required: true, unique: true },
  customerName: { type: String, required: true },
  budget: { type: Number, required: true },
  customerType: { type: String, enum: ['Premium', 'Standard'], required: true },
  waitTime: { type: Number, default: 0 },  // Bekleme süresi (saniye)
  priorityScore: { type: Number, default: 0 }, // Hesaplanacak öncelik skoru
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
