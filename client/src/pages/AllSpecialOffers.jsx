import { useState } from 'react';
import { DetailModal, OfferCard, useFetchOffers } from '../components/OceanFreightOffers/OceanFreightOffers';

const AllSpecialOffers = () => {
  const { offers, loading } = useFetchOffers();
  const [selected, setSelected] = useState(null);
  const [polFilter, setPolFilter] = useState('');

  const pols = [...new Set(offers.map(o => o.pol))];
  const filtered = polFilter
    ? offers.filter(o => o.pol.toLowerCase().includes(polFilter.toLowerCase()))
    : offers;

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Special Offers</h1>
          <div className="w-16 h-1 bg-rose-500 mx-auto rounded-full mb-4" />
          <p className="text-gray-500 text-sm">Browse all available ocean freight rates</p>
        </div>

        {/* POL filter tabs */}
        {pols.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-gray-200 pb-4">
            <button
              onClick={() => setPolFilter('')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${!polFilter ? 'bg-rose-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}
            >
              All
            </button>
            {pols.map(pol => (
              <button
                key={pol}
                onClick={() => setPolFilter(pol === polFilter ? '' : pol)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${polFilter === pol ? 'bg-rose-500 text-white' : 'text-gray-500 hover:text-gray-800'}`}
              >
                {pol}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No offers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, idx) => (
              <OfferCard key={idx} item={item} idx={idx} onClick={setSelected} />
            ))}
          </div>
        )}
      </div>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default AllSpecialOffers;
