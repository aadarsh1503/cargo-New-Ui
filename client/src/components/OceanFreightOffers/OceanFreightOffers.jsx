import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/apiConfig';

const TAG_COLORS = [
  'bg-teal-500', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500',
];

export const DetailModal = ({ item, onClose }) => {
  // Lock scroll and hide navbar when modal is open
  useEffect(() => {
    if (!item) return;
    const navbar = document.querySelector('header');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (navbar) navbar.style.display = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      if (navbar) navbar.style.display = '';
    };
  }, [item]);

  if (!item) return null;
  const prices = [
    { label: "20'GP", value: item.price_20gp },
    { label: "40'GP", value: item.price_40gp },
    { label: "40'HQ", value: item.price_40hq },
    { label: "40'NOR", value: item.price_40nor },
    { label: "45'HQ", value: item.price_45hq },
  ].filter(p => p.value);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Route</p>
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-800 text-lg">{item.pol}</span>
            <span className="text-gray-400">→</span>
            <span className="font-bold text-gray-800 text-lg">{item.pod}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {item.liner && <span className="bg-teal-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{item.liner}</span>}
          {item.availability && <span className="bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full">{item.availability}</span>}
          {item.agent_name && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">{item.agent_name}</span>}
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {item.transit_time && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Transit Time</p>
              <p className="font-semibold text-gray-800 text-sm">{item.transit_time}</p>
            </div>
          )}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Currency</p>
            <p className="font-semibold text-gray-800 text-sm">{item.currency || 'USD'}</p>
          </div>
        </div>
        {prices.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Container Prices</p>
            <div className="grid grid-cols-2 gap-2">
              {prices.map(p => (
                <div key={p.label} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-500 font-medium">{p.label}</span>
                  <span className="text-sm font-bold text-gray-800">{item.currency || 'USD'} {parseFloat(p.value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {item.remarks && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-600 font-semibold mb-1">Remarks</p>
            <p className="text-sm text-gray-700">{item.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const OfferCard = ({ item, idx, onClick }) => {
  const tagColor = TAG_COLORS[idx % TAG_COLORS.length];
  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-2"
    >
      {/* Route row */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-800 text-sm uppercase tracking-wide">{item.pol}</span>
        <span className="text-gray-400 text-sm">→</span>
        <span className="font-semibold text-gray-700 text-sm">{item.pod}</span>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {item.liner && <span className={`${tagColor} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>{item.liner}</span>}
        {item.availability && <span className="bg-rose-100 text-rose-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">{item.availability}</span>}
      </div>
      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto">
        {item.transit_time && <span>⏱ {item.transit_time}</span>}
        {item.price_20gp && (
          <span className="font-semibold text-gray-600">
            From {item.currency || 'USD'} {parseFloat(item.price_20gp).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export const useFetchOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      const CACHE_KEY = 'gvs_ocean_offers_cache';
      const CACHE_TTL = 3 * 60 * 1000;
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < CACHE_TTL) {
            setOffers(data);
            setLoading(false);
            return;
          }
        }
      } catch { /* ignore */ }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/freight/ocean-freight/public`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setOffers(list);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, ts: Date.now() }));
      } catch {
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return { offers, loading };
};

// Sidebar/compact version — shows top 6 with "View All" button
const OceanFreightOffers = () => {
  const { offers, loading } = useFetchOffers();
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  const preview = offers.slice(0, 6);

  if (!loading && offers.length === 0) return null;

  return (
    <div className="bg-white  rounded-2xl shadow-2xl py-8 px-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Special Offers</h2>
          <div className="w-10 h-1 bg-rose-500 rounded-full mt-1" />
        </div>
        {offers.length > 6 && (
          <span className="text-xs text-gray-400">{offers.length} routes available</span>
        )}
      </div>

      {/* Cards — single column list style for sidebar */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {preview.map((item, idx) => (
            <OfferCard key={idx} item={item} idx={idx} onClick={setSelected} />
          ))}
        </div>
      )}

      {/* View All button */}
      {!loading && offers.length > 6 && (
        <button
          onClick={() => navigate('/special-offers')}
          className="mt-6 w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors"
        >
          View All {offers.length} Offers →
        </button>
      )}

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default OceanFreightOffers;
