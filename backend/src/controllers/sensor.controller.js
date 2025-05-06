import Sensor from '../models/sensor.model.js';

// Pridanie senzora do budovy
export const addSensor = async (req, res) => {
  try {
    const { name, buildingId, deviceId } = req.body;
    const sensor = await Sensor.create({ name, building: buildingId, deviceId });
    res.status(201).json(sensor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Chyba servera' });
  }
};

// Získanie senzorov v budove
export const getSensorsByBuilding = async (req, res) => {
  try {
    const sensors = await Sensor.find({ building: req.params.buildingId });
    res.status(200).json(sensors);
  } catch (error) {
    res.status(500).json({ message: 'Chyba servera' });
  }
};

// Aktualizácia úrovne batérie senzora
export const updateBatteryLevel = async (req, res) => {
  try {
    const { batteryLevel } = req.body;
    await Sensor.findByIdAndUpdate(req.params.id, { batteryLevel });
    res.status(200).json({ message: 'Úroveň batérie aktualizovaná!' });
  } catch (error) {
    res.status(500).json({ message: 'Chyba servera' });
  }
};
