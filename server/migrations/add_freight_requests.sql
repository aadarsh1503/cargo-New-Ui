-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Freight requests (leads + bookings)
CREATE TABLE IF NOT EXISTS freight_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_id VARCHAR(20) UNIQUE NOT NULL,

  -- User contact info
  company VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Shipment route
  port_of_loading VARCHAR(255) NOT NULL,
  port_of_loading_city VARCHAR(255) NOT NULL,
  port_of_discharge VARCHAR(255) NOT NULL,
  port_of_discharge_city VARCHAR(255) NOT NULL,
  mode_of_shipment VARCHAR(50) NOT NULL,

  -- Cargo details
  commodity VARCHAR(255) NOT NULL,
  gross_weight DECIMAL(10,2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  boxes_pallets INT,
  box_pallet_size VARCHAR(100),
  box_pallet_unit VARCHAR(10) DEFAULT 'cm',
  length_dim DECIMAL(10,2),
  width_dim DECIMAL(10,2),
  height_dim DECIMAL(10,2),
  dimension_unit VARCHAR(10) DEFAULT 'cm',
  message TEXT,

  -- Pricing
  agent_price DECIMAL(12,2) DEFAULT NULL,
  agent_currency VARCHAR(10) DEFAULT 'USD',
  commission_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  commission_value DECIMAL(10,2) DEFAULT NULL,
  final_price DECIMAL(12,2) DEFAULT NULL,
  final_currency VARCHAR(10) DEFAULT 'USD',

  -- Assignment
  assigned_agent_id INT DEFAULT NULL,

  -- Status flow
  status ENUM(
    'submitted',
    'admin_review',
    'forwarded_to_agent',
    'agent_priced',
    'commission_added',
    'sent_to_user',
    'user_approved',
    'payment_requested',
    'payment_completed',
    'in_progress',
    'completed',
    'cancelled'
  ) DEFAULT 'submitted',

  -- Type: lead (price inquiry) or booking (confirmed)
  request_type ENUM('lead', 'booking') DEFAULT 'lead',

  -- Admin notes
  admin_notes TEXT,
  agent_notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (assigned_agent_id) REFERENCES agents(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_request_type (request_type),
  INDEX idx_reference_id (reference_id),
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
