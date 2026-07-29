import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import {host} from '../../lib/Api.js'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  LogOut, 
  Utensils, 
  ChevronRight,
  ShieldCheck,
  Store
} from 'lucide-react';

function AdminDashBoard() {
  const { logout , user} = useAuth();
  const location = useLocation();

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <Link
      to={to}
      className={`flex items-center justify-between gap-3 p-3.5 rounded-xl transition-all duration-200 group ${
        isActive(to) 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="font-medium">{children}</span>
      </div>
      {isActive(to) && <ChevronRight size={16} />}
    </Link>
  );

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] font-sans">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">CraveAdmin</h2>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Central Console</p>
        </div>

      <nav className="flex-1 px-4 space-y-1.5">
          <NavLink to="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
          <NavLink to="/admin/create-restaurant" icon={PlusCircle}>Create Restaurant</NavLink>
          <NavLink to="/admin/restaurant-owners" icon={Users}>Manage Owners</NavLink>
          <NavLink to="/admin/all-restaurants" icon={Store}>All Restaurants</NavLink>
      </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={() => {
              if(window.confirm("Are you sure you want to logout?")) logout();
            }}
            className="w-full flex items-center gap-3 p-3.5 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
          <p className="text-slate-500 mt-2 text-lg">
            Welcome back, <span className="text-blue-600 font-semibold">Administrator</span>. Here’s what’s happening today.
          </p>
        </header>

        {/* Quick Stats Placeholder (Visual Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Revenue', value: '$12,450', color: 'bg-green-500' },
            { label: 'Active Branches', value: '24', color: 'bg-blue-500' },
            { label: 'Total Orders', value: '1,120', color: 'bg-orange-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                <span className="text-xs font-medium text-green-500">+4.5%</span>
              </div>
              <div className={`h-1.5 w-full ${stat.color} opacity-20 rounded-full mt-4`}></div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link
            to="/admin/create-restaurant"
            className="group bg-white border border-slate-100 rounded-3xl p-8 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100 transition-all duration-300 relative overflow-hidden"
          >
            <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">Add Restaurant</h4>
            <p className="text-slate-500 text-sm">Register a new restaurant location to the network.</p>
            <div className="absolute -bottom-4 -right-4 text-orange-100 opacity-20 group-hover:opacity-40 transition-opacity">
               <Store size={120} />
            </div>
          </Link>

          <Link
            to="/admin/restaurant-owners"
            className="group bg-white border border-slate-100 rounded-3xl p-8 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 relative overflow-hidden"
          >
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <Users size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">Manage Personnel</h4>
            <p className="text-slate-500 text-sm">Create and oversee owner and staff credentials.</p>
            <div className="absolute -bottom-4 -right-4 text-blue-100 opacity-20 group-hover:opacity-40 transition-opacity">
               <Users size={120} />
            </div>
          </Link>

          <Link 
            to="/admin/all-restaurants" 
            className="group bg-white border border-slate-100 rounded-3xl p-8 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 relative overflow-hidden"
          >
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl inline-block mb-4 group-hover:scale-110 transition-transform">
              <Utensils size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-1">Browse Portfolio</h4>
            <p className="text-slate-500 text-sm">View and edit all registered restaurant branches.</p>
            <div className="absolute -bottom-4 -right-4 text-emerald-100 opacity-20 group-hover:opacity-40 transition-opacity">
               <Utensils size={120} />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

export default AdminDashBoard;