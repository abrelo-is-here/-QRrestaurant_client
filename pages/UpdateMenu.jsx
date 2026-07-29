import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { host } from '../lib/Api';
import { toast } from "react-toastify";
import { useAuth } from '../lib/AuthContext';
import { 
  ArrowLeft, UtensilsCrossed, Save, Loader2, 
  Plus, Image as ImageIcon, X 
} from "lucide-react";

function UpdateMenu() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [name, setName] = useState("");

  // UPDATED: two prices instead of one
  const [dineInPrice, setDineInPrice] = useState("");
  const [takeawayPrice, setTakeawayPrice] = useState("");

  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 1. Fetch initial data
  useEffect(() => {
    async function fetchMenuItem() {
      try {
        const res = await axios.get(`${host}/api/menu/single/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data;

        setName(data.name);

        // UPDATED
        setDineInPrice(data.dineInPrice || "");
        setTakeawayPrice(data.takeawayPrice || "");

        setDescription(data.description);

        if (data.images && Array.isArray(data.images)) {
          setPreviews(data.images.filter(img => img !== null));
        }
      } catch (error) {
        toast.error('Error fetching menu item');
        navigate('/my-menu');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchMenuItem();
  }, [id, token, navigate]);

  // cleanup
  useEffect(() => {
    return () => {
      previews.forEach(src => {
        if (src && typeof src === 'string' && src.startsWith('blob:')) {
          URL.revokeObjectURL(src);
        }
      });
    };
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = 4 - previews.length;

    if (remainingSlots <= 0) {
      toast.warn("Maximum 4 images allowed");
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const newPreviewUrls = filesToAdd.map(file => URL.createObjectURL(file));

    setImages(prev => [...prev, ...filesToAdd]);
    setPreviews(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const target = previews[index];

    if (target && typeof target === 'string' && target.startsWith('blob:')) {
      const blobIndex = previews
        .slice(0, index)
        .filter(p => typeof p === 'string' && p.startsWith('blob:')).length;

      setImages(prev => prev.filter((_, i) => i !== blobIndex));
      URL.revokeObjectURL(target);
    }

    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    // UPDATED
    formData.append("dineInPrice", dineInPrice);
    formData.append("takeawayPrice", takeawayPrice);

    const existingImages = previews.filter(src =>
      src && typeof src === 'string' && !src.startsWith('blob:')
    );

    formData.append("existingImages", JSON.stringify(existingImages || []));

    images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await axios.put(`${host}/api/menu/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });

      toast.success('Dish updated successfully!');
      navigate('/my-menu'); 
    } catch (error) {
      console.error("Frontend Error:", error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update dish');
    } finally {
      setUpdating(false);
    }
  };

  const PreviewGrid = ({ imgs }) => {
    const validImgs = imgs.filter(img => img !== null);
    if (validImgs.length === 0) return (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
        <ImageIcon size={48}/>
      </div>
    );

    return (
      <div className={`grid ${validImgs.length === 1 ? 'grid-cols-1' : validImgs.length === 2 ? 'grid-cols-2' : 'grid-cols-3'} h-full gap-0.5`}>
        {validImgs.slice(0, 3).map((img, i) => (
          <img 
            key={i} 
            src={img} 
            className={`${i === 0 && validImgs.length > 2 ? 'col-span-2' : ''} w-full h-full object-cover`} 
            alt="p" 
          />
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-slate-500 font-medium">Syncing with kitchen...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto">

        <button 
          onClick={() => navigate('/my-menu')} 
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={20} /> Back to Menu
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">

              <div className="flex items-center gap-3 mb-8">
                <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600">
                  <UtensilsCrossed size={24} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Edit Dish Details</h1>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">

                {/* images unchanged */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-3 block">
                    Gallery ({previews.length}/4 Images)
                  </label>

                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {previews.map((src, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 relative group shadow-sm">
                        <img src={src} className="w-full h-full object-cover" alt="preview" />

                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>

                        <div className="absolute bottom-1 left-1 bg-black/40 text-[8px] text-white px-1.5 py-0.5 rounded uppercase font-bold">
                          {src?.startsWith?.('blob:') ? 'New' : 'Saved'}
                        </div>
                      </div>
                    ))}

                    {previews.length < 4 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 cursor-pointer transition-all">
                        <Plus size={24} />
                        <span className="text-[10px] font-bold mt-1">ADD</span>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-4">

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Dish Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>

                  {/* UPDATED PRICES */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Dine In Price (ETB)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium" 
                      value={dineInPrice} 
                      onChange={(e) => setDineInPrice(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Takeaway Price (ETB)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 font-medium" 
                      value={takeawayPrice} 
                      onChange={(e) => setTakeawayPrice(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Description</label>
                    <textarea 
                      rows="3" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 resize-none font-medium" 
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)} 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={updating} 
                  className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {updating ? 'Updating Kitchen...' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* preview unchanged except price removed */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 ml-2">Live Preview</p>

              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 group">

                <div className="h-52 bg-slate-100 overflow-hidden relative">
                  <PreviewGrid imgs={previews} />

                  <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">
                    {(dineInPrice || 0)} / {(takeawayPrice || 0)} ETB
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="text-xl font-bold text-slate-800 mb-2">{name || "Untitled Dish"}</h4>
                  <p className="text-slate-500 text-sm italic line-clamp-2 leading-relaxed">
                    {description || "No description provided."}
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UpdateMenu;