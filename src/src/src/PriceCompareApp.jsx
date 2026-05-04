import { useState } from "react";

export default function PriceCompareApp() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(null);

  const API = import.meta.env.VITE_COMPARE_API_URL;

  const searchProduct = async () => {
    if (!query) return;

    const res = await fetch(`${API}?q=${query}`);
    const result = await res.json();

    setData(result);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>PriceCompareKaro 🚀</h1>

      <input
        type="text"
        placeholder="Enter product or paste link"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      <button onClick={searchProduct} style={{ marginLeft: "10px", padding: "10px" }}>
        Search
      </button>

      {data && (
        <div style={{ marginTop: "20px" }}>
          <h2>{data.product.title}</h2>

          {data.offers.map((offer, i) => (
            <div key={i} style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
              <p><b>{offer.store}</b></p>
              <p>Price: ₹{offer.price}</p>

              <a
                href={`${API.replace("/api/compare", "")}/api/out?url=${encodeURIComponent(offer.link)}`}
                target="_blank"
              >
                View Deal
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
