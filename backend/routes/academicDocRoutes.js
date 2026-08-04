import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all documents for a patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const documents = await query(
      `SELECT * FROM documents 
       WHERE patient_id = ? 
       ORDER BY created_at DESC`,
      [req.params.patientId]
    );
    
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get document by ID
router.get('/:documentId', async (req, res) => {
  try {
    const [document] = await query(
      `SELECT d.*, p.full_name as patient_name, p.health_id
       FROM documents d
       LEFT JOIN patients p ON d.patient_id = p.id
       WHERE d.id = ?`,
      [req.params.documentId]
    );
    
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload new document
router.post('/', async (req, res) => {
  try {
    const {
      patient_id,
      document_type,
      file_name,
      file_path,
      file_size,
      mime_type,
      title,
      description,
      date_issued
    } = req.body;
    
    if (!patient_id || !document_type || !file_name || !file_path) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: patient_id, document_type, file_name, file_path'
      });
    }
    
    const result = await query(
      `INSERT INTO documents (
        patient_id, document_type, file_name, file_path, file_size,
        mime_type, title, description, date_issued, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        patient_id,
        document_type,
        file_name,
        file_path,
        file_size || 0,
        mime_type || 'application/pdf',
        title || file_name,
        description,
        date_issued || new Date().toISOString().split('T')[0]
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update document metadata
router.patch('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, description, document_type, date_issued } = req.body;
    
    const updates = [];
    const params = [];
    
    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    
    if (description) {
      updates.push('description = ?');
      params.push(description);
    }
    
    if (document_type) {
      updates.push('document_type = ?');
      params.push(document_type);
    }
    
    if (date_issued) {
      updates.push('date_issued = ?');
      params.push(date_issued);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    updates.push('updated_at = NOW()');
    params.push(documentId);
    
    await query(
      `UPDATE documents SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
    
    res.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete document
router.delete('/:documentId', async (req, res) => {
  try {
    await query('DELETE FROM documents WHERE id = ?', [req.params.documentId]);
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get documents by type
router.get('/type/:documentType', async (req, res) => {
  try {
    const { patientId } = req.query;
    
    let sql = `
      SELECT d.*, p.full_name as patient_name, p.health_id
      FROM documents d
      LEFT JOIN patients p ON d.patient_id = p.id
      WHERE d.document_type = ?
    `;
    
    const params = [req.params.documentType];
    
    if (patientId) {
      sql += ' AND d.patient_id = ?';
      params.push(patientId);
    }
    
    sql += ' ORDER BY d.created_at DESC';
    
    const documents = await query(sql, params);
    
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Generate academic report (placeholder for PDF generation)
router.post('/generate-report', async (req, res) => {
  try {
    const {
      patient_id,
      report_type = 'medical_summary',
      include_vitals = true,
      include_medications = true,
      include_medical_records = true,
      date_from,
      date_to
    } = req.body;
    
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'patient_id is required'
      });
    }
    
    // Get patient data
    const [patient] = await query(
      'SELECT * FROM patients WHERE id = ?',
      [patient_id]
    );
    
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    
    const reportData = { patient };
    
    // Get vitals if requested
    if (include_vitals) {
      let vitalsSql = 'SELECT * FROM health_vitals_history WHERE patient_id = ?';
      const vitalsParams = [patient_id];
      
      if (date_from) {
        vitalsSql += ' AND recorded_at >= ?';
        vitalsParams.push(date_from);
      }
      
      if (date_to) {
        vitalsSql += ' AND recorded_at <= ?';
        vitalsParams.push(date_to);
      }
      
      vitalsSql += ' ORDER BY recorded_at DESC LIMIT 50';
      
      reportData.vitals = await query(vitalsSql, vitalsParams);
    }
    
    // Get medications if requested
    if (include_medications) {
      let medsSql = `
        SELECT ml.*, m.full_name as prescribed_by
        FROM medication_logs ml
        LEFT JOIN medics m ON ml.medic_id = m.id
        WHERE ml.patient_id = ?
      `;
      const medsParams = [patient_id];
      
      if (date_from) {
        medsSql += ' AND ml.start_date >= ?';
        medsParams.push(date_from);
      }
      
      if (date_to) {
        medsSql += ' AND ml.start_date <= ?';
        medsParams.push(date_to);
      }
      
      medsSql += ' ORDER BY ml.start_date DESC';
      
      reportData.medications = await query(medsSql, medsParams);
    }
    
    // Get medical records if requested
    if (include_medical_records) {
      let recordsSql = `
        SELECT mr.*, m.full_name as medic_name, m.specialization
        FROM medical_records mr
        LEFT JOIN medics m ON mr.medic_id = m.id
        WHERE mr.patient_id = ?
      `;
      const recordsParams = [patient_id];
      
      if (date_from) {
        recordsSql += ' AND mr.date_recorded >= ?';
        recordsParams.push(date_from);
      }
      
      if (date_to) {
        recordsSql += ' AND mr.date_recorded <= ?';
        recordsParams.push(date_to);
      }
      
      recordsSql += ' ORDER BY mr.date_recorded DESC';
      
      reportData.medicalRecords = await query(recordsSql, recordsParams);
    }
    
    // In a real implementation, you would generate a PDF here
    // For now, return the data that would be in the report
    
    res.json({
      success: true,
      message: 'Report data compiled successfully',
      data: reportData,
      note: 'PDF generation would be implemented here using a library like pdfkit or puppeteer'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
