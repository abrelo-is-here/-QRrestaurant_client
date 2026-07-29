import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import axios from 'axios';
import { 
    Users, Mail, ShieldCheck, ArrowLeft, 
    UserCircle, Loader2, Trash2, UserPlus, Menu as MenuIcon, X 
} from "lucide-react";
import { host } from '../lib/Api';
import Sidebar from "../components/Sidebar"; // Assuming Sidebar is in components folder

function MyStaffs() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

      console.log('restaurantId from MyStaffs:', restaurantId);

    useEffect(() => {
           if (!restaurantId) return;
        async function fetchStaff() {
            try {
                const res = await axios.get(`${host}/api/staff/${restaurantId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('restaurantId:', restaurantId);
                setStaff(res.data?.staffList || []); 
                setLoading(false);
            } catch (error) {
                toast.error('Fetch My staff error: ' + error.message);
                setLoading(false);
            }
        }
        if (restaurantId) fetchStaff();
    }, [restaurantId, token]);

    async function deleteStaff(id) {
        if (!window.confirm("Are you sure you want to remove this staff member?")) return;
        
        try {
            await axios.delete(`${host}/api/staff/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStaff(prev => prev.filter(s => s._id !== id));
            toast.success('Staff member removed');
        } catch (error) {
             toast.error('Delete error: ' + error.message);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin"></div>
                    <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-500" size={20} />
                </div>
                <p className="text-slate-500 font-medium mt-4 animate-pulse">Loading team members...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F1F5F9] font-sans">
            {/* SHARED SIDEBAR */}
            <Sidebar 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={setIsSidebarOpen} 
                user={user} 
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* HEADER */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-[100]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600">
                                {isSidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
                            </button>
                            <button onClick={() => navigate(-1)} className="hidden sm:p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600 sm:block">
                                <ArrowLeft size={22} />
                            </button>
                            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">Staff Management</h1>
                                <p className="text-xs text-slate-500 font-medium">Restaurant ID: {restaurantId?.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/owner/create-staff')}
                            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-md active:scale-95 transition-all"
                        >
                            <UserPlus size={18} /> <span className="hidden sm:inline">Add New Staff</span>
                        </button>
                    </div>
                </header>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
                    <div className="max-w-6xl mx-auto">
                        {(!staff || staff.length === 0) ? (
                            <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200">
                                <div className="bg-sky-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <UserCircle size={40} className="text-sky-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">No staff found</h3>
                                <p className="text-slate-500 mt-2 max-w-xs mx-auto text-sm">
                                    You haven't added any team members yet. Click the button above to get started.
                                </p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Member</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {staff.map((member) => (
                                                <tr key={member._id} className="hover:bg-sky-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold shadow-inner">
                                                                {member.name?.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-slate-800">{member.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                                            <Mail size={14} className="text-sky-400" />
                                                            {member.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                            ${member.role === 'owner' ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'}`}>
                                                            <ShieldCheck size={12} />
                                                            {member.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button 
                                                            onClick={() => deleteStaff(member._id)} 
                                                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        >
                                                           <Trash2 size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-tight">
                                        Total Team Size: {staff.length}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* MOBILE OVERLAY */}
            {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        </div>
    );
}

export default MyStaffs;