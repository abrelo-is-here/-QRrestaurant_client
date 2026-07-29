import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { 
  Plus, Utensils, LayoutGrid, 
  MoreVertical, Edit2, Trash2, Settings2, ArrowLeft, 
  Menu as MenuIcon 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { host } from '../lib/Api';
import { useAuth } from '../lib/AuthContext';
import Sidebar from "../components/Sidebar";

function Menu() {
  const { token } = useAuth();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.restaurantId) return;
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          axios.get(`${host}/api/categories/${user.restaurantId}`),
          axios.get(`${host}/api/menu/${user.restaurantId}`),
        ]);
        setCategories(catRes.data.data || []);
        setMenu(menuRes.data || []);
      } catch {
        toast.error('Error Fetching Menu Data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.restaurantId]);

  const toggleMenu = (id) => setOpenMenu(prev => (prev === id ? null : id));

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    try {
      await axios.put(`${host}/api/menu/status/${id}`, 
        { isAvailable: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMenu(prev => prev.map(item => item._id === id ? { ...item, available: newStatus } : item));
      toast.success(newStatus ? "Dish Available" : "Dish Hidden");
    } catch {
      toast.error('Failed to update status');
    }
  };

  const removeMenu = async (id) => {
    if (!window.confirm("Delete this dish?")) return;
    try {
      await axios.delete(`${host}/api/menu/single/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMenu(prev => prev.filter(item => item._id !== id));
      toast.success('Dish removed');
    } catch {
      toast.error('Error deleting item');
    }
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Delete this category and all its contents?")) return;
    try {
      await axios.delete(`${host}/api/categories/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCategories(prev => prev.filter(cat => cat._id !== id));
      toast.success('Category removed');
    } catch {
      toast.error('Error deleting category');
    }
  };

  const getItemsByCategory = (catId) => menu.filter(item => item.categoryId === catId);

  const ImageGrid = ({ images, name, available }) => {
    const count = images?.length || 0;
    const filterClass = !available ? 'grayscale opacity-60' : '';

    if (count === 0) {
      return <img src="/image/default-dish.jpg" className={`w-full h-full object-cover ${filterClass}`} alt="default" />;
    }
    if (count === 1) {
      return <img src={images[0]} className={`w-full h-full object-cover ${filterClass}`} alt={name} />;
    }
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 h-full gap-0.5">
          {images.slice(0, 2).map((img, i) => (
            <img key={i} src={img} className={`w-full h-full object-cover ${filterClass}`} alt={name} />
          ))}
        </div>
      );
    }
    return (
      <div className="grid grid-cols-3 h-full gap-0.5">
        <div className="col-span-2">
          <img src={images[0]} className={`w-full h-full object-cover ${filterClass}`} alt={name} />
        </div>
        <div className="flex flex-col gap-0.5">
          <img src={images[1]} className={`h-1/2 w-full object-cover ${filterClass}`} alt={name} />
          <div className="relative h-1/2 w-full">
            <img src={images[2]} className={`h-full w-full object-cover ${filterClass}`} alt={name} />
            {count > 3 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xs">+{count - 3}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 gap-4">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
      </div>
      <p className="text-slate-500 font-medium animate-pulse">Synchronizing Kitchen...</p>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F1F5F9]">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-[100] shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600">
                <MenuIcon size={24} />
              </button>
              <button onClick={() => navigate(-1)} className="hidden sm:block p-2 hover:bg-slate-100 rounded-xl text-slate-600">
                <ArrowLeft size={22} />
              </button>
              <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-none">Menu Catalog</h1>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">ID: {user?.restaurantId?.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            <button onClick={() => navigate('/create-menu')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md active:scale-95 transition-all">
              <Plus size={18} /> <span className="hidden sm:inline">Add New Item</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-8">
          <div className="max-w-7xl mx-auto space-y-16">
            {categories.map((cat, index) => {
              const items = getItemsByCategory(cat._id);
              return (
                <section key={cat._id} className="relative" style={{ zIndex: categories.length - index }}>
                  {/* CATEGORY HEADER */}
                  <div className="flex items-center justify-between mb-8 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-white sticky top-[80px] z-[50] shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <LayoutGrid size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 capitalize leading-none">{cat.name}</h2>
                        <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-[2px] mt-1">{items.length} Dishes Available</p>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        onClick={() => toggleMenu(`cat-${cat._id}`)} 
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:bg-slate-100"
                      >
                        <Settings2 size={20} />
                      </button>

                      {openMenu === `cat-${cat._id}` && (
                        <>
                          <div className="fixed inset-0 z-[140]" onClick={() => setOpenMenu(null)}></div>
                          <div className="absolute right-0 top-14 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[150] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <button onClick={() => navigate(`/edit-cat/${cat._id}`)} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-indigo-50 flex items-center gap-3 transition-colors">
                              <Edit2 size={16} className="text-indigo-500" /> Edit Category
                            </button>
                            <button onClick={() => removeCategory(cat._id)} className="w-full px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 border-t border-slate-50">
                              <Trash2 size={16} /> Delete Category
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {items.map((item) => (
                      <div key={item._id} className={`group bg-white rounded-[2rem] border transition-all duration-300 ${item.available ? 'border-slate-200 hover:shadow-2xl hover:-translate-y-1' : 'border-slate-100 opacity-80'}`}>
                        <div className="relative h-52 w-full p-3">
                          <div className="w-full h-full rounded-[1.5rem] overflow-hidden shadow-inner bg-slate-100">
                            <ImageGrid images={item.images} name={item.name} available={item.available} />
                          </div>
                          
                          <div className="absolute top-5 right-5 z-20">
                            <button onClick={() => toggleMenu(item._id)} className="p-2 bg-white/90 backdrop-blur hover:bg-white rounded-xl text-slate-800 shadow-lg transition-all active:scale-90">
                              <MoreVertical size={18} />
                            </button>
                            {openMenu === item._id && (
                              <>
                                <div className="fixed inset-0 z-[160]" onClick={() => setOpenMenu(null)}></div>
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[170] py-1.5 overflow-hidden">
                                  <button onClick={() => navigate(`/edit-menu/${item._id}`)} className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <Edit2 size={14} className="text-indigo-500" /> Edit Item
                                  </button>
                                  <button onClick={() => removeMenu(item._id)} className="w-full px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50">
                                    <Trash2 size={14} /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="px-6 pb-6 pt-2">
                          <h3 className="font-extrabold text-slate-800 text-lg truncate mb-1">{item.name}</h3>
                          <div className="mb-5 space-y-1">
  
                              <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Dine In
                                </span>

                                <span className="text-2xl font-black text-indigo-600">
                                  {item.dineInPrice}
                                </span>

                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                  ETB
                                </span>
                              </div>

                              <div className="flex items-baseline gap-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  Takeaway
                                </span>

                                <span className="text-lg font-black text-emerald-600">
                                  {item.takeawayPrice}
                                </span>

                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                  ETB
                                </span>
                              </div>

                            </div>
                          
                          <div className={`flex items-center justify-between p-3 rounded-2xl border transition-colors ${item.available ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-[1px] ${item.available ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {item.available ? 'Live on Menu' : 'Hidden'}
                            </span>
                            <button 
                              onClick={() => handleStatusToggle(item._id, item.available)} 
                              className={`w-12 h-6.5 rounded-full relative transition-all duration-300 ${item.available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300 ${item.available ? 'translate-x-6.5' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => navigate(`/create-menu?categoryId=${cat._id}`)} 
                      className="border-3 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-white transition-all group min-h-[320px]"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center mb-4 transition-colors">
                        <Plus size={28} />
                      </div>
                      <span className="font-black text-xs uppercase tracking-widest">Add New Dish</span>
                    </button>
                  </div>
                </section>
              );
            })}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[110] lg:hidden backdrop-blur-md transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}
    </div>
  );
}

export default Menu;