const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const pool = require('../config/db');
const { protectAdmin } = require('../middleware/authMiddleware');

// Tables to export and their display names
const TABLES = [
  { name: 'freight_requests',       sheet: 'Freight Requests' },
  { name: 'agents',                 sheet: 'Agents' },
  { name: 'employment_applications',sheet: 'Employment Applications' },
  { name: 'ocean_freight',          sheet: 'Ocean Freight' },
  { name: 'gallery',                sheet: 'Gallery' },
  { name: 'settings',               sheet: 'Settings' },
  { name: 'aws_settings',           sheet: 'AWS Settings' },
  { name: 'regions',                sheet: 'Regions' },
  { name: 'region_content',         sheet: 'Region Content' },
  { name: 'uploaded_excels',        sheet: 'Uploaded Excels' },
  { name: 'users',                  sheet: 'Users' },
  { name: 'admins',                 sheet: 'Admins' },
];

// Columns to mask (only actual hashed passwords / tokens — not plain text values)
const MASK_COLS = new Set(['password_hash', 'reset_token']);

router.get('/export-excel', protectAdmin, async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GVS Cargo Admin';
    workbook.created = new Date();

    for (const { name, sheet } of TABLES) {
      try {
        const [rows] = await pool.query(`SELECT * FROM \`${name}\``);
        const ws = workbook.addWorksheet(sheet);

        if (!rows.length) {
          ws.addRow(['No data']);
          continue;
        }

        // Header row
        const cols = Object.keys(rows[0]);
        ws.addRow(cols.map(c => c.toUpperCase().replace(/_/g, ' ')));

        // Style header
        const headerRow = ws.getRow(1);
        headerRow.eachCell(cell => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF243670' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        headerRow.height = 20;

        // Data rows
        rows.forEach(row => {
          const values = cols.map(col => {
            if (MASK_COLS.has(col)) return '***';
            const v = row[col];
            if (v instanceof Date) return v.toISOString().replace('T', ' ').slice(0, 19);
            return v ?? '';
          });
          ws.addRow(values);
        });

        // Auto-width columns
        ws.columns.forEach((col, i) => {
          const maxLen = Math.max(
            cols[i].length + 2,
            ...rows.map(r => String(r[cols[i]] ?? '').length)
          );
          col.width = Math.min(Math.max(maxLen, 10), 50);
        });

        // Freeze header
        ws.views = [{ state: 'frozen', ySplit: 1 }];
      } catch {
        // Table might not exist — skip silently
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="gvs_export_${new Date().toISOString().slice(0,10)}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: 'Export failed' });
  }
});

module.exports = router;
