import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import { motion } from "framer-motion";
import { colors } from '../constants/theme'; // Import colors
import '../styles/Marketplace.css'; // Import a dedicated CSS file

function Marketplace() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [sortBy, setSortBy] = useState(""); // e.g., "price", "harvestDate"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" or "desc"
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isMessaging, setIsMessaging] = useState(false);
  const [relatedCrops, setRelatedCrops] = useState([]);
  const [messageText, setMessageText] = useState("");

  const buyersData = [
    { _id: "b1", name: "GreenLife Millers", interest: "Maize", location: "Nairobi", demand: "High", rating: 4.8, verified: true },
    { _id: "b2", name: "Harvest Traders Ltd", interest: "Maize", location: "Eldoret", demand: "Medium", rating: 4.5, verified: true },
    { _id: "b3", name: "Umoja Co-op", interest: "Vegetables", location: "Nakuru", demand: "High", rating: 4.9, verified: true },
    { _id: "b4", name: "Fresh Express", interest: "Tomatoes", location: "Mombasa", demand: "Low", rating: 4.2, verified: false },
  ];

  useEffect(() => {
    setLoading(true);
    setError(null);
    API.get("/crops")
      .then(res => {
        setCrops(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Marketplace fetch error:", err);
        setError("Failed to load crops. Please try again later.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (selectedCrop) {
      const related = crops.filter(
        (crop) =>
          crop.type === selectedCrop.type && crop._id !== selectedCrop._id
      );
      setRelatedCrops(related);
    } else {
      setRelatedCrops([]);
    }
  }, [selectedCrop, crops]);
  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedType("");
    setLocationSearch("");
    setSortBy("");
    setSortOrder("asc");
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    // Integration point: In a full app, this would call an API like API.post("/messages", ...)
    alert(`Message sent to ${selectedCrop.farmerName || 'the farmer'}: ${messageText}`);
    setIsMessaging(false);
    setMessageText("");
  };

  const closeModal = () => {
    setSelectedCrop(null);
    setIsMessaging(false);
    setMessageText("");
  };

  const filteredCrops = crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMinPrice = minPrice === "" || crop.price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === "" || crop.price <= parseFloat(maxPrice);
    const matchesType = selectedType === "" || crop.type === selectedType;
    const matchesLocation = locationSearch === "" || crop.location.toLowerCase().includes(locationSearch.toLowerCase());
    
    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesType && matchesLocation; 
  }).sort((a, b) => {
    if (!sortBy) return 0;

    let valA = a[sortBy];
    let valB = b[sortBy];

    // Handle numeric and date comparisons
    if (sortBy === "price") {
      valA = parseFloat(valA);
      valB = parseFloat(valB);
    } else if (sortBy === "harvestDate") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredBuyers = buyersData.filter(buyer => 
    selectedType === "" || buyer.interest === selectedType
  );

  const cropTypes = [...new Set(crops.map(c => c.type))].filter(Boolean);

  return (
    <div className="marketplace-page">
      <Sidebar />

      <div className="marketplace-content">
        <h1>🌾 Marketplace</h1>
        <p className="market-subtitle">Find the best produce directly from farmers across Kenya.</p>

        {/* Crop Details Modal */}
        {selectedCrop && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div 
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <button className="close-modal" onClick={closeModal}>&times;</button>
              <h2>{selectedCrop.name} Details</h2>
              <div className="modal-details">
                <p><strong>Category:</strong> {selectedCrop.type}</p>
                <p><strong>Location:</strong> {selectedCrop.location}</p>
                <p><strong>Quantity Available:</strong> {selectedCrop.quantity || "1,000 Units"}</p>
                <p><strong>Price:</strong> KES {selectedCrop.price}</p>
                <p><strong>Harvest Date:</strong> {selectedCrop.harvestDate ? new Date(selectedCrop.harvestDate).toLocaleDateString() : 'N/A'}</p>
                
                <div className="farmer-info">
                  <h3>Farmer Contact Information</h3>
                  <p><strong>Name:</strong> {selectedCrop.farmerName || "Samuel Mwangi"}</p>
                  <p><strong>Phone:</strong> {selectedCrop.farmerPhone || "+254 700 000 000"}</p>
                  <p><strong>Email:</strong> {selectedCrop.farmerEmail || "farmer@agriconnection.com"}</p>
                </div>
              </div>
              
              {!isMessaging ? (
                <button 
                  className="buy-button" 
                  style={{ marginTop: '20px' }} 
                  onClick={() => setIsMessaging(true)}
                >
                  Message Farmer
                </button>
              ) : (
                <div className="messaging-section">
                  <h3>Send a Message</h3>
                  <textarea 
                    className="message-input"
                    placeholder="Ask about quantity, delivery, or negotiate price..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <div className="messaging-actions">
                    <button className="buy-button" onClick={handleSendMessage}>Send Message</button>
                    <button className="details-button" onClick={() => setIsMessaging(false)}>Cancel</button>
                  </div>
                </div>
              )}

              {relatedCrops.length > 0 && (
                <div className="related-crops-section">
                  <h3>Related Crops</h3>
                  <div className="related-crops-list">
                    {relatedCrops.slice(0, 3).map((rc) => ( // Show up to 3 related crops
                      <div key={rc._id} className="related-crop-item" onClick={() => { setSelectedCrop(rc); setIsMessaging(false); }}>
                        <p>{rc.name}</p>
                        <small>KES {rc.price}</small>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}

        <div className="filters-section">
          <div className="filter-group search-bar">
            <input 
              type="text" 
              placeholder="Search crops..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <div className="filter-group">
            <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
              <option value="">All Types</option>
              {cropTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Location..." 
              value={locationSearch} 
              onChange={e => setLocationSearch(e.target.value)} 
            />
          </div>
          <div className="filter-group price-range">
            <input 
              type="number" 
              placeholder="Min Price" 
              value={minPrice} 
              onChange={e => setMinPrice(e.target.value)} 
            />
            <span>-</span>
            <input 
              type="number" 
              placeholder="Max Price" 
              value={maxPrice} 
              onChange={e => setMaxPrice(e.target.value)} 
            />
          </div>
          <div className="filter-group sort-controls">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="">Sort By</option>
              <option value="price">Price</option>
              <option value="harvestDate">Harvest Date</option>
            </select>
            {sortBy && ( // Only show sort order if a sort by option is selected
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            )}
            <button className="reset-button" onClick={resetFilters}>Reset</button>
          </div>
        </div>

        {loading && <p>Loading crops...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && filteredCrops.length === 0 && <p>No crops match your search criteria.</p>}

        <h2>🌾 Available Crops</h2>
        <div className="crops-grid">
          {!loading && !error && filteredCrops.map((crop, i) => (
            <motion.div
              className="crop-card"
              key={crop._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="crop-badge">{crop.type}</div>
              <h3>{crop.name}</h3>
              <p>📍 {crop.location}</p>
              <p>📅 Harvest: {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'N/A'}</p>
              
              <div className="price-tag">
                <span className="price-value">KES {crop.price}</span>
                <span className="market-avg">Avg: KES {(crop.price * 1.1).toFixed(0)}</span>
              </div>

              <div className="card-actions">
                <button className="details-button" onClick={() => setSelectedCrop(crop)}>View Details</button>
                <button className="buy-button" onClick={() => alert(`Initiating purchase for ${crop.name}...`)}>Buy Now</button>
              </div>
            </motion.div>
          ))}
        </div>

        {!loading && !error && (
          <div className="buyers-section">
            <h2>🤝 Available Buyers</h2>
            {filteredBuyers.length === 0 ? (
              <p>No buyers found for this category.</p>
            ) : (
              <div className="buyers-grid">
                {filteredBuyers.map((buyer) => (
                  <motion.div 
                    key={buyer._id} 
                    className="buyer-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3>{buyer.name}</h3>
                    {buyer.verified && <span className="verified-badge">✓ Verified Buyer</span>}
                    <div className="buyer-rating">{"⭐".repeat(Math.floor(buyer.rating))} <span>{buyer.rating}</span></div>
                    <p>Interest: <strong>{buyer.interest}</strong></p>
                    <p>📍 {buyer.location}</p>
                    <p className={`demand-tag ${buyer.demand.toLowerCase()}`}>Demand: {buyer.demand}</p>
                    <button className="contact-button" onClick={() => alert(`Contacting ${buyer.name}...`)}>Contact Buyer</button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Marketplace;