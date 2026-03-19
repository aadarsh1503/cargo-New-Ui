const pool = require('../config/db');

// Agent: get own ocean freight entries (with optional POL/POD filter)
const getOceanFreight = async (req, res) => {
  try {
    const agentId = req.agent.id;
    const { pol, pod } = req.query;
    let query = 'SELECT * FROM ocean_freight WHERE agent_id=?';
    const params = [agentId];
    if (pol) { query += ' AND pol LIKE ?'; params.push(`%${pol}%`); }
    if (pod) { query += ' AND pod LIKE ?'; params.push(`%${pod}%`); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching ocean freight:', error);
    res.status(500).json({ message: 'Error fetching ocean freight' });
  }
};

// Agent: create ocean freight entry
const createOceanFreight = async (req, res) => {
  try {
    const agentId = req.agent.id;
    const { liner, pol, pod, transitTime, availability, price20gp, price40gp, price40hq, price40nor, price45hq, currency, remarks } = req.body;
    const [result] = await pool.query(
      `INSERT INTO ocean_freight (agent_id, liner, pol, pod, transit_time, availability, price_20gp, price_40gp, price_40hq, price_40nor, price_45hq, currency, remarks)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [agentId, liner, pol, pod, transitTime || null, availability || null,
       price20gp || null, price40gp || null, price40hq || null, price40nor || null, price45hq || null,
       currency || 'USD', remarks || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error('Error creating ocean freight:', error);
    res.status(500).json({ message: 'Error creating ocean freight' });
  }
};

// Agent: update ocean freight entry
const updateOceanFreight = async (req, res) => {
  try {
    const agentId = req.agent.id;
    const { id } = req.params;
    const { liner, pol, pod, transitTime, availability, price20gp, price40gp, price40hq, price40nor, price45hq, currency, remarks, isActive } = req.body;

    const [check] = await pool.query('SELECT id FROM ocean_freight WHERE id=? AND agent_id=?', [id, agentId]);
    if (!check.length) return res.status(403).json({ message: 'Not authorized' });

    await pool.query(
      `UPDATE ocean_freight SET liner=?, pol=?, pod=?, transit_time=?, availability=?,
       price_20gp=?, price_40gp=?, price_40hq=?, price_40nor=?, price_45hq=?,
       currency=?, remarks=?, is_active=?, updated_at=NOW() WHERE id=?`,
      [liner, pol, pod, transitTime || null, availability || null,
       price20gp || null, price40gp || null, price40hq || null, price40nor || null, price45hq || null,
       currency || 'USD', remarks || null, isActive !== undefined ? isActive : true, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ocean freight:', error);
    res.status(500).json({ message: 'Error updating ocean freight' });
  }
};

// Agent: toggle active/inactive
const toggleOceanFreight = async (req, res) => {
  try {
    const agentId = req.agent.id;
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, is_active FROM ocean_freight WHERE id=? AND agent_id=?', [id, agentId]);
    if (!rows.length) return res.status(403).json({ message: 'Not authorized' });
    await pool.query('UPDATE ocean_freight SET is_active=?, updated_at=NOW() WHERE id=?', [!rows[0].is_active, id]);
    res.json({ success: true, is_active: !rows[0].is_active });
  } catch (error) {
    console.error('Error toggling ocean freight:', error);
    res.status(500).json({ message: 'Error toggling' });
  }
};

// Admin: get all ocean freight (for pricing reference)
const getAllOceanFreight = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ocf.*, a.name AS agent_name FROM ocean_freight ocf
       LEFT JOIN agents a ON ocf.agent_id = a.id
       ORDER BY ocf.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching all ocean freight:', error);
    res.status(500).json({ message: 'Error fetching ocean freight' });
  }
};

// Admin: toggle any ocean freight entry active/inactive
const adminToggleOceanFreight = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT id, is_active FROM ocean_freight WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    await pool.query('UPDATE ocean_freight SET is_active=?, updated_at=NOW() WHERE id=?', [!rows[0].is_active, id]);
    res.json({ success: true, is_active: !rows[0].is_active });
  } catch (error) {
    console.error('Error toggling ocean freight:', error);
    res.status(500).json({ message: 'Error toggling' });
  }
};

// Admin: update any ocean freight entry
const adminUpdateOceanFreight = async (req, res) => {
  try {
    const { id } = req.params;
    const { liner, pol, pod, transitTime, availability, price20gp, price40gp, price40hq, price40nor, price45hq, currency, remarks } = req.body;
    await pool.query(
      `UPDATE ocean_freight SET liner=?, pol=?, pod=?, transit_time=?, availability=?,
       price_20gp=?, price_40gp=?, price_40hq=?, price_40nor=?, price_45hq=?,
       currency=?, remarks=?, updated_at=NOW() WHERE id=?`,
      [liner, pol, pod, transitTime || null, availability || null,
       price20gp || null, price40gp || null, price40hq || null, price40nor || null, price45hq || null,
       currency || 'USD', remarks || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating ocean freight:', error);
    res.status(500).json({ message: 'Error updating ocean freight' });
  }
};

// Public: get all active ocean freight (for website display)
const getPublicOceanFreight = async (req, res) => {
  try {
    const { pol, pod } = req.query;
    let query = `SELECT ocf.liner, ocf.pol, ocf.pod, ocf.transit_time, ocf.availability,
       ocf.price_20gp, ocf.price_40gp, ocf.price_40hq, ocf.price_40nor, ocf.price_45hq,
       ocf.currency, ocf.remarks, a.name AS agent_name
       FROM ocean_freight ocf
       LEFT JOIN agents a ON ocf.agent_id = a.id
       WHERE ocf.is_active = 1`;
    const params = [];
    if (pol) { query += ' AND ocf.pol LIKE ?'; params.push(`%${pol}%`); }
    if (pod) { query += ' AND ocf.pod LIKE ?'; params.push(`%${pod}%`); }
    query += ' ORDER BY ocf.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching public ocean freight:', error);
    res.status(500).json({ message: 'Error fetching ocean freight' });
  }
};

module.exports = { getOceanFreight, createOceanFreight, updateOceanFreight, toggleOceanFreight, getAllOceanFreight, adminToggleOceanFreight, adminUpdateOceanFreight, getPublicOceanFreight };
