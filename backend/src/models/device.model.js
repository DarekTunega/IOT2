import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    // enum: ['sensor', 'actuator', 'other'], // Remove enum validation
    default: 'sensor' // Set default value to 'sensor'
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  building: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Building', 
    required: true 
  },
  batteryLevel: {
    type: Number,
    default: 100
  },
  // Add other relevant device fields here, e.g.:
  // status: { type: String, default: 'offline' },
  // lastReading: { type: mongoose.Schema.Types.Mixed }, 
  // location: { type: String } 
}, { timestamps: true });

export default mongoose.model('Device', DeviceSchema); 