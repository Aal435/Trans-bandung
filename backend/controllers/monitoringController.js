const pool = require('../config/database');

// Get all monitoring data
exports.getAllMonitoring = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, r.route_number, r.start_location, r.end_location 
       FROM transportation_monitoring m
       JOIN routes r ON m.route_id = r.id
       ORDER BY m.last_updated DESC`
    );

    return res.status(200).json({ monitoring: rows });
  } catch (error) {
    console.error('Get Monitoring Error:', error);
    return res.status(500).json({ message: 'Failed to fetch monitoring data', error: error.message });
  }
};

// Get monitoring data for specific route
exports.getMonitoringByRoute = async (req, res) => {
  try {
    const { route_id } = req.params;

    // Verify route exists
    const [routeRows] = await pool.query('SELECT * FROM routes WHERE id = ?', [route_id]);
    if (routeRows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM transportation_monitoring WHERE route_id = ? ORDER BY vehicle_id',
      [route_id]
    );

    return res.status(200).json({ monitoring: rows });
  } catch (error) {
    console.error('Get Route Monitoring Error:', error);
    return res.status(500).json({ message: 'Failed to fetch monitoring data', error: error.message });
  }
};

// Create or update vehicle monitoring (admin only)
exports.updateVehicleStatus = async (req, res) => {
  try {
    const { route_id, vehicle_id, current_location, latitude, longitude, passenger_count, status } = req.body;

    if (!route_id || !vehicle_id) {
      return res.status(400).json({ message: 'Route ID and vehicle ID are required' });
    }

    // Verify route exists
    const [routeRows] = await pool.query('SELECT * FROM routes WHERE id = ?', [route_id]);
    if (routeRows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Check if vehicle already exists for this route
    const [existingRows] = await pool.query(
      'SELECT * FROM transportation_monitoring WHERE route_id = ? AND vehicle_id = ?',
      [route_id, vehicle_id]
    );

    if (existingRows.length > 0) {
      // Update existing
      await pool.query(
        'UPDATE transportation_monitoring SET current_location = ?, latitude = ?, longitude = ?, passenger_count = ?, status = ?, last_updated = CURRENT_TIMESTAMP WHERE route_id = ? AND vehicle_id = ?',
        [current_location, latitude, longitude, passenger_count, status, route_id, vehicle_id]
      );
    } else {
      // Insert new
      await pool.query(
        'INSERT INTO transportation_monitoring SET ?',
        {
          route_id,
          vehicle_id,
          current_location,
          latitude,
          longitude,
          passenger_count,
          status: status || 'active'
        }
      );
    }

    return res.status(200).json({ message: 'Vehicle status updated successfully' });
  } catch (error) {
    console.error('Update Vehicle Status Error:', error);
    return res.status(500).json({ message: 'Failed to update vehicle status', error: error.message });
  }
};

// Get single vehicle monitoring
exports.getVehicleMonitoring = async (req, res) => {
  try {
    const { vehicle_id } = req.params;
    const [rows] = await pool.query(
      `SELECT m.*, r.route_number, r.start_location, r.end_location 
       FROM transportation_monitoring m
       JOIN routes r ON m.route_id = r.id
       WHERE m.vehicle_id = ?`,
      [vehicle_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    return res.status(200).json({ monitoring: rows[0] });
  } catch (error) {
    console.error('Get Vehicle Monitoring Error:', error);
    return res.status(500).json({ message: 'Failed to fetch vehicle monitoring', error: error.message });
  }
};
