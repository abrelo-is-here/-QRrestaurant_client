import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  ShoppingBag, 
  Plus, 
  Utensils, 
  X, 
  ChevronRight, 
  Trash2,
  MessageSquare,
  ImageIcon
} from "lucide-react";
import { host } from "../lib/Api";

const MenuPage = () => {
  const { restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get("table");
  const urlSessionId = searchParams.get("sessionId"); // 🔥 Extract sessionId from URL

  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("dine-in");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showCart, setShowCart] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [rate, setRate] = useState("");



  // 🔥 1. Session Verification with Header & LocalStorage Fallback
  useEffect(() => {
  // Store token immediately if present in URL
  if (urlSessionId) {
    localStorage.setItem("qrSessionId", urlSessionId);
  }

  const verifySession = async () => {
    const activeSessionId = urlSessionId || localStorage.getItem("qrSessionId");

    try {
      await axios.get(
        `https://qrrestaurant-server.onrender.com/api/qr/verify`,
        {
          headers: {
            "x-session-id": activeSessionId || "" // 🔥 Send in header
          },
          params: {
            sessionId: activeSessionId || ""
          },
          withCredentials: true
        }
      );
      setLoading(false);
    } catch (err) {
      console.error("QR session verification failed", err);
      navigate("/invalid-access");
    }
  };

  verifySession();
}, [navigate, urlSessionId]);

  // Fetch currency rate
  useEffect(() => {
    if (!restaurantId) return;
    const fetchRate = async () => {
      try {
        const res = await axios.get(`${host}/api/rates/${restaurantId}`);
        setRate(res.data?.rate);
      } catch (err) {
        console.error(err);
        setRate(null);
      }
    };

    fetchRate();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      const [catRes, menuRes] = await Promise.all([
        axios.get(`${host}/api/categories/${restaurantId}`),
        axios.get(`${host}/api/menu/${restaurantId}`)
      ]);
      setCategories(catRes.data.data || []);
      setMenu(menuRes.data || []);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  useEffect(() => { fetchData(); }, [restaurantId]);
  useEffect(() => { 
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval); 
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-emerald-700 font-bold">
        Checking access...
      </div>
    );
  }

  const addToCart = (item) => {
    const price =
      orderType === "takeaway"
        ? item.takeawayPrice
        : item.dineInPrice;

    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);

      if (exists) {
        return prev.map(i =>
          i._id === item._id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          _id: item._id,
          name: item.name,
          dineInPrice: item.dineInPrice,
          takeawayPrice: item.takeawayPrice,
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (itemId) => setCart(prev => prev.filter(item => item._id !== itemId));

  const decreaseQuantity = (itemId) => {
    setCart(prev => prev
      .map(item => item._id === itemId ? { ...item, quantity: item.quantity - 1 } : item)
      .filter(item => item.quantity > 0)
    );
  };

  // Pricing Logic
  const subtotal = cart.reduce((acc, item) => {
    const itemPrice =
      orderType === "takeaway"
        ? item.takeawayPrice
        : item.dineInPrice;

    return acc + itemPrice * item.quantity;
  }, 0);

  const totalPrice = subtotal;

  // 🔥 2. Place Order with session header attached
  const placeOrder = async () => {
  if (cart.length === 0) return alert("Cart is empty!");

  const activeSessionId = urlSessionId || localStorage.getItem("qrSessionId");

  try {
    const res = await axios.post(
      `${host}/api/orders`,
      {
        restaurantId: restaurantId,
        tableNumber: String(tableNumber),
        specialRequests,
        isTakeaway: orderType === "takeaway",
        totalPrice,
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          price: orderType === "takeaway" ? item.takeawayPrice : item.dineInPrice,
          quantity: item.quantity
        }))
      },
      {
        headers: {
          "x-session-id": activeSessionId || "" // 🔥 Pass session ID
        },
        withCredentials: true
      }
    );

    navigate(`/order/${res.data._id}`);
    setCart([]);
    setSpecialRequests("");
    setShowCart(false);

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    alert(error.response?.data?.message || error.message || "Order failed. Try again.");
  }
};

  const ItemImages = ({ images }) => {
    if (!images || images.length === 0) {
      return (
        <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-200">
          <ImageIcon size={32} />
        </div>
      );
    }
    return (
      <div className="flex overflow-x-auto snap-x snap-mandatory h-full no-scrollbar">
        {images.map((img, idx) => (
          <img key={idx} src={img} alt="Dish" className="w-full h-full object-cover flex-shrink-0 snap-center" />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9]/[0.78] font-sans text-slate-900 pb-20 transition-colors">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 px-4 py-5">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-emerald-700 tracking-tight">QrDine Service</h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
              <span>Table #{tableNumber || "N/A"}</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300"></span>
              <span className={orderType === 'takeaway' ? 'text-orange-500' : ''}>{orderType}</span>
            </div>
          </div>

          {/* Dine-In / Takeaway Toggle */}
          <div className="flex bg-emerald-50 p-1 rounded-xl border border-emerald-100">
            <button 
              onClick={() => setOrderType("dine-in")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderType === 'dine-in' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-400'}`}
            >Dine In</button>
            <button 
              onClick={() => setOrderType("takeaway")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${orderType === 'takeaway' ? 'bg-white text-emerald-700 shadow-sm' : 'text-emerald-400'}`}
            >Takeaway</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {/* CATEGORY SCROLLER */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar sticky top-[73px] bg-emerald-50/50 backdrop-blur-lg z-30 py-3 -mx-4 px-4">
          <button
            onClick={() => setActiveCategory("all")}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${activeCategory === "all" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white/80 border-white text-emerald-700"}`}
          >All Items</button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-all border shadow-sm ${activeCategory === cat._id ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white/80 border-white text-emerald-700"}`}
            >{cat.name}</button>
          ))}
        </div>

        {/* MENU CONTENT */}
        <div className="mt-8 space-y-12">
          {categories.filter(cat => activeCategory === "all" || cat._id === activeCategory)
            .map(cat => (
              <section key={cat._id}>
                <h2 className="text-xs font-black text-emerald-800 mb-6 flex items-center gap-3 uppercase tracking-[0.3em]">
                   <span className="h-px bg-emerald-900/10 flex-grow"></span>
                   {cat.name}
                   <span className="h-px bg-emerald-900/10 flex-grow"></span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {menu.filter(item => item.categoryId === cat._id && item.available).map(item => (
                    <div key={item._id} className="bg-white/95 rounded-[28px] overflow-hidden shadow-xl shadow-emerald-900/5 border border-white/50 flex h-44 hover:scale-[1.02] transition-transform duration-300">
                      <div className="w-1/3 relative bg-emerald-50/30">
                        <ItemImages images={item.images} />
                      </div>
                      <div className="w-2/3 p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{item.name}</h3>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic">
                            {item.description || "Crafted with fresh ingredients."}
                          </p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="block text-[10px] font-bold text-emerald-600/50 uppercase tracking-tighter">Price</span>
                            <span className="text-xl font-black text-emerald-700 leading-none">
                              {orderType === "takeaway" ? item.takeawayPrice : item.dineInPrice} Etb
                            </span>
                          </div>
                          <button 
                            onClick={() => addToCart(item)}
                            className="bg-emerald-600 text-white w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-emerald-500"
                          >
                            <Plus size={24} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
        </div>
      </main>

      {/* MOBILE CART TRIGGER */}
      {cart.length > 0 && !showCart && (
        <div className="fixed bottom-6 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <button 
            onClick={() => setShowCart(true)}
            className="w-full bg-emerald-700 text-white flex justify-between items-center p-5 rounded-[24px] shadow-2xl ring-4 ring-[#E8F5E9]"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-emerald-700 w-8 h-8 flex items-center justify-center rounded-xl font-black text-sm">
                {cart.reduce((total, i) => total + i.quantity, 0)}
              </div>
              <span className="font-bold text-sm tracking-wide uppercase">Review Basket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl">{totalPrice.toLocaleString()} <span className="text-xs opacity-60">ETB</span></span>
              <ChevronRight size={24} className="text-emerald-300" />
            </div>
          </button>
        </div>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-emerald-900/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full bg-white rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            <div className="w-16 h-1.5 bg-emerald-100 rounded-full mx-auto mb-8" />
            
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-emerald-900">Your Basket</h2>
              <button onClick={() => setShowCart(false)} className="p-3 bg-emerald-50 rounded-full text-emerald-400">
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4 mb-10">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center bg-emerald-50/30 p-5 rounded-3xl border border-emerald-100/50">
                  <div className="flex items-center gap-5">
                    <div className="flex flex-col items-center gap-1 bg-white border border-emerald-100 rounded-2xl p-1.5 shadow-sm">
                      <button onClick={() => addToCart(item)} className="text-emerald-600 font-bold px-2 text-lg">+</button>
                      <span className="text-sm font-black text-emerald-900">{item.quantity}</span>
                      <button onClick={() => decreaseQuantity(item._id)} className="text-emerald-300 font-bold px-2 text-lg">-</button>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">{item.name}</h4>
                      <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">
                        {orderType === "takeaway" ? item.takeawayPrice : item.dineInPrice} ETB
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item._id)} className="text-emerald-200 hover:text-red-400 transition-colors p-2">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* Special Requests */}
            <div className="mb-10">
              <label className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em] mb-4 ml-2">
                <MessageSquare size={16} /> Chef Notes
              </label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special instructions for the chef?"
                className="w-full bg-emerald-50/50 border border-emerald-100 rounded-[28px] p-5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                rows="3"
              />
            </div>

            {/* Summary & Checkout */}
            <div className="bg-emerald-800 rounded-[35px] p-8 text-white shadow-2xl">
              <div className="bg-white/10 p-6 rounded-[28px] border border-white/20 mb-8 space-y-2">
                <div className="flex justify-between text-xs font-bold opacity-70 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} ETB</span>
                </div>
                
                <div className="h-px bg-white/20 my-4" />

                <span className="block text-[10px] opacity-60 font-black uppercase tracking-[0.2em] mb-1">
                  Total Payable
                </span>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black">{totalPrice.toLocaleString()}</span>
                  <small className="text-sm font-bold mb-1.5 opacity-60 uppercase">Etb</small>
                </div>

                {/* Currency Conversion */}
                <div className="flex items-center gap-4 my-4 opacity-30">
                  <div className="h-px bg-white flex-grow" />
                  <span className="text-[10px] font-black tracking-[0.3em]">OR</span>
                  <div className="h-px bg-white flex-grow" />
                </div>

                <div className="flex items-end gap-2 text-emerald-200">
                  <span className="text-4xl font-black">
                    {rate ? (totalPrice / rate).toFixed(2) : "0.00"}
                  </span>
                  <small className="text-sm font-bold mb-1.5 opacity-60 uppercase">Usd</small>
                </div>
              </div>
              
              <button onClick={placeOrder} className="w-full bg-white text-emerald-800 py-6 rounded-[28px] font-black text-xl hover:bg-emerald-50 active:scale-[0.98] transition-all uppercase tracking-widest">
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
