const mongoose = require('mongoose');

// Etkinlik Schema
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  participants: [{ type: String }],
  createdBy: { type: String, required: true },  // Kurucunun emaili burada olacak
  isActive: { type: Boolean, default: false }  // Aktiflik durumu, varsayılan olarak true
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
