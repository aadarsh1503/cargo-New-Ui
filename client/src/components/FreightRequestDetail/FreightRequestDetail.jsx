// Shared full-detail panel for freight requests — used by Admin, Agent, and User views

const Field = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-all">{value}</p>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="border border-gray-200 rounded-xl p-5">
    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">{title}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {children}
    </div>
  </div>
);

const FreightRequestDetail = ({ request: r, extraSlot }) => {
  if (!r) return null;

  return (
    <div className="space-y-4">
      {/* Route header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-800">
            {r.port_of_loading_city} → {r.port_of_discharge_city}
          </p>
          <p className="text-xs font-mono text-[#243670] mt-0.5">{r.reference_id}</p>
        </div>
        {extraSlot}
      </div>

      {/* Contact Info */}
      <Section title="Contact Information">
        <Field label="Company" value={r.company} />
        <Field label="Name" value={r.name} />
        <Field label="Email" value={r.email} />
        <Field label="Phone" value={r.telephone} />
      </Section>

      {/* Shipment Route */}
      <Section title="Shipment Route">
        <Field label="POL Country" value={r.port_of_loading} />
        <Field label="POL City / Port" value={r.port_of_loading_city} />
        <Field label="POD Country" value={r.port_of_discharge} />
        <Field label="POD City / Port" value={r.port_of_discharge_city} />
        <Field label="Mode of Shipment" value={r.mode_of_shipment} />
      </Section>

      {/* Cargo Details */}
      <Section title="Cargo Details">
        <Field label="Commodity" value={r.commodity} />
        <Field label="Gross Weight" value={r.gross_weight ? `${r.gross_weight} ${r.weight_unit || 'kg'}` : null} />
        <Field label="Boxes / Pallets" value={r.boxes_pallets} />
        <Field label="Box / Pallet Size" value={r.box_pallet_size ? `${r.box_pallet_size} ${r.box_pallet_unit || 'cm'}` : null} />
        <Field label="Dimensions (L×W×H)" value={
          r.length_dim && r.width_dim && r.height_dim
            ? `${r.length_dim} × ${r.width_dim} × ${r.height_dim} ${r.dimension_unit || 'cm'}`
            : null
        } />
      </Section>

      {/* Message */}
      {r.message && (
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Message</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{r.message}</p>
        </div>
      )}

      {/* Pricing */}
      {(r.agent_price || r.final_price) && (
        <Section title="Pricing">
          {r.agent_price && <Field label="Agent Price" value={`USD ${parseFloat(r.agent_price).toLocaleString()}`} />}
          {r.agent_notes && <Field label="Agent Notes" value={r.agent_notes} />}
          {r.commission_type && r.commission_value && (
            <Field label="Commission" value={r.commission_type === 'percentage' ? `${r.commission_value}%` : `USD ${r.commission_value}`} />
          )}
          {r.final_price && <Field label="Final Price" value={`USD ${parseFloat(r.final_price).toLocaleString()}`} />}
        </Section>
      )}

      {/* Assignment */}
      {(r.agent_name || r.admin_notes) && (
        <Section title="Assignment & Notes">
          {r.agent_name && <Field label="Assigned Agent" value={r.agent_name} />}
          {r.agent_email && <Field label="Agent Email" value={r.agent_email} />}
          {r.admin_notes && <Field label="Admin Notes" value={r.admin_notes} />}
        </Section>
      )}

      {/* Timestamps */}
      <Section title="Timeline">
        <Field label="Submitted" value={new Date(r.created_at).toLocaleString()} />
        <Field label="Last Updated" value={new Date(r.updated_at).toLocaleString()} />
        <Field label="Status" value={r.status?.replace(/_/g, ' ')} />
        <Field label="Type" value={r.request_type} />
      </Section>
    </div>
  );
};

export default FreightRequestDetail;

