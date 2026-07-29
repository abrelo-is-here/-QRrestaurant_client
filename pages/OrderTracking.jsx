import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Utensils, 
  Receipt, 
  PackageCheck,
  Star
} from "lucide-react";
import { host } from "../lib/Api";

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [rate, setRate] = useState('');
  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')
  const [restaurantId, setrestaurantId] = useState(null);
  console.log("restaurantId:" , restaurantId)


  

  const steps = [
    { id: "pending", label: "Order Received", icon: <Receipt size={20} />, desc: "We've got your order!" },
    { id: "preparing", label: "In the Kitchen", icon: <ChefHat size={20} />, desc: "Chef is working their magic 👨‍🍳" },
    { id: "ready", label: "Ready", icon: <PackageCheck size={20} />, desc: "Hot and fresh! On its way! 🎉" },
    { id: "completed", label: "Enjoy!", icon: <Utensils size={20} />, desc: "Hope to see you again soon." }
  ];

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${host}/api/orders/single/${id}`);
      setOrder(res.data);
      setrestaurantId(res.data?.restaurantId);
    } catch (err) {
      console.error("Error fetching order", err);
    }
  };

  useEffect(() => {
  if (!restaurantId) return;
  const fetchRate = async () => {
    try {
      const res = await axios.get(`${host}/api/rates/${restaurantId}` ,
        { headers: { Authorization: `Bearer ${token}` } });
      setRate(res.data?.rate);
    } catch (err) {
      console.error(err);
      setRate(null);
    }
  };

  fetchRate();
}, [restaurantId]);

  useEffect(() => {
    fetchOrder();
    const socket = io(`${host}`);

    socket.on("connect", () => setIsConnected(true));
    socket.emit("joinOrder", id);

    socket.on("orderUpdated", (updatedOrder) => {
      if (updatedOrder._id === id) {
        setOrder(updatedOrder);
        new Audio("/notification.mp3").play().catch(() => {});
      }
    });

    return () => socket.disconnect();
  }, [id]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium tracking-wide">Finding your feast...</p>
      </div>
    </div>
  );

  const isVIP = order.roomNumber?.toUpperCase().startsWith("VIP");

  const finalTotal = order.totalPrice || 0;

  const subtotal = order.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">

        {/* Header Card */}
        <div className={`bg-white rounded-3xl p-6 shadow-sm border ${isVIP ? 'border-amber-200 bg-amber-50/30' : 'border-slate-100'} mb-6 text-center relative overflow-hidden`}>
          {isVIP && (
            <div className="absolute top-0 right-0 p-2 bg-amber-500 text-white rounded-bl-xl shadow-md">
              <Star size={16} fill="currentColor" />
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            Live Status
          </div>

          <h1 className="text-2xl font-black text-slate-800 mb-1">Order Tracking</h1>
          <p className="text-slate-400 font-medium">
            Room #{order.roomNumber} {order.isTakeaway && "• Takeaway"}
          </p>
        </div>

        {/* Stepper Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-6">
          <div className="space-y-8 relative">
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100 -z-0" />

            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isDone = index < currentStepIndex;

              return (
                <div key={step.id} className="flex gap-6 items-start relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isActive ? "bg-orange-600 text-white shadow-lg shadow-orange-200 scale-110" :
                    isDone ? "bg-green-500 text-white" : "bg-slate-50 text-slate-300"
                  }`}>
                    {isDone ? <CheckCircle2 size={24} /> : step.icon}
                  </div>

                  <div className="pt-1">
                    <h3 className={`font-bold transition-colors ${isActive ? "text-slate-900 text-lg" : "text-slate-400"}`}>
                      {step.label}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isActive ? "text-slate-500 italic" : "text-slate-300"}`}>
                      {isActive ? step.desc : isDone ? "Completed" : "Waiting..."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-6">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Receipt size={18} className="text-slate-400" />
              Payment Summary
            </h3>
            {isVIP && (
              <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded uppercase">
                VIP Rate
              </span>
            )}
          </div>

          <div className="p-6 space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-orange-600">
                    {item.quantity}x
                  </span>
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {(item.price * item.quantity).toLocaleString()} ETB
                </span>
              </div>
            ))}

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} ETB</span>
              </div>

              <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount + VAT</span>

                <div className="text-right">
                  <div>
                    {finalTotal.toLocaleString()} ETB
                  </div>

                  <div className="text-sm text-slate-500 font-medium">
                    ≈ ${rate ? (finalTotal / rate).toFixed(2) : "0.00"} USD
                  </div>
                </div>
                            </div>

              <p className="text-[10px] text-center text-slate-400 mt-2 italic">
                Prices are inclusive of all taxes and service charges.
              </p>

                <p className="text-[10px] text-center text-slate-400 mt-2 italic">
                Prices are inclusive of all taxes and service charges.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-sm mb-10">
          Order ID: <span className="font-mono text-xs">{order._id}</span>
        </p>

      </div>
    </div>
  );
};

export default OrderTracking;