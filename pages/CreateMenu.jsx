import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { 
  Store, PlusCircle, Utensils, DollarSign, 
  AlignLeft, Loader2, Plus, Image as ImageIcon, X 
} from "lucide-react";
import { host } from '../lib/Api';
import { useLocation , useNavigate } from 'react-router-dom';

function CreateMenu() {
  const location = useLocation();
  const navigate = useNavigate();

  const [newCata, setNewCata] = useState('');
  const [menuName, setMenuName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // UPDATED: two prices
  const [dineInPrice, setDineInPrice] = useState('');
  const [takeawayPrice, setTakeawayPrice] = useState('');

  const [loading, setLoading] = useState(false);
  const [catagorieId, setCatagorieId] = useState('');
  const [catagories, setCatagories] = useState([]);
  const [menuImages, setMenuImages] = useState([]); 

  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem('user'));
  const restaurantId = userData?.restaurantId;

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        `${host}/api/categories/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const fetchedCats = res.data.data || [];
      setCatagories(fetchedCats);

      const params = new URLSearchParams(location.search);
      const urlCatId = params.get('categoryId');

      if (urlCatId) {
        setCatagorieId(urlCatId);
      } else if (fetchedCats.length > 0) {
        setCatagorieId(fetchedCats[0]._id);
      }
    } catch (err) {
      toast.error("Failed to fetch Categories");
    }
  };

  useEffect(() => {
    if (restaurantId) fetchCategories();
  }, [restaurantId, token, location.search]);

  const addCatagorie = async () => {
    if (!newCata.trim()) return toast.error("Category name cannot be empty");
    try {
      await axios.post(
        `${host}/api/categories`,
        { restaurantId: restaurantId, name: newCata },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category Added");
      setNewCata('');
      fetchCategories();
    } catch (error) {
      toast.error("Failed to Create Category");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + menuImages.length > 3) {
      return toast.warn("Maximum 3 images allowed");
    }
    setMenuImages([...menuImages, ...files]);
  };

  const removeImage = (index) => {
    setMenuImages(menuImages.filter((_, i) => i !== index));
  };

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!menuName || !dineInPrice || !takeawayPrice || !catagorieId) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('restaurantId', restaurantId);
      formData.append('categoryId', catagorieId);
      formData.append('name', menuName);
      formData.append('description', newDescription);

      // UPDATED: send both prices
      formData.append('dineInPrice', dineInPrice);
      formData.append('takeawayPrice', takeawayPrice);

      menuImages.forEach((file) => {
        formData.append('images', file);
      });

      await axios.post(
        `${host}/api/menu/create`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      toast.success("Menu item added!");
      setMenuName('');
      setNewDescription('');
      setDineInPrice('');
      setTakeawayPrice('');
      setMenuImages([]);
      navigate(`/my-menu`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Menu</h1>
          <p className="text-gray-500">Add new items to your restaurant menu.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Sidebar */}
          <div className="space-y-6">

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <PlusCircle size={20} className="text-emerald-500" />
                Quick Category
              </h2>

              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder='e.g. Desserts'
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newCata}
                  onChange={(e) => setNewCata(e.target.value)}
                />

                <button 
                  onClick={addCatagorie}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add
                </button>
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Available Categories
              </h2>

              <div className="flex flex-wrap gap-2">
                {catagories.map((c) => (
                  <span
                    key={c._id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      catagorieId === c._id
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    }`}
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={addMenuItem} className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-2xl shadow-md border border-gray-200 space-y-6">
              
              <h2 className="text-xl font-bold text-gray-800">Item Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* category */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Assign Category</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                      value={catagorieId}
                      onChange={(e) => setCatagorieId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {catagories.map((r) => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* name */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Menu Name</label>
                  <div className="relative">
                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type='text'
                      placeholder='Classic Burger'
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={menuName}
                      onChange={(e) => setMenuName(e.target.value)}
                    />
                  </div>
                </div>

                {/* dine-in price */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Dine In Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type='number'
                      placeholder='0.00'
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={dineInPrice}
                      onChange={(e) => setDineInPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* takeaway price */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Takeaway Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type='number'
                      placeholder='0.00'
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={takeawayPrice}
                      onChange={(e) => setTakeawayPrice(e.target.value)}
                    />
                  </div>
                </div>

                {/* description */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Description</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      rows="3"
                      placeholder='Tell us about this dish (optional)...'
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* images */}
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">Images (Max 3)</label>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer">
                      <ImageIcon className="text-gray-400" size={24} />
                      <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Add Photo</span>
                      <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                    </label>

                    {menuImages.map((file, index) => (
                      <div key={index} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200">
                        <img 
                          src={URL.createObjectURL(file)} 
                          className="w-full h-full object-cover" 
                          alt="preview" 
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Add Menu Item"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateMenu;