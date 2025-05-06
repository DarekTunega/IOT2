import CO2Reading from '../models/reading.model.js';
import Device from '../models/device.model.js';

// Pridanie nového merania CO₂
export const addCO2Reading = async (req, res) => {
  try {
    const { deviceId, co2Level } = req.body;
    const newReading = await CO2Reading.create({ device: deviceId, co2Level });

    res.status(201).json(newReading);
  } catch (error) {
    res.status(500).json({ message: 'Chyba servera pri ukladaní merania CO₂' });
  }
};

// Získanie posledných 24 hodín meraní pre konkrétny senzor
export const getRecentReadings = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const readings = await CO2Reading.find({
      device: deviceId,
      timestamp: { $gte: twentyFourHoursAgo }
    }).sort({ timestamp: 1 });

    res.status(200).json(readings);
  } catch (error) {
    res.status(500).json({ message: 'Chyba servera pri získavaní meraní CO₂' });
  }
};

// Receive data from the gateway (Node-RED)
export const receiveGatewayData = async (req, res) => {
  try {
    const { deviceId, co2_ppm, battery_percent, timestamp } = req.body;
    
    // Find device by deviceId
    const device = await Device.findOne({ deviceId });
    
    if (!device) {
      return res.status(404).json({ 
        message: 'Device not found with device ID: ' + deviceId,
        received: req.body 
      });
    }
    
    // Update battery level if provided
    if (battery_percent !== undefined) {
      await Device.findByIdAndUpdate(device._id, { batteryLevel: battery_percent });
    }
    
    // Create new CO2 reading with current timestamp
    const readingTime = timestamp ? new Date(timestamp) : new Date();
    const newReading = await CO2Reading.create({ 
      device: device._id, 
      co2Level: co2_ppm,
      timestamp: readingTime
    });

    res.status(201).json({
      message: 'Data received and stored successfully',
      deviceId: device._id,
      co2Reading: newReading
    });
  } catch (error) {
    console.error('Error processing gateway data:', error);
    res.status(500).json({ 
      message: 'Server error processing gateway data',
      error: error.message 
    });
  }
};

// Zmazanie starých meraní (napr. starších ako 7 dní)
export const deleteOldReadings = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await CO2Reading.deleteMany({ timestamp: { $lt: sevenDaysAgo } });
    console.log('Staré merania CO₂ boli vymazané.');
  } catch (error) {
    console.error('Chyba pri čistení starých meraní CO₂', error);
  }
};
