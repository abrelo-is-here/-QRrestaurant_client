import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { host } from '../lib/Api';
import { toast } from "react-toastify";
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Save, Tag, Loader2 } from "lucide-react";

function UpdateCata() {
  const { id } = useParams();
  const [newName, setNewName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function bringData() {
      try {
        const res = await axios.get(`${host}/api/categories/single/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNewName(res.data.name);
      } catch (error) {
        toast.error('Error Fetching Category');
      } finally {
        setInitialLoading(false);
      }
    }
    bringData();
  }, [id, token]);

  async function handleUpdate() {
    if (!newName.trim()) return toast.warning("Category name cannot be empty");
    
    setIsUpdating(true);
    try {
      await axios.put(`${host}/api/categories/${id}`, { name: newName }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category Updated ✅');
      navigate('/my-menu');
    } catch (error) {
      toast.error('Error Updating Category');
    } finally {
      setIsUpdating(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-white">
          <button 
            onClick={() => navigate('/my-menu')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4"
          >
            <ArrowLeft size={16} /> Back to Menu
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Tag className="text-orange-500" size={20} />
            Edit Category
          </h1>
          <p className="text-slate-400 text-xs mt-1">Change the name of your menu section</p>
        </div>

        {/* FORM BODY */}
        <div className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">
              Category Name
            </label>
            <input 
              type="text" 
              placeholder="e.g. Main Courses, Desserts..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => navigate('/my-menu')}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all active:scale-95"
            >
              Cancel
            </button>
            
            <button 
              disabled={isUpdating}
              onClick={handleUpdate}
              className="flex-[2] bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isUpdating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* FOOTER TIP */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center text-[11px] text-slate-400 uppercase tracking-widest font-medium">
          Settings are applied instantly to your digital menu
        </div>
      </div>
    </div>
  );
}

export default UpdateCata;