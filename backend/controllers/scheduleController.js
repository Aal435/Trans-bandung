const pool = require('../config/database');

// Get all schedules for a route
exports.getSchedulesByRoute = async (req, res) => {
  try {
    const { route_id } = req.params;

    // Verify route exists
    const [routeRows] = await pool.query('SELECT * FROM routes WHERE id = ?', [route_id]);
    if (routeRows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM schedules WHERE route_id = ? ORDER BY departure_time',
      [route_id]
    );

    return res.status(200).json({ schedules: rows });
  } catch (error) {
    console.error('Get Schedules Error:', error);
    return res.status(500).json({ message: 'Failed to fetch schedules', error: error.message });
  }
};

// Create new schedule (admin only)
exports.createSchedule = async (req, res) => {
  try {
    const { route_id, departure_time, arrival_time, frequency, vehicle_id } = req.body;

    if (!route_id || !departure_time || !arrival_time) {
      return res.status(400).json({ message: 'Route ID, departure time, and arrival time are required' });
    }

    // Verify route exists
    const [routeRows] = await pool.query('SELECT * FROM routes WHERE id = ?', [route_id]);
    if (routeRows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    const [result] = await pool.query(
      'INSERT INTO schedules SET ?',
      {
        route_id,
        departure_time,
        arrival_time,
        frequency,
        vehicle_id
      }
    );

    return res.status(201).json({ 
      message: 'Schedule created successfully',
      schedule_id: result.insertId
    });
  } catch (error) {
    console.error('Create Schedule Error:', error);
    return res.status(500).json({ message: 'Failed to create schedule', error: error.message });
  }
};

// Update schedule (admin only)
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { departure_time, arrival_time, frequency, vehicle_id } = req.body;

    // Check if schedule exists
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await pool.query(
      'UPDATE schedules SET departure_time = ?, arrival_time = ?, frequency = ?, vehicle_id = ? WHERE id = ?',
      [departure_time, arrival_time, frequency, vehicle_id, id]
    );

    return res.status(200).json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update Schedule Error:', error);
    return res.status(500).json({ message: 'Failed to update schedule', error: error.message });
  }
};

// Delete schedule (admin only)
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if schedule exists
    const [rows] = await pool.query('SELECT * FROM schedules WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await pool.query('DELETE FROM schedules WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete Schedule Error:', error);
    return res.status(500).json({ message: 'Failed to delete schedule', error: error.message });
  }
};
