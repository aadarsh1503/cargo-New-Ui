-- Add missing status values to freight_requests.status ENUM
ALTER TABLE freight_requests
  MODIFY COLUMN status ENUM(
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
    'agent_payment_completed',
    'agent_payment_sent',
    'in_progress',
    'completed',
    'cancelled'
  ) DEFAULT 'submitted';

-- Add column to store agent's payment rejection reason
ALTER TABLE freight_requests
  ADD COLUMN agent_payment_rejection_reason TEXT DEFAULT NULL;
