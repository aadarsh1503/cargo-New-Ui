ALTER TABLE freight_requests
  ADD COLUMN payment_proof_url VARCHAR(500) DEFAULT NULL,
  ADD COLUMN agent_payment_proof_url VARCHAR(500) DEFAULT NULL,
  ADD COLUMN agent_payment_method VARCHAR(20) DEFAULT NULL;
