import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get scan analytics overview
router.get('/scans/overview', async (req, res) => {
  try {
    const { startDate, endDate, medicId } = req.query;
    
    let sql = `
      SELECT 
        COUNT(*) as total_scans,
        COUNT(CASE WHEN scan_type = 'Emergency' THEN 1 END) as emergency_scans,
        COUNT(CASE WHEN scan_status = 'critical' THEN 1 END) as critical_scans,
        COUNT(DISTINCT patient_id) as unique_patients,
        AVG(response_time) as avg_response_time,
        AVG(severity_score) as avg_severity_score
      FROM scan_analytics
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      sql += ' AND scanned_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND scanned_at <= ?';
      params.push(endDate);
    }
    
    if (medicId) {
      sql += ' AND medic_id = ?';
      params.push(medicId);
    }
    
    const [result] = await query(sql, params);
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent scans
router.get('/scans/recent', async (req, res) => {
  try {
    const { limit = 20, medicId } = req.query;
    
    let sql = `
      SELECT 
        sa.*,
        p.full_name as patient_name,
        p.health_id,
        m.full_name as medic_name
      FROM scan_analytics sa
      LEFT JOIN patients p ON sa.patient_id = p.id
      LEFT JOIN medics m ON sa.medic_id = m.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (medicId) {
      sql += ' AND sa.medic_id = ?';
      params.push(medicId);
    }
    
    sql += ' ORDER BY sa.scanned_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const results = await query(sql, params);
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get scan by ID
router.get('/scans/:scanId', async (req, res) => {
  try {
    const [scan] = await query(
      `SELECT 
        sa.*,
        p.full_name as patient_name,
        p.health_id,
        p.age,
        p.gender,
        p.blood_group,
        m.full_name as medic_name,
        m.specialization
      FROM scan_analytics sa
      LEFT JOIN patients p ON sa.patient_id = p.id
      LEFT JOIN medics m ON sa.medic_id = m.id
      WHERE sa.scan_id = ?`,
      [req.params.scanId]
    );
    
    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    
    res.json({ success: true, data: scan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new scan analytics record
router.post('/scans', async (req, res) => {
  try {
    const {
      scan_id,
      patient_id,
      medic_id,
      scan_type = 'Emergency',
      scan_status = 'normal',
      location_address,
      device_type,
      response_time,
      critical_conditions_found = 0,
      medical_conditions,
      allergies,
      medications,
      severity_score = 0,
      outcome
    } = req.body;
    
    const result = await query(
      `INSERT INTO scan_analytics (
        scan_id, patient_id, medic_id, scan_type, scan_status,
        location_address, device_type, response_time, critical_conditions_found,
        medical_conditions, allergies, medications, severity_score, outcome, scanned_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        scan_id,
        patient_id,
        medic_id,
        scan_type,
        scan_status,
        location_address,
        device_type,
        response_time,
        critical_conditions_found,
        JSON.stringify(medical_conditions || []),
        JSON.stringify(allergies || []),
        JSON.stringify(medications || []),
        severity_score,
        outcome
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Scan analytics created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get medic dashboard summary
router.get('/dashboard/:medicId', async (req, res) => {
  try {
    const { medicId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Get practice analytics
    let sql = `
      SELECT 
        date,
        total_scans,
        emergency_scans,
        critical_alerts,
        unique_patients,
        average_response_time,
        patient_demographics,
        condition_stats
      FROM practice_analytics
      WHERE medic_id = ?
    `;
    
    const params = [medicId];
    
    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY date DESC LIMIT 30';
    
    const dailyAnalytics = await query(sql, params);
    
    // Get overall statistics
    const [overallStats] = await query(
      `SELECT 
        COUNT(*) as total_scans,
        COUNT(DISTINCT patient_id) as total_patients,
        AVG(response_time) as avg_response_time,
        COUNT(CASE WHEN scan_status = 'critical' THEN 1 END) as critical_cases
      FROM scan_analytics
      WHERE medic_id = ?`,
      [medicId]
    );
    
    res.json({
      success: true,
      data: {
        dailyAnalytics,
        overallStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get monthly analytics for a medic
router.get('/monthly/:medicId', async (req, res) => {
  try {
    const { medicId } = req.params;
    const { year, month } = req.query;
    
    let sql = `
      SELECT *
      FROM monthly_analytics
      WHERE medic_id = ?
    `;
    
    const params = [medicId];
    
    if (year) {
      sql += ' AND year = ?';
      params.push(parseInt(year));
    }
    
    if (month) {
      sql += ' AND month = ?';
      params.push(parseInt(month));
    }
    
    sql += ' ORDER BY year DESC, month DESC LIMIT 12';
    
    const results = await query(sql, params);
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system-wide analytics (admin only)
router.get('/system/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let sql = `
      SELECT *
      FROM system_analytics
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      sql += ' AND date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND date <= ?';
      params.push(endDate);
    }
    
    sql += ' ORDER BY date DESC LIMIT 30';
    
    const results = await query(sql, params);
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get alerts for a medic
router.get('/alerts/:medicId', async (req, res) => {
  try {
    const { medicId } = req.params;
    const { status = 'pending' } = req.query;
    
    const results = await query(
      `SELECT 
        aa.*,
        p.full_name as patient_name,
        p.health_id
      FROM alert_analytics aa
      LEFT JOIN patients p ON aa.patient_id = p.id
      WHERE aa.medic_id = ? AND aa.status = ?
      ORDER BY aa.triggered_at DESC
      LIMIT 50`,
      [medicId, status]
    );
    
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update alert status
router.patch('/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status, acknowledged_at, resolved_at } = req.body;
    
    let sql = 'UPDATE alert_analytics SET';
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push(' status = ?');
      params.push(status);
    }
    
    if (acknowledged_at) {
      updates.push(' acknowledged_at = ?');
      params.push(acknowledged_at);
    }
    
    if (resolved_at) {
      updates.push(' resolved_at = ?');
      params.push(resolved_at);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    sql += updates.join(',') + ' WHERE alert_id = ?';
    params.push(alertId);
    
    await query(sql, params);
    
    res.json({ success: true, message: 'Alert updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
