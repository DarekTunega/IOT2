import mongoose from 'mongoose';

const SensorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  building: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  deviceId: { type: String, unique: true, required: true },
  batteryLevel: { type: Number, default: 100 },
}, { timestamps: true });

export default mongoose.model('Sensor', SensorSchema);
