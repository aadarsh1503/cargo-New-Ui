import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const SEEN_KEY = 'freight_seen_counts';

const getSeenCounts = () => {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY)) || {}; }
  catch { return {}; }
};

const saveSeenCounts = (seen) => {
  localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
};

const useFreightCounts = () => {
  const [raw, setRaw] = useState({ inquiry: 0, leads: 0, bookings: 0, agentPay: 0 });
  const [seen, setSeen] = useState(getSeenCounts);

  const fetchCounts = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/freight/admin/counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setRaw({
        inquiry: data.inquiry || 0,
        leads: data.leads || 0,
        bookings: data.bookings || 0,
        agentPay: data.agentPay || 0,
      });
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchCounts();
    const id = setInterval(fetchCounts, 30_000);
    return () => clearInterval(id);
  }, [fetchCounts]);

  const markSeen = useCallback((key) => {
    setSeen((prev) => {
      const next = { ...prev, [key]: raw[key] ?? 0 };
      saveSeenCounts(next);
      return next;
    });
  }, [raw]);

  const badges = {
    inquiry:  Math.max(0, raw.inquiry  - (seen.inquiry  ?? 0)),
    leads:    Math.max(0, raw.leads    - (seen.leads    ?? 0)),
    bookings: Math.max(0, raw.bookings - (seen.bookings ?? 0)),
    agentPay: Math.max(0, raw.agentPay - (seen.agentPay ?? 0)),
  };

  const total = badges.inquiry + badges.leads + badges.bookings + badges.agentPay;

  return { raw, badges, total, markSeen };
};

export default useFreightCounts;
