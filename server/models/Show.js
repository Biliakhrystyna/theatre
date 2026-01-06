const mongoose = require('mongoose');

const ShowSchema = new mongoose.Schema({
  title: { type: String, required: true },       
  description: { type: String, required: true }, 
  genre: { type: String, required: true },       
  image: { type: String, required: true },       
  gallery: { type: Array, default: [] },
  basePrice: { type: Number, required: true, default: 200 },
  schedule: [
    {
      date: String,       
      occupied: [String]  // Масив зайнятих місць: ["1-2"]
    }
  ]
});

module.exports = mongoose.model('Show', ShowSchema);