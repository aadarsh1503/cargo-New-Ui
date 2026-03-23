-- Add 'draft' status for partial form submissions
ALTER TABLE freight_requests
  MODIFY COLUMN status ENUM(
    'draft',
    'submitted',
    'admin_review',
    'forwarded_to_agent',
    'agent_priced',
    'commission_added',
    'sent_to_user',
    'user_approved',
    'payment_requested',
    'payment_proof_submitted',
    'payment_completed',
    'agent_payment_requested',
    'agent_payment_sent',
    'agent_payment_completed',
    'in_progress',
    'completed',
    'cancelled'
  ) DEFAULT 'submitted';
