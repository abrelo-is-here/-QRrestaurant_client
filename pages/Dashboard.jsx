import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate , Link } from "react-router-dom";
import { toast } from "react-toastify";
import { host } from "../lib/Api";
import Sidebar from "../components/Sidebar";
import PopularOrder from "../components/PopularOrder";
import {
  ClipboardList,
  ChefHat,
  RefreshCcw,
  Trash2,
  Menu as MenuIcon,
  X,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Receipt
} from "lucide-react";
import { useCurrency } from "../lib/Currency";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  // State to handle showing/hiding popular items
  const [showPopular, setShowPopular] = useState(true);
  
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const restaurantId = user?.restaurantId;
  const restaurantName = user?.restaurantName;
  const audio = new Audio("/notification.mp3");
  const { rate } = useCurrency();

  const socket = io(host)

  const fetchOrders = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${host}/api/orders/${restaurantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

 

  useEffect(() => {
    if (!restaurantId) return;
    const socket = io(`${host}`);
    socket.emit("joinRestaurant", restaurantId);

    socket.on("newOrder", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      audio.play().catch(() => {});
      toast.success(`New Order: Table #${newOrder.tableNumber}`);
    });

    socket.on("orderUpdated", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    socket.on("orderDeleted", (orderId) => {
      setOrders((prev) => prev.filter((o) => o._id !== orderId));
    });

    fetchOrders();

    return () => {
      socket.off("newOrder");
      socket.off("orderUpdated");
      socket.off("orderDeleted");
      socket.disconnect();
    };
  }, [restaurantId]);

  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `${host}/api/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`${host}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === "all") return true;
    return order.status === filterStatus;
  });

   

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        user={user} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* --- HEADER --- */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
              {isSidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </button>
            <h1 className="text-lg font-bold text-slate-800">
              <span className="bg-gradient-to-tr from-sky-400 via-sky-600 to-cyan-500 bg-clip-text text-transparent">{restaurantName}</span> Kitchen
            </h1>
          </div>

          {
            user?.role === "owner"  && (
             <Link
              to= {rate ? "/update-currency" : "/create-currency"}
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {rate ? "Update Rate" : "Set Rate"}
            </Link>

            )
          }
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              {rate ? (
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-600">$</span>
                    <span className="text-xs font-semibold text-slate-500">1 =</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-slate-900">{Number(rate).toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-blue-500">ETB</span>
                  </div>
                </div>
              ) : (
                <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-xl"></div>
              )}
            </div>

            <button 
              onClick={fetchOrders} 
              className={`flex items-center gap-2 text-sm font-semibold text-sky-600 bg-sky-50 px-4 py-2 rounded-lg transition-all hover:bg-sky-100 ${loading ? "animate-pulse" : ""}`}
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          
          {/* --- TOGGLEABLE POPULAR ITEMS SECTION --- */}
          {showPopular && (
            <div className="relative mb-8 group">
              <button 
                onClick={() => setShowPopular(false)}
                className="absolute -top-3 -left-3 z-10 p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-full border border-slate-200 shadow-sm transition-all opacity-0 group-hover:opacity-100"
                title="Hide popular items"
              >
                <X size={16} />
              </button>
              <PopularOrder socket={socket} />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Pending" count={orders.filter(o => o.status === "pending").length} icon={<Clock size={20} />} color="amber" />
            <StatCard label="Preparing" count={orders.filter(o => o.status === "preparing").length} icon={<ChefHat size={20} />} color="blue" />
            <StatCard label="Ready" count={orders.filter(o => o.status === "ready").length} icon={<CheckCircle2 size={20} />} color="green" />
          </div>

          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
            <Filter size={18} className="text-slate-400 mr-2 shrink-0" />
            {["all", "pending", "preparing", "ready"].map((status) => (
              <button 
                key={status} 
                onClick={() => setFilterStatus(status)} 
                className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all border shrink-0 ${filterStatus === status ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
              >
                {status}
              </button>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <ClipboardList size={48} className="text-slate-200 mb-2" />
              <p className="text-slate-400 font-medium">No orders found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => (
                <OrderCard key={order._id} order={order} onUpdate={updateStatus} onDelete={deleteOrder} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Sub-components kept within the file
const StatCard = ({ label, count, icon, color }) => {
  const styles = {
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
  };
  return (
    <div className={`${styles[color]} p-5 rounded-2xl border flex items-center justify-between`}>
      <div>
        <p className="text-xs uppercase font-bold opacity-70 mb-1">{label}</p>
        <p className="text-3xl font-black">{count}</p>
      </div>
      <div className="p-3 bg-white/50 rounded-xl">{icon}</div>
    </div>
  );
};

const OrderCard = ({ order, onUpdate, onDelete }) => {
  const isVIP = order.isVIP; 
  const isTakeaway = order.isTakeaway;
    const { rate } = useCurrency();
  
  const statusColors = { 
    pending: "border-t-amber-500", 
    preparing: "border-t-blue-500", 
    ready: "border-t-green-500" 
  };
  console.log('order:' , order)

  return (
    <div className={`relative bg-white rounded-2xl shadow-sm border border-slate-200 border-t-4 ${statusColors[order.status]} flex flex-col transition-all hover:shadow-md`}>
      {isVIP && (
        <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-400 to-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg border-2 border-white uppercase tracking-wider animate-pulse">
          VIP Service
        </div>
      )}

      <div className="p-4 border-b border-slate-50 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Table</span>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter border ${
              isTakeaway 
                ? "bg-orange-50 text-orange-600 border-orange-100" 
                : "bg-emerald-50 text-emerald-600 border-emerald-100"
            }`}>
              {isTakeaway ? "Takeaway" : "Dine In"}
            </span>
          </div>
          <h2 className={`text-xl font-black ${isVIP ? "text-amber-600" : "text-slate-800"}`}>
            #{order.tableNumber}
          </h2>
        </div>
        <button onClick={() => onDelete(order._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-5 flex-grow space-y-3">
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
            <span className="text-slate-700 font-medium">
              <span className={`font-bold mr-2 ${isTakeaway ? "text-orange-600" : "text-emerald-600"}`}>
                {item.quantity}x
              </span>
              {item.name}
            </span>
            <span className="text-slate-400 italic">{(item.price * item.quantity).toLocaleString()} ETB</span>
          </div>
        ))}

        {order.specialRequests && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              <MessageSquare size={12} /> Special Request
            </p>
            <p className="text-xs text-slate-600 leading-relaxed italic">"{order.specialRequests}"</p>
          </div>
        )}
      </div>

      {/* FOOTER: No VAT mentioned here */}
      <div className={`px-5 py-4 border-t flex justify-between items-center ${
        isTakeaway ? "bg-orange-50/30 border-orange-100" : "bg-slate-50 border-slate-100"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-white shadow-sm ${isTakeaway ? "text-orange-500" : "text-emerald-500"}`}>
            <Receipt size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Amount</span>
            <span className="text-[9px] text-slate-400 font-medium italic">
              {isTakeaway ? "Incl. Takeaway Box Fees" : isVIP ? "Incl. VIP Surcharge" : "Standard Rate"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black ${isTakeaway ? "text-orange-700" : "text-slate-900"}`}>
            {order.totalPrice ? order.totalPrice.toLocaleString() : "0"} 
            <span className="text-[10px] ml-1 text-slate-500 font-bold">ETB</span>
          </span>
        </div>
        <div className="text-right">
          <span className={`text-xl font-black ${isTakeaway ? "text-orange-700" : "text-slate-900"}`}>
            {order.totalPrice ? (rate? (order.totalPrice / rate).toLocaleString() : "0") : "0"} 
            <span className="text-[10px] ml-1 text-slate-500 font-bold">USD</span>
          </span>
        </div>
      </div>

         <p className="text-xs text-slate-400 mt-3 ml-5">
              Order Time:{" "}
              <span className="font-bold text-slate-600">
                {new Date(order.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </p>
            
           <p className="text-xs text-slate-400 mt-3 ml-5">
             {
              order.status === "ready" ?
                <span className="font-bold text-slate-600">
                  Ready 
                </span>
             :
                <span className="font-bold text-slate-600">
                  Waiting: {Math.floor(
                  (Date.now() - new Date(order.createdAt)) / 60000
                )} min
                </span>
              
           
              }
               </p>
      <div className="p-4 grid grid-cols-2 gap-3 mt-auto">
        {/* ... buttons remain the same ... */}
        <button
          onClick={() => onUpdate(order._id, "preparing")}
          disabled={order.status !== "pending"}
          className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
            order.status !== "pending" 
              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          {order.status === "pending" ? "Start Cooking" : "In Progress"}
        </button>
        <button
          onClick={() => onUpdate(order._id, "ready")}
          disabled={order.status === "ready"}
          className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
            order.status === "ready" 
              ? "bg-green-500 text-white shadow-lg shadow-green-100" 
              : isTakeaway 
                ? "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100"
          }`}
        >
          {order.status === "ready" ? "Finished ✓" : "Mark Ready"}
        </button>
      </div>
    </div>
  );
};

//ORDER without VIP badge and surcharge
// const OrderCard = ({ order, onUpdate, onDelete }) => {
//   const statusColors = { pending: "border-t-amber-500", preparing: "border-t-blue-500", ready: "border-t-green-500" };

//   return (
//     <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 border-t-4 ${statusColors[order.status]} flex flex-col transition-all hover:shadow-md`}>
//       <div className="p-4 border-b border-slate-50 flex justify-between items-center">
//         <div>
//           <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Table</span>
//           <h2 className="text-xl font-black text-slate-800">#{order.tableNumber}</h2>
//         </div>
//         <button onClick={() => onDelete(order._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
//       </div>

//       <div className="p-5 flex-grow space-y-3">
//         {order.items.map((item, i) => (
//           <div key={i} className="flex justify-between items-center text-sm">
//             <span className="text-slate-700 font-medium">
//                 <span className="text-orange-600 font-bold mr-2">{item.quantity}x</span>
//                 {item.name}
//             </span>
//             <span className="text-slate-400 italic">{(item.price * item.quantity).toLocaleString()} ETB</span>
//           </div>
//         ))}

//         {order.specialRequests && (
//           <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100">
//             <p className="flex items-center gap-2 text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">
//               <MessageSquare size={12} /> Special Request
//             </p>
//             <p className="text-xs text-slate-600 leading-relaxed italic">"{order.specialRequests}"</p>
//           </div>
//         )}
//       </div>

//       {/* --- TOTAL AMOUNT SECTION --- */}
//       <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
//         <div className="flex items-center gap-2">
//             <div className="p-2 bg-white rounded-lg text-slate-400">
//                 <Receipt size={16} />
//             </div>
//             <div className="flex flex-col">
//                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
//                 <span className="text-[9px] text-slate-400 font-medium italic">Incl. 15% VAT</span>
//             </div>
//         </div>
//         <div className="text-right">
//           <span className="text-xl font-black text-slate-900">
//             {/* Fetches totalPrice from backend order object */}
//             {order.totalPrice ? order.totalPrice.toLocaleString() : "0"} 
//             <span className="text-[10px] ml-1 text-slate-500 font-bold">ETB</span>
//           </span>
//         </div>
//       </div>

//       <div className="p-4 grid grid-cols-2 gap-3 mt-auto">
//         <button
//           onClick={() => onUpdate(order._id, "preparing")}
//           disabled={order.status !== "pending"}
//           className={`py-2.5 rounded-xl font-bold text-sm transition-all ${order.status !== "pending" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
//         >
//           {order.status === "pending" ? "Start Cooking" : "In Progress"}
//         </button>
//         <button
//           onClick={() => onUpdate(order._id, "ready")}
//           disabled={order.status === "ready"}
//           className={`py-2.5 rounded-xl font-bold text-sm transition-all ${order.status === "ready" ? "bg-green-500 text-white shadow-lg shadow-green-100" : "bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-100"}`}
//         >
//           {order.status === "ready" ? "Finished ✓" : "Mark Ready"}
//         </button>
//       </div>
//     </div>
//   );
// };

export default Dashboard;