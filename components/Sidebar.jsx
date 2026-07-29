import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  UserPlus,
  Users,
  Utensils,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, user }) => {
  const location = useLocation();
  const restaurantId = user?.restaurantId;

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    ...(user?.role === "owner"
      ? [
          { name: "Menu", icon: <UtensilsCrossed size={20} />, path: "/my-menu" },
          { name: "Create Staff", icon: <UserPlus size={20} />, path: "/owner/create-staff" },
          { name: "My Staff", icon: <Users size={20} />, path: `/mystaffs/${restaurantId}` },
          { name: "Tables", icon: <Utensils size={20} />, path: "/tables" }
        ]
      : [
          { name: "Menu", icon: <UtensilsCrossed size={20} />, path: "/my-menu" },
          { name: "Tables", icon: <Utensils size={20} />, path: "/tables" }
        ]),
  ];

  return (
    <>
      {/* Changes:
        1. Added h-screen to ensure it takes full height.
        2. Added lg:sticky and top-0 so it stays put during scroll.
        3. shrink-0 prevents the flexbox from squishing the sidebar.
      */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out h-screen shrink-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0 lg:sticky lg:top-0`}>
        
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="flex items-center gap-5 mb-10">
            <div className="bg-sky-500/10 border border-sky-400/20 rounded-2xl w-16 h-16 flex items-center justify-center">
              <img src="/image/golden-tran-logo.png" alt="Logo" className="object-contain w-12 h-12" />
            </div>
            <span className="text-2xl font-extrabold text-white">
              Qr<span className="text-sky-500">Dine</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                onClick={() => setIsSidebarOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path 
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-900/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.icon} <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="mt-auto pt-6">
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center font-bold text-white shadow-inner">
                  {user?.name?.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold truncate text-white">{user?.name}</span>
                  <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{user?.role}</span>
                </div>
              </div>
              <button 
                onClick={() => { localStorage.clear(); window.location.href = "/login"; }} 
                className="w-full py-2.5 text-xs font-bold text-slate-300 bg-slate-700/50 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all border border-transparent hover:border-red-500/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
    </>
  );
};

export default Sidebar;