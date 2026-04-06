# GVS Cargo — Freight Service Workflow

This document explains how the freight service works from start to finish. It covers every step, who does what, and what emails are sent along the way.

---

## The Three Roles

| Role | What they do |
|------|-------------|
| **User** | Submits a freight request and pays for the shipment |
| **Agent** | Handles the logistics, submits a price, and ships the cargo |
| **Admin** | Manages the whole process — assigns agents, sets prices, and pays agents |

---

## Part 1: Freight Request Workflow

### Step 1 — User Submits a Request

The user fills out the freight request form on the website with details like:
- Company name, contact info
- Port of Loading and Port of Discharge
- Mode of shipment (air, sea, etc.)
- Commodity, weight, dimensions
- Any additional message

Once submitted, the request gets a unique reference ID (e.g. `GVS-1ED6FD0D`) and its status is set to **`submitted`**.

**Email sent:** Admin receives a notification with all the request details.

---

### Step 2 — Admin Reviews and Forwards to Agent

The admin sees the new request in the Inquiries panel. They can:
- Review the full details
- Click "Booking Confirm" to acknowledge it (moves to **`admin_review`**)
- Select an agent from the list and forward the request

When forwarded, the status becomes **`forwarded_to_agent`**.

**Emails sent:**
- Agent receives an assignment notification with the request details and any admin notes
- Admin receives a confirmation that the request was forwarded

---

### Step 3 — Agent Submits a Price

The agent logs into their dashboard, reviews the assigned request, and submits their price along with any notes.

Status becomes **`agent_priced`**.

**Email sent:** Admin receives a notification showing the agent's submitted price.

---

### Step 4 — Admin Adds Commission and Sends Quote to User

The admin reviews the agent's price, adds their commission (either a fixed amount or a percentage), and sets the final price. They then send the quote to the user.

Status becomes **`sent_to_user`**.

**Emails sent:**
- User receives their quote with a link to view and approve it
- Agent receives a notification that the quote was sent (showing only their submitted price, not the commission)
- Admin receives a confirmation

---

### Step 5 — User Pays

The user logs into the "My Bookings" page using their email and a one-time verification code. They see the quote and can pay in two ways:

- **PayPal** — payment is captured instantly and confirmed automatically
- **Bank Transfer** — user uploads a payment proof file, which the admin must manually confirm

Once payment is confirmed (either automatically via PayPal or manually by admin), the status becomes **`payment_completed`** and the request moves to the Bookings panel.

**Emails sent:**
- User receives a payment confirmation
- Admin and agent both receive a notification that payment was received

> Note: The user can also approve the quote first (status: `user_approved`) before the admin sends a formal payment request (status: `payment_requested`). Both paths lead to the same payment step.

---

### Step 6 — Agent Requests Their Payment

After the user's payment is confirmed, the agent sees the booking in their dashboard and clicks "Request Payment." This notifies the admin that the agent wants to be paid.

Before requesting payment, the agent must have their payment details saved (bank details or PayPal email).

Status becomes **`agent_payment_requested`**.

**Email sent:** Admin receives a notification with the agent's payment details and the amount owed.

---

### Step 7 — Admin Pays the Agent

The admin sees the agent's payment request in the Bookings panel. They can see the agent's bank or PayPal details and send the payment. They then confirm in the system.

Once confirmed, the status moves to **`in_progress`** and the shipment officially begins.

**Emails sent:** User and agent both receive a notification that the shipment is now in progress.

---

### Step 8 — Agent Marks as Delivered

When the shipment is delivered, the agent marks it as complete in their dashboard.

Status becomes **`completed`**.

**Emails sent:** User and agent both receive a delivery confirmation. Admin is also notified.

---

## Cancellation Flow

A booking can be cancelled by either the user or the admin at any point before the shipment is completed.

### If the user has NOT paid yet:
- No cancellation fee applies
- All parties (user, agent, admin) receive a cancellation email with the reason

### If the user HAS already paid:
- A cancellation fee is applied (configured by admin — either a fixed amount or a percentage of the total)
- The remaining amount is calculated as the refund
- All parties receive a cancellation email showing the fee breakdown and refund amount

> The admin processes the refund manually outside the system.

---

## Full Status Reference

| Status | What it means |
|--------|--------------|
| `submitted` | User just submitted the request |
| `admin_review` | Admin acknowledged and is reviewing |
| `forwarded_to_agent` | Admin assigned it to an agent |
| `agent_priced` | Agent submitted their price |
| `sent_to_user` | Admin added commission and sent the quote to the user |
| `user_approved` | User approved the quote (before formal payment request) |
| `payment_requested` | Admin sent a formal payment request to the user |
| `payment_proof_submitted` | User uploaded a bank transfer proof — awaiting admin confirmation |
| `payment_completed` | Payment confirmed — booking is active |
| `agent_payment_requested` | Agent requested their payment from admin |
| `agent_payment_sent` | Admin sent payment to agent — awaiting agent confirmation |
| `in_progress` | Agent paid — shipment is underway |
| `completed` | Shipment delivered successfully |
| `cancelled` | Booking was cancelled (by user or admin) |

---

## Email Notifications Summary

| Event | Who gets notified |
|-------|------------------|
| New request submitted | Admin |
| Forwarded to agent | Agent, Admin |
| Agent submits price | Admin |
| Quote sent to user | User, Agent, Admin |
| User approves quote | Admin, Agent |
| Payment requested | User, Admin |
| Payment completed | User, Admin, Agent |
| Shipment in progress | User, Admin, Agent |
| Shipment completed | User, Admin, Agent |
| Agent requests payment | Admin |
| Booking cancelled | User, Agent, Admin |
| OTP verification code | User |

---

## Part 2: Ocean Freight Rates

Ocean Freight is a separate feature from the booking workflow above. It is a rate table that agents and users can browse.

### How it works:

- **Admin** creates ocean freight rate entries with details like: liner, port of loading, port of discharge, 20ft/40ft/40HC container prices, validity dates, and remarks
- **Agents** can view all active rates in their dashboard and filter by liner, route, or status
- **Users** can browse available ocean freight rates on the public-facing page

Ocean freight entries have two statuses:
- **Active** — visible to agents and users
- **Inactive** — hidden from view

There is no booking or payment flow tied to ocean freight rates — they are informational only.

---

## Part 3: User Access (My Bookings)

Users do not create accounts. Instead, they access their bookings using:

1. Enter the email address used when submitting the request
2. Receive a 6-digit verification code by email (valid for 10 minutes)
3. Enter the code to view all bookings linked to that email

From the bookings page, users can:
- View full details of each booking
- See the current status
- Pay for a booking (PayPal or bank transfer)
- Cancel a booking (if it hasn't shipped yet)
- Filter bookings by route, commodity, status, or date

---

## Part 4: Agent Access

Agents log in with an email and password provided by the admin.

From the agent dashboard, agents can:
- View all requests assigned to them
- Submit a price for a request
- Track the status of each booking
- Request payment once the user has paid
- Mark a shipment as delivered
- View ocean freight rates
- Update their payment details (bank or PayPal)

Agents can be activated or deactivated by the admin. A deactivated agent cannot log in.
