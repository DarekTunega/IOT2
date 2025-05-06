import mongoose from 'mongoose';

const CO2ReadingSchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  co2Level: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('CO2Reading', CO2ReadingSchema);
