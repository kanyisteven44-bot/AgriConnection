"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";

function OnboardingPage() {
  const { data: user, loading: userLoading } = useUser();
  const [upload] = useUpload();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Role-specific states
  const [farmSize, setFarmSize] = useState("");
  const [cropsGrown, setCropsGrown] = useState("");
  const [livestockInfo, setLivestockInfo] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");

  useEffect(() => {
    const pendingRole = localStorage.getItem("pendingRole");
    if (pendingRole) setRole(pendingRole);
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const { url, error } = await upload({ file });
    if (!error) setProfilePhoto(url);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        role,
        phone,
        location,
        profile_photo: profilePhoto,
      };

      if (role === "farmer") {
        payload.farm = {
          size: farmSize,
          location: location,
          crops_grown: cropsGrown,
          livestock_info: livestockInfo,
        };
      } else if (role === "transporter") {
        payload.vehicle = {
          vehicle_type: vehicleType,
          capacity: vehicleCapacity,
          current_location: location,
        };
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        localStorage.removeItem("pendingRole");
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Onboarding error", err);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-[#4CAF50] font-bold">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F4F7F2] p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-[#E8EEE5]">
        <div className="flex items-center space-x-2 mb-8">
          <div
            className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-[#4CAF50]" : "bg-[#E8EEE5]"}`}
          ></div>
          <div
            className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-[#4CAF50]" : "bg-[#E8EEE5]"}`}
          ></div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2E4D2E]">
              Complete your profile
            </h2>
            <p className="text-[#6B8E6B]">
              Help us connect you better by sharing a few more details.
            </p>

            <div className="flex flex-col items-center">
              <div
                className="relative group cursor-pointer"
                onClick={() => document.getElementById("photo-input").click()}
              >
                <div className="w-32 h-32 rounded-full border-4 border-[#C5D8C5] overflow-hidden bg-[#FAFBFA] flex items-center justify-center">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-camera text-4xl text-[#C5D8C5]"></i>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-xs font-bold">Change</span>
                </div>
                <input
                  type="file"
                  id="photo-input"
                  hidden
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
              </div>
              <p className="text-xs text-[#6B8E6B] mt-2">
                Upload profile photo
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254..."
                  className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nakuru, Kenya"
                  className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold py-4 rounded-xl transition-all shadow-md"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-[#2E4D2E]">
              {role === "farmer"
                ? "Farm Details"
                : role === "transporter"
                  ? "Vehicle Details"
                  : "Finalize Profile"}
            </h2>
            <p className="text-[#6B8E6B]">
              Tell us more about your{" "}
              {role === "farmer"
                ? "farm"
                : role === "transporter"
                  ? "vehicle"
                  : "work"}
              .
            </p>

            {role === "farmer" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                    Farm Size
                  </label>
                  <input
                    type="text"
                    value={farmSize}
                    onChange={(e) => setFarmSize(e.target.value)}
                    placeholder="e.g. 5 acres"
                    className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                    Crops Grown
                  </label>
                  <input
                    type="text"
                    value={cropsGrown}
                    onChange={(e) => setCropsGrown(e.target.value)}
                    placeholder="e.g. Maize, Tomatoes, Beans"
                    className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                    Livestock Info (Optional)
                  </label>
                  <textarea
                    value={livestockInfo}
                    onChange={(e) => setLivestockInfo(e.target.value)}
                    placeholder="e.g. 10 dairy cows, 50 chickens"
                    className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
              </div>
            )}

            {role === "transporter" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                    Vehicle Type
                  </label>
                  <input
                    type="text"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    placeholder="e.g. Pickup Truck, 5 Ton Lorry"
                    className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E4D2E] mb-1">
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                    placeholder="e.g. 2 tons"
                    className="w-full px-4 py-3 rounded-xl border border-[#C5D8C5] focus:outline-none focus:ring-2 focus:ring-[#4CAF50]"
                  />
                </div>
              </div>
            )}

            {!["farmer", "transporter"].includes(role) && (
              <div className="py-12 flex flex-col items-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-check text-3xl text-[#4CAF50]"></i>
                </div>
                <p className="text-center text-[#6B8E6B]">
                  Your profile is ready for AgriConnection!
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white text-[#4CAF50] border border-[#4CAF50] font-bold py-4 rounded-xl hover:bg-green-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-[2] bg-[#4CAF50] hover:bg-[#43A047] text-white font-bold py-4 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Saving..." : "Finish Onboarding"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OnboardingPage;
