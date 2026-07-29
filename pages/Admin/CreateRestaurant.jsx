import React, { useState } from "react";
import axios from "axios";
import { useAuth } from '../../lib/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import { Store, MapPin, Phone, CheckCircle2, ArrowLeft, Loader2, UtensilsCrossed, Upload } from "lucide-react";
import { host } from "../../lib/Api";

export default function RestaurantRegister() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    active: true,
  });
  
  const [imageFile, setImageFile] = useState(null); // Actual file object
  const [preview, setPreview] = useState(null);    // For UI preview
  const [loading, setLoading] = useState(false);
  
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file)); // Create temp preview URL
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = new FormData();
    data.append("name", form.name);
    data.append("address", form.address);
    data.append("phone", form.phone);
    data.append("active", form.active);
    
    // Ensure the key name is "logo" to match upload.single("logo")
    if (imageFile) {
      data.append("logo", imageFile); 
    }

    await axios.post(`${host}/api/restaurants`, data, {
      headers: { 
        Authorization: `Bearer ${token}`, // 🔥 CRITICAL: Must include token
        "Content-Type": "multipart/form-data" 
      }
    });

    toast.success("Branch registered successfully!");
    setTimeout(() => navigate('/admin'), 1500);
  } catch (err) {
    console.error("Upload Error:", err.response?.data);
    toast.error(err.response?.data?.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl shadow-sky-100/50 border border-white overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-sky-600 p-10 text-white relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">Register Branch</h1>
            <p className="text-sky-100 opacity-80 mt-1 font-medium">Add a new location to the Qr Dine network.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          
          {/* IMAGE UPLOAD SECTION */}
          <div className="flex flex-col items-center mb-10">
            <label className="relative group cursor-pointer">
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              <div className="w-32 h-32 rounded-[2rem] bg-sky-50 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UtensilsCrossed  size={48} className="text-sky-300" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-sky-600 text-white p-2 rounded-xl shadow-lg border-4 border-white group-hover:bg-sky-700">
                <Upload size={18} />
              </div>
            </label>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Click icon to upload logo</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
                  <input type="text" name="name" placeholder="Addis Grill Main" value={form.name} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-medium" required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
                  <input type="text" name="phone" placeholder="+251 9..." value={form.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-medium" required />
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
                  <input type="text" name="address" placeholder="Bole, Camerun St." value={form.address} onChange={handleChange} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 outline-none transition-all font-medium" required />
                </div>
              </div>
              
              {/* Note: Logo input is removed because we use the Upload Icon click now! */}
            </div>
          </div>

          {/* STATUS & SUBMIT */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 bg-sky-50/50 p-6 rounded-[2rem] border border-sky-100/50">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all ${form.active ? 'bg-sky-500' : 'bg-slate-300'}`} onClick={() => setForm({ ...form, active: !form.active })}>
                <div className={`bg-white w-5 h-5 rounded-full shadow-lg transform transition-transform ${form.active ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </div>
              <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{form.active ? 'Branch is Live' : 'Branch is Offline'}</span>
            </div>

            <button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 bg-sky-600 hover:bg-sky-700 text-white font-black rounded-2xl shadow-xl shadow-sky-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle2 size={22} />}
              {loading ? "Uploading to Cloud..." : "Confirm Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}