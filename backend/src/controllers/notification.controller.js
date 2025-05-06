import Sensor from '../models/sensor.model.js';
import CO2Reading from '../models/reading.model.js';
import { sendNotification } from '../utils/notifier.js';

// Kontrola CO₂ a odoslanie upozornenia
export const checkCO2Levels = async () => {
  try {
    const criticalThreshold = 1200; // Kritická hranica CO₂ v ppm

    const readings = await CO2Reading.find({ co2Level: { $gte: criticalThreshold } }).populate('sensor');

    readings.forEach(reading => {
      sendNotification({
        userId: reading.sensor.userId,
        message: `Vysoká hladina CO₂ (${reading.co2Level} ppm) v ${reading.sensor.name}!`,
      });
    });

    console.log(`Notifikácie odoslané: ${readings.length}`);
  } catch (error) {
    console.error('Chyba pri kontrole CO₂', error);
  }
};

// Získanie všetkých notifikácií pre používateľa
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Chyba pri získavaní notifikácií' });
  }
};
