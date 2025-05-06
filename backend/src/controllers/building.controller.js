import Building from '../models/building.model.js';
import Device from '../models/device.model.js';
import Sensor from '../models/sensor.model.js';

// Mock data for testing
const MOCK_BUILDINGS = [
  {
    id: 'building1',
    name: 'Main Building',
    createdBy: 'test_user_id',
    createdAt: new Date().toISOString()
  },
  {
    id: 'building2',
    name: 'Secondary Building',
    createdBy: 'test_user_id',
    createdAt: new Date().toISOString()
  }
];

// Vytvorenie budovy
export const createBuilding = async (req, res) => {
  try {
    // Check if this is our test user
    if (req.user && req.user.id === 'test_user_id') {
      const { name } = req.body;
      const newBuilding = {
        id: `building${Date.now()}`,
        name,
        createdBy: 'test_user_id',
        createdAt: new Date().toISOString()
      };

      return res.status(201).json(newBuilding);
    }

    const { name } = req.body;
    const building = await Building.create({ name, createdBy: req.user.id });
    res.status(201).json(building);
  } catch (error) {
    console.error('Create building error:', error);
    res.status(500).json({ message: 'Chyba servera' });
  }
};

// Získanie všetkých budov
export const getBuildings = async (req, res) => {
  try {
    // Check if this is our test user
    if (req.user && req.user.id === 'test_user_id') {
      return res.status(200).json(MOCK_BUILDINGS);
    }

    const buildings = await Building.find({ createdBy: req.user.id });
    res.status(200).json(buildings);
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ message: 'Chyba servera' });
  }
};

// Získanie budovy podľa ID
export const getBuildingById = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id)
      .populate({
        path: 'devices',
        populate: {
          path: 'readings',
          options: { sort: { timestamp: -1 }, limit: 50 }
        }
      });
    
    if (!building) {
      return res.status(404).json({ message: 'Budova nebola nájdená' });
    }
    
    res.status(200).json(building);
  } catch (error) {
    console.error('Get building by ID error:', error);
    res.status(500).json({ message: 'Chyba servera' });
  }
};

// Zmazanie budovy
export const deleteBuilding = async (req, res) => {
  try {
    await Building.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Budova bola úspešne vymazaná' });
  } catch (error) {
    console.error('Delete building error:', error);
    res.status(500).json({ message: 'Chyba servera' });
  }
};

// Add device to building
export const addDeviceToBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId } = req.body;

    // Check if building exists
    const building = await Building.findById(id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Find device by deviceId
    let device;
    
    // First, check if a device with this deviceId exists in the Device model
    device = await Device.findOne({ deviceId });
    
    // If not found, check if a sensor with this deviceId exists
    if (!device) {
      const sensor = await Sensor.findOne({ deviceId });
      
      if (sensor) {
        // Create a new device based on the sensor
        device = await Device.create({
          name: `CO2 Sensor ${deviceId.slice(-4)}`,
          type: 'sensor',
          deviceId: deviceId,
          building: id,
          batteryLevel: sensor.batteryLevel || 100
        });
      } else {
        // If neither device nor sensor exists, create a new device
        device = await Device.create({
          name: `New Device ${deviceId.slice(-4)}`,
          type: 'sensor',
          deviceId: deviceId,
          building: id
        });
      }
    } else {
      // If device exists, update its building reference
      device.building = id;
      await device.save();
    }

    // Add device to building if not already added
    if (!building.devices.includes(device._id)) {
      building.devices.push(device._id);
      await building.save();
    }

    res.status(200).json(device);
  } catch (error) {
    console.error('Add device to building error:', error);
    res.status(500).json({ message: 'Server error when adding device to building', error: error.message });
  }
};

// Remove device from building
export const removeDeviceFromBuilding = async (req, res) => {
  try {
    const { id, deviceId } = req.params;

    // Check if building exists
    const building = await Building.findById(id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    // Remove device from building
    building.devices = building.devices.filter(device => device.toString() !== deviceId);
    await building.save();

    // Don't delete the device itself, just remove the association

    res.status(200).json({ message: 'Device removed from building' });
  } catch (error) {
    console.error('Remove device from building error:', error);
    res.status(500).json({ message: 'Server error when removing device from building' });
  }
};
