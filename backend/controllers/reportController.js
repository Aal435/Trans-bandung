const pool = require('../config/database');
const { uploadToS3, deleteFromS3 } = require('../config/s3');

// Get all reports (with optional filters)
exports.getAllReports = async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM reports WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);

    return res.status(200).json({ reports: rows });
  } catch (error) {
    console.error('Get Reports Error:', error);
    return res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};

// Get single report
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json({ report: rows[0] });
  } catch (error) {
    console.error('Get Report Error:', error);
    return res.status(500).json({ message: 'Failed to fetch report', error: error.message });
  }
};

// Create new report with file upload
exports.createReport = async (req, res) => {
  try {
    const { type, location, latitude, longitude, description } = req.body;
    const userId = req.user.id;

    console.log('📝 Creating report:', { type, location, userId });
    console.log('📎 Files received:', req.files ? Object.keys(req.files) : 'NONE');

    if (!type || !location) {
      return res.status(400).json({ message: 'Type and location are required' });
    }

    if (!['accident', 'congestion'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either accident or congestion' });
    }

    let photoUrl = null;
    let documentUrl = null;

    // Upload photo if provided
    if (req.files && req.files.photo) {
      try {
        const photoFile = req.files.photo;
        console.log('⬆️ Uploading photo:', photoFile.name, 'Size:', photoFile.size);
        const photoResult = await uploadToS3(photoFile.data, photoFile.name, 'reports/photos');
        if (photoResult.success) {
          photoUrl = photoResult.url;
          console.log('✅ Photo uploaded:', photoUrl);
        } else {
          console.error('❌ Photo upload failed:', photoResult.error);
          return res.status(500).json({ message: 'Failed to upload photo', error: photoResult.error });
        }
      } catch (photoError) {
        console.error('❌ Photo upload error:', photoError.message);
        return res.status(500).json({ message: 'Photo upload error', error: photoError.message });
      }
    }

    // Upload document if provided
    if (req.files && req.files.document) {
      try {
        const documentFile = req.files.document;
        console.log('⬆️ Uploading document:', documentFile.name, 'Size:', documentFile.size);
        const docResult = await uploadToS3(documentFile.data, documentFile.name, 'reports/documents');
        if (docResult.success) {
          documentUrl = docResult.url;
          console.log('✅ Document uploaded:', documentUrl);
        } else {
          console.error('❌ Document upload failed:', docResult.error);
          return res.status(500).json({ message: 'Failed to upload document', error: docResult.error });
        }
      } catch (docError) {
        console.error('❌ Document upload error:', docError.message);
        return res.status(500).json({ message: 'Document upload error', error: docError.message });
      }
    }

    console.log('💾 Saving report to DB with URLs:', { photoUrl, documentUrl });

    const [result] = await pool.query(
      'INSERT INTO reports SET ?',
      {
        user_id: userId,
        type,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        description,
        photo_url: photoUrl,
        document_url: documentUrl,
        status: 'pending'
      }
    );

    console.log('✅ Report created successfully - ID:', result.insertId);

    return res.status(201).json({ 
      message: 'Report created successfully',
      report_id: result.insertId,
      photo_url: photoUrl,
      document_url: documentUrl
    });
  } catch (error) {
    console.error('❌ Create Report Error:', error.message);
    console.error('Stack trace:', error.stack);
    return res.status(500).json({ message: 'Failed to create report', error: error.message });
  }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if report exists
    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, id]);

    return res.status(200).json({ message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Update Report Error:', error);
    return res.status(500).json({ message: 'Failed to update report', error: error.message });
  }
};

// Delete report (admin or report owner)
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Check if report exists
    const [rows] = await pool.query('SELECT * FROM reports WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const report = rows[0];

    // Check authorization
    if (!isAdmin && report.user_id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this report' });
    }

    // Delete files from S3 if they exist
    if (report.photo_url) {
      const photoKey = report.photo_url.split('/').pop();
      await deleteFromS3(`reports/photos/${photoKey}`);
    }

    if (report.document_url) {
      const docKey = report.document_url.split('/').pop();
      await deleteFromS3(`reports/documents/${docKey}`);
    }

    await pool.query('DELETE FROM reports WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete Report Error:', error);
    return res.status(500).json({ message: 'Failed to delete report', error: error.message });
  }
};

// Get reports by user
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({ reports: rows });
  } catch (error) {
    console.error('Get User Reports Error:', error);
    return res.status(500).json({ message: 'Failed to fetch reports', error: error.message });
  }
};
