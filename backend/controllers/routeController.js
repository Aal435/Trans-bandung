const pool = require('../config/database');

// Get all routes
exports.getAllRoutes = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM routes ORDER BY route_number');
    return res.status(200).json({ routes: rows });
  } catch (error) {
    console.error('Get Routes Error:', error);
    return res.status(500).json({ message: 'Failed to fetch routes', error: error.message });
  }
};

// Get single route by ID
exports.getRouteById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    // Get schedules for this route
    const [schedules] = await pool.query('SELECT * FROM schedules WHERE route_id = ? ORDER BY departure_time', [id]);

    return res.status(200).json({ 
      route: rows[0],
      schedules: schedules
    });
  } catch (error) {
    console.error('Get Route Error:', error);
    return res.status(500).json({ message: 'Failed to fetch route', error: error.message });
  }
};

// Create new route (admin only)
exports.createRoute = async (req, res) => {
  try {
    const { route_number, start_location, end_location, stops, description } = req.body;

    if (!route_number || !start_location || !end_location) {
      return res.status(400).json({ message: 'Route number, start location, and end location are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO routes SET ?',
      {
        route_number,
        start_location,
        end_location,
        stops: stops ? JSON.stringify(stops) : null,
        description
      }
    );

    return res.status(201).json({ 
      message: 'Route created successfully',
      route_id: result.insertId
    });
  } catch (error) {
    console.error('Create Route Error:', error);
    return res.status(500).json({ message: 'Failed to create route', error: error.message });
  }
};

// Update route (admin only)
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { route_number, start_location, end_location, stops, description } = req.body;

    // Check if route exists
    const [rows] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    await pool.query(
      'UPDATE routes SET route_number = ?, start_location = ?, end_location = ?, stops = ?, description = ? WHERE id = ?',
      [route_number, start_location, end_location, stops ? JSON.stringify(stops) : null, description, id]
    );

    return res.status(200).json({ message: 'Route updated successfully' });
  } catch (error) {
    console.error('Update Route Error:', error);
    return res.status(500).json({ message: 'Failed to update route', error: error.message });
  }
};

// Delete route (admin only)
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if route exists
    const [rows] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Route not found' });
    }

    await pool.query('DELETE FROM routes WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Delete Route Error:', error);
    return res.status(500).json({ message: 'Failed to delete route', error: error.message });
  }
};
