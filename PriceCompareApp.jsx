import React, { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, Heart, Loader2, ShieldCheck, Truck, Bell, RefreshCcw, Filter, Star, ShoppingCart } from 'lucide-react';

const COMPARE_API_URL = import.meta.env.VITE_COMPARE_API_URL || 'http://localhost:5000/api/compare';
const API_BASE_URL = COMPARE_API_URL.replace('/api/compare', '');

const stores = ['Amazon', 'Flipkart', 'Myntra', 'AJIO', 'Tata CLiQ', 'Nykaa Fashion'];

const demoProduct = {
  title: 'NovaTech X5 5G 128GB Midnight Blue',
  brand: 'NovaTech',
  category: 'Mobiles',
  image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=900&auto=format&fit=crop',
  mrp: 24999,
  rating: 4.4,
  reviews: 53210,
  specs: ['8GB RAM', '128GB storage', '50MP camera', '5000mAh battery']
};

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function getDeliveryDays(eta) {
  const match = String(eta || '').match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function buildDemoOffers() {
  const discounts = [0.42, 0.37, 0.33, 0.45, 0.29, 0.31];
  return stores.map((store, index) => {
    const price = Math.round(demoProduct.mrp * (1 - discounts[index]));
    const coupon = Math.round(price * (index % 2 === 0 ? 0.08 : 0.05));
    return {
      store,
      available: index < 4,
      price,
      finalPrice: price - coupon,
      coupon,
      delivery: index < 3 ? 'Free delivery' : '₹49 delivery',
      eta: index % 2 === 0 ? '2-4 days' : '4-6 days',
      deliveryDays: index % 2 === 0 ? 2 : 4,
      link: store === 'Amazon' ? 'https://www.amazon.in' : store === 'Flipkart' ? 'https://www.flipkart.com' : store === 'Myntra' ? 'https://www.myntra.com' : store === 'AJIO' ? 'https://www.ajio.com' : store === 'Tata CLiQ' ? 'https://www.tatacliq.com' : 'https://www.nykaafashion.com',
      badge: index === 0 ? 'Best match' : 'Deal'
    };
  });
}

function normalizeOffer(offer) {
  return {
    store: offer.store || 'Store',
    available: Boolean(offer.available ?? true),
    price: Number(offer.price || offer.finalPrice || 0),
    finalPrice: Number(offer.finalPrice || offer.price || 0),
    coupon: Number(offer.coupon || 0),
    delivery: offer.delivery || 'Check on store',
    eta: offer.eta || 'Check on store',
    deliveryDays: getDeliveryDays(offer.eta),
    link: offer.link || '#',
    badge: offer.badge || 'Deal'
  };
}

export default function PriceCompareApp() {
  const [query, setQuery] = useState('iphone 15 128gb');
  const [submittedQuery, setSubmittedQuery] = useState('iphone 15 128gb');
  const [product, setProduct] = useState(demoProduct);
  const [offers, setOffers] = useState(buildDemoOffers());
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('demo');
  const [error, setError] = useState('');
  const [sort, setSort] = useState('lowest');
  const [wishlist, setWishlist] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [freeDeliveryOnly, setFreeDeliveryOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPrices() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${COMPARE_API_URL}?q=${encodeURIComponent(submittedQuery)}`);
        if (!response.ok) throw new Error('API not connected yet');
        const data = await response.json();
        if (!data.product || !Array.isArray(data.offers)) throw new Error('Invalid API response');
        if (cancelled) return;
        setProduct({ ...demoProduct, ...data.product });
        setOffers(data.offers.map(normalizeOffer));
        setMode('live');
      } catch (err) {
        if (cancelled) return;
        setProduct(demoProduct);
        setOffers(buildDemoOffers());
        setMode('demo');
        setError('Backend/API not connected yet. Showing demo data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPrices();
    return () => { cancelled = true; };
  }, [submittedQuery]);

  const filteredOffers = useMemo(() => {
    return offers
      .filter((offer) => !inStockOnly || offer.available)
      .filter((offer) => !freeDeliveryOnly || offer.delivery === 'Free delivery')
      .sort((a, b) => sort === 'fastest' ? a.deliveryDays - b.deliveryDays : a.finalPrice - b.finalPrice);
  }, [offers, sort, inStockOnly, freeDeliveryOnly]);

  const bestOffer = filteredOffers.find((offer) => offer.available) || null;

  function submitSearch(event) {
    event.preventDefault();
    const value = query.trim();
    if (value) setSubmittedQuery(value);
  }

  function outLink(link) {
    return `${API_BASE_URL}/api/out?url=${encodeURIComponent(link)}`;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <ShoppingCart size={28} />
          <div>
            <h1>PriceCompareKaro</h1>
            <p>Real-time shopping price comparison</p>
          </div>
        </div>
        <form className="search" onSubmit={submitSearch}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Paste Amazon/Flipkart link or search product" />
          <button type="submit">{loading ? <Loader2 className="spin" size={20} /> : <Search size={20} />}</button>
        </form>
      </header>

      <section className="hero">
        <div>
          <span className={mode === 'live' ? 'pill live' : 'pill demo'}>{mode === 'live' ? 'Live API connected' : 'Demo mode'}</span>
          <h2>Paste a product link. Compare prices across top Indian stores.</h2>
          <p>Amazon, Flipkart, Myntra, AJIO, Tata CLiQ and Nykaa Fashion comparison with affiliate-safe deal buttons.</p>
          {error && <div className="warning">{error}</div>}
        </div>
        <div className="best-card">
          <h3>Best Deal</h3>
          <img src={product.image} alt={product.title} />
          <h4>{product.title}</h4>
          <div className="price">{bestOffer ? formatPrice(bestOffer.finalPrice) : 'No deal'}</div>
          {bestOffer && <a className="deal-btn" href={outLink(bestOffer.link)} target="_blank" rel="noreferrer">View best deal <ExternalLink size={16} /></a>}
        </div>
      </section>

      <main className="content">
        <aside className="filters">
          <h3><Filter size={18} /> Filters</h3>
          <label><input type="checkbox" checked={inStockOnly} onChange={() => setInStockOnly(!inStockOnly)} /> In stock only</label>
          <label><input type="checkbox" checked={freeDeliveryOnly} onChange={() => setFreeDeliveryOnly(!freeDeliveryOnly)} /> Free delivery only</label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="lowest">Lowest price</option>
            <option value="fastest">Fastest delivery</option>
          </select>
          <button className="reset" onClick={() => { setInStockOnly(true); setFreeDeliveryOnly(false); setSort('lowest'); }}><RefreshCcw size={14} /> Reset</button>
          <p className="disclosure">Affiliate disclosure: We may earn commission when you buy through our links, at no extra cost to you.</p>
        </aside>

        <section className="results">
          <div className="product-card">
            <img src={product.image} alt={product.title} />
            <div>
              <p className="muted">{product.brand} • {product.category}</p>
              <h2>{product.title}</h2>
              <p><span className="rating">{product.rating || 4.0} <Star size={13} fill="white" /></span> {Number(product.reviews || 0).toLocaleString('en-IN')} ratings</p>
              <div className="specs">{(product.specs || []).map((spec) => <span key={spec}>{spec}</span>)}</div>
              <div className="trust-row">
                <div><ShieldCheck /> Trusted stores</div>
                <div><Truck /> Delivery check</div>
                <div><Bell /> Price alert ready</div>
              </div>
            </div>
            <button className="heart" onClick={() => setWishlist(!wishlist)}><Heart fill={wishlist ? 'red' : 'none'} color={wishlist ? 'red' : 'currentColor'} /></button>
          </div>

          <h2>Compare prices</h2>
          {loading && <div className="loading"><Loader2 className="spin" /> Checking live prices...</div>}
          {filteredOffers.map((offer) => (
            <div className={`offer ${!offer.available ? 'disabled' : ''}`} key={`${offer.store}-${offer.link}`}>
              <div className="store-logo">{offer.store.charAt(0)}</div>
              <div className="offer-info">
                <h3>{offer.store}</h3>
                <p>{offer.available ? `${offer.badge} • ${offer.delivery} • ${offer.eta}` : 'Currently not available'}</p>
              </div>
              <div className="offer-price">
                {offer.available && <><strong>{formatPrice(offer.finalPrice)}</strong><span>Coupon {formatPrice(offer.coupon)}</span></>}
              </div>
              {offer.available ? <a className="deal-btn" href={outLink(offer.link)} target="_blank" rel="noreferrer">View deal <ExternalLink size={16} /></a> : <button disabled>Unavailable</button>}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
