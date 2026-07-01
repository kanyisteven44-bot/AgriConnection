"use client";
import { useState } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";

function NewProductPage() {
  const { data: user } = useUser();
  const [upload, { loading: uploading }] = useUpload();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("vegetables");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("kg");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { url, error } = await upload({ file });
    if (!error) setImageUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          price: Number(price),
          unit,
          quantity: Number(quantity),
          description,
          location,
          image_url: imageUrl,
        }),
      });
      if (res.ok) {
        window.location.href = "/farmer/dashboard";
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-12 px-6 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-[48px] shadow-2xl overflow-hidden border border-[#E8EEE5]">
        <div className="bg-[#2E7D32] p-12 text-white flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Upload Harvest
            </h1>
            <p className="text-[#C5D8C5] mt-2 font-medium">
              List your produce on the AgriConnection marketplace.
            </p>
          </div>
          <i className="fas fa-wheat-awn text-5xl text-[#FBC02D] opacity-20"></i>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-10">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center">
            <div
              onClick={() => document.getElementById("harvest-image").click()}
              className="w-full h-80 bg-[#F5F7FA] rounded-[32px] border-4 border-dashed border-[#E8EEE5] flex flex-col items-center justify-center cursor-pointer hover:border-[#2E7D32] transition-all overflow-hidden relative group"
            >
              {imageUrl ? (
                <img src={imageUrl} className="w-full h-full object-cover" />
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-5xl text-[#6B8E6B] mb-4"></i>
                  <p className="text-[#6B8E6B] font-black uppercase tracking-widest text-xs">
                    Drop Image or Click to Upload
                  </p>
                </>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-black uppercase tracking-widest">
                  Uploading...
                </div>
              )}
            </div>
            <input
              id="harvest-image"
              type="file"
              hidden
              onChange={handleImageUpload}
              accept="image/*"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
                Product Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Organic Red Tomatoes"
                className="w-full bg-[#F5F7FA] px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F5F7FA] px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333] appearance-none cursor-pointer"
              >
                <option value="vegetables">Vegetables</option>
                <option value="cereals">Cereals</option>
                <option value="fruits">Fruits</option>
                <option value="seeds">Seeds</option>
                <option value="fertilizers">Fertilizers</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
                Price (KSh)
              </label>
              <div className="relative">
                <input
                  required
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#F5F7FA] px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333]"
                />
                <span className="absolute right-8 top-5 font-black text-[#6B8E6B] uppercase text-xs tracking-widest">
                  per unit
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
                Unit
              </label>
              <input
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, ton, piece..."
                className="w-full bg-[#F5F7FA] px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
                Total Quantity
              </label>
              <input
                required
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 500"
                className="w-full bg-[#F5F7FA] px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
                Farm Location
              </label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Nakuru, Eldoret..."
                className="w-full bg-[#F5F7FA] px-8 py-5 rounded-2xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-[#6B8E6B] uppercase tracking-[2px]">
              Detailed Description
            </label>
            <textarea
              rows="5"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the quality, harvest date, and other details..."
              className="w-full bg-[#F5F7FA] px-8 py-5 rounded-3xl outline-none focus:ring-2 focus:ring-[#2E7D32] font-bold text-[#333333] resize-none"
            ></textarea>
          </div>

          <div className="flex flex-col md:row space-y-4 md:space-y-0 md:space-x-6 pt-10">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 bg-white text-[#6B8E6B] border border-[#E8EEE5] font-black py-5 rounded-[24px] hover:bg-gray-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-[2] bg-[#2E7D32] text-white font-black py-5 rounded-[24px] shadow-2xl hover:bg-[#1B5E20] transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewProductPage;
