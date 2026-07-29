import { useNavigate } from "react-router-dom";
import { QrCode, AlertCircle, ArrowLeft } from "lucide-react";

export const InvalidAccess = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-red-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-sky-50 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 border border-slate-100 text-center">
        {/* Icon Header */}
        <div className="mb-6 relative">
          <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto rotate-3 group hover:rotate-0 transition-transform duration-300">
            <QrCode size={40} className="text-rose-500" />
          </div>
          <div className="absolute bottom-0 right-[35%] translate-x-2 translate-y-2 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
            <AlertCircle size={20} className="text-rose-600 fill-rose-50" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
          Access Denied
        </h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          Your session has expired or the QR code is invalid. To view the menu and place an order, please <span className="font-bold text-slate-700">scan the QR code</span> on your table again.
        </p>

       

        {/* Help Footer */}
        <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-widest">
          Need help? Ask our staff for assistance
        </p>
      </div>
    </div>
  );
};