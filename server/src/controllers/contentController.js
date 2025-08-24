const pool = require("../config/db");


// @route   GET /api/regions
// @access  Public
const getAllRegions = async (req, res) => {
  try {
    const query =
      "SELECT id, name, code, country_flag FROM regions WHERE is_active = 1 ORDER BY name";
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching regions", error: error.message });
  }
};


// @route   GET /api/content/:regionCode
// @access  Public
const getContentByRegionCode = async (req, res) => {
  try {
    const { regionCode } = req.params;
    
    // This query already selects all content fields, so it will automatically include the new ones
    const query = `
            SELECT rc.*, r.name, r.code, r.country_flag
            FROM region_content rc
            JOIN regions r ON rc.region_id = r.id
            WHERE r.code = ? AND r.is_active = 1
        `;
    const [rows] = await pool.query(query, [regionCode]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Content not found for this region" });
    }

    const dbContent = rows[0];

    const regionName = dbContent.name;
    const dynamicText = {
      welcome_message: `Welcome to GVS Cargo - ${regionName}!`,
      operate_heading: `Where We Operate from ${regionName}`,
      local_button_text: `Operate in ${regionName}`,
      global_button_text: "Operate Worldwide",
      local_modal_title: `Our Location in ${regionName}`,
      local_modal_description: `Visit our main office in ${regionName} for all your logistics needs.`,
      global_modal_title: "Global Operations",
      global_modal_description: `From ${regionName}, we connect your cargo to every corner of the globe through our extensive partner network.`,
      close_button_text: "Close",
      operate_in_country_title: `Where we operate in ${regionName.toUpperCase()}:`,
      operate_in_country_desc: `GVS Cargo & Logistics is constantly growing in its area of operation in ${regionName}, offering all its customers a fast, safe and personalized service.`,
    };

    const finalContent = { ...dbContent, ...dynamicText };

    if (finalContent.address && typeof finalContent.address === "string") {
      try {
        finalContent.address = JSON.parse(finalContent.address);
      } catch (e) {
        finalContent.address = [finalContent.address];
      }
    }

    res.json(finalContent);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching content", error: error.message });
  }
};


// @route   POST /api/regions
// @access  Protected/Admin
const createRegionWithContent = async (req, res, next) => { // Use 'next' for error handling
  const {
    name, code, country_flag, address, phone, whatsapp,
    whatsapp_sales, whatsapp_support, social_linkedin, social_instagram,
    social_facebook, social_twitter, local_modal_map_src,
    email_customer_care, email_sales, email_business,
  } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: "Region name and code are required." });
  }

  let connection; // Define connection here to be accessible everywhere

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [existingRegions] = await connection.query(
      "SELECT id, is_active FROM regions WHERE code = ? FOR UPDATE",
      [code]
    );

    let regionId;
    let successMessage;

    if (existingRegions.length > 0) {
      const existingRegion = existingRegions[0];
      regionId = existingRegion.id;

      if (existingRegion.is_active === 1) {

        await connection.rollback();
        // The connection is now idle. Release it before sending the response.
        connection.release();
        return res.status(409).json({ message: `A region with the code '${code}' is already active.` });
      }

      console.log(`Reactivating and updating region with code: ${code}`);
      await connection.query(
        "UPDATE regions SET name = ?, country_flag = ?, is_active = 1 WHERE id = ?",
        [name, country_flag || null, regionId]
      );

      const contentToUpdate = {
        address: JSON.stringify(address || []),
        phone: phone || "",
        whatsapp: whatsapp || "",
        whatsapp_sales: whatsapp_sales || "",
        whatsapp_support: whatsapp_support || "",
        social_linkedin: social_linkedin || "",
        social_instagram: social_instagram || "",
        social_facebook: social_facebook || "",
        social_twitter: social_twitter || "",
        local_modal_map_src: local_modal_map_src || "",
        email_customer_care: email_customer_care || "customercare@gvscargo.com",
        email_sales: email_sales || "sales@gvscargo.com",
        email_business: email_business || "info@gvscargo.com",
      };

      await connection.query("UPDATE region_content SET ? WHERE region_id = ?", [
        contentToUpdate,
        regionId,
      ]);
      successMessage = "Region reactivated and updated successfully.";
    } else {
      console.log(`Creating new region with code: ${code}`);

      const [regionResult] = await connection.query(
        "INSERT INTO regions (name, code, country_flag, is_active) VALUES (?, ?, ?, 1)",
        [name, code, country_flag || null]
      );
      regionId = regionResult.insertId;

      const newContent = {
        region_id: regionId,
        address: JSON.stringify(address || []),
        phone: phone || "",
        whatsapp: whatsapp || "",
        whatsapp_sales: whatsapp_sales || "",
        whatsapp_support: whatsapp_support || "",
        social_linkedin: social_linkedin || "",
        social_instagram: social_instagram || "",
        social_facebook: social_facebook || "",
        social_twitter: social_twitter || "",
        local_modal_map_src: local_modal_map_src || "",
        email_customer_care: email_customer_care || "customercare@gvscargo.com",
        email_sales: email_sales || "sales@gvscargo.com",
        email_business: email_business || "info@gvscargo.com",
      };

      await connection.query("INSERT INTO region_content SET ?", newContent);
      successMessage = "Region created successfully.";
    }

    // Success path: commit, then release, then send response
    await connection.commit();
    connection.release();
    res.status(201).json({
      message: successMessage,
      newRegion: { id: regionId, name, code, country_flag },
    });

  } catch (error) {
    // Error path: rollback if connection exists, then release, then pass error
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error("Error in createRegionWithContent:", error);
    // Instead of res.json, pass to your error handler middleware
    next(error); 
  }
};

// @desc    Update content for a region
// @route   PUT /api/content/:regionCode
// @access  Protected/Admin
const updateContentByRegionCode = async (req, res) => {
  // NO CHANGES NEEDED HERE. This function is generic and will update any fields sent.
  const { regionCode } = req.params;
  const contentFields = req.body;

  if (contentFields.address && Array.isArray(contentFields.address)) {
    contentFields.address = JSON.stringify(contentFields.address);
  }

  try {
    const [region] = await pool.query("SELECT id FROM regions WHERE code = ?", [
      regionCode,
    ]);

    if (region.length === 0) {
      return res.status(404).json({ message: "Region not found" });
    }
    const regionId = region[0].id;

    const [updateResult] = await pool.query(
      "UPDATE region_content SET ? WHERE region_id = ?",
      [contentFields, regionId]
    );

    if (updateResult.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No content found to update for this region" });
    }
    res.json({ message: "Content updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating content", error: error.message });
  }
};

// NO CHANGES NEEDED HERE.
const deleteRegionByCode = async (req, res) => {
  try {
    const { regionCode } = req.params;
    if (!regionCode) {
      return res.status(400).json({ message: "Region code is required." });
    }
    const query = "UPDATE regions SET is_active = 0 WHERE code = ?";
    const [result] = await pool.query(query, [regionCode]);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: `Region with code '${regionCode}' not found.` });
    }
    res.json({
      message: `Region '${regionCode}' has been deactivated successfully.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deactivating region", error: error.message });
  }
};

module.exports = {
  getAllRegions,
  getContentByRegionCode,
  createRegionWithContent,
  updateContentByRegionCode,
  deleteRegionByCode,
};