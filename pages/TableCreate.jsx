import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  QrCode, Download, Printer, Table, Loader2, 
  Link as LinkIcon, Sparkles, Menu as MenuIcon, X 
} from "lucide-react";
import { host } from "../lib/Api";
import Sidebar from "../components/Sidebar";
import PopularOrder from "../components/PopularOrder";


function TableCreate() {
  const [tableNumber, setTableNumber] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const restaurantLink = `${host}/api/qr/scan?restaurantId=${user?.restaurantId}&table=${tableNumber}`;

  const handleGenerate = async () => {
    if (!tableNumber) {
      toast.error("Please enter a table number");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${host}/api/qr/generate`,
        { tableNumber: tableNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrImage(res.data.qr);
      console.log('data: ', res.data.url);
      toast.success(`QR Code for Table ${tableNumber} created!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement("a");
    link.href = qrImage;
    link.download = `Table-${tableNumber}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen bg-[#39D4CD] font-sans">
      {/* PRINT STYLES */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-qr-stand, #printable-qr-stand * {
              visibility: visible;
            }
            #printable-qr-stand {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 100%;
              max-width: 500px;
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="no-print">
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen} 
          user={user} 
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-black/10 z-0 pointer-events-none no-print"></div>

        <header className="lg:hidden relative z-[100] bg-white/20 backdrop-blur-md border-b border-white/30 p-4 flex items-center justify-between no-print">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-teal-900">
                <MenuIcon size={24} />
            </button>
            <h1 className="text-teal-900 font-bold tracking-tight">QR Generator</h1>
            <div className="w-10"></div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto py-12 px-6 lg:py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* LEFT SIDE: CONFIGURATION */}
            <div className="bg-white/30 backdrop-blur-2xl p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 relative overflow-hidden group no-print">
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-4">
                  <div className="bg-white/40 p-3.5 rounded-2xl text-teal-800 border border-white/50 shadow-sm">
                    <QrCode size={26} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-teal-900 tracking-tight">QR Generator</h2>
                    <p className="text-[10px] font-bold text-teal-800/60 uppercase tracking-[3px]">Digital Menu Creator</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="group">
                    <label className="block text-[11px] font-black text-teal-900/70 uppercase tracking-[2px] mb-3 ml-1">
                      Table Number
                    </label>
                    <div className="relative">
                      <Table size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-800/40" />
                      <input
                        type="text"
                        placeholder="e.g. VIP-01"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/40 border border-white/50 rounded-2xl focus:ring-4 focus:ring-white/30 focus:bg-white/60 outline-none transition-all font-semibold text-teal-950 placeholder:text-teal-800/40 text-sm shadow-inner"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="group w-full relative overflow-hidden bg-teal-800 text-white hover:bg-teal-900 font-black py-5 rounded-2xl shadow-lg shadow-teal-900/20 transition-all active:scale-[0.98] disabled:opacity-60"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3 tracking-wider uppercase text-xs">
                      {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <><Sparkles size={18} /> Generate Professional QR</>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
                     
            {/* RIGHT SIDE: TABLE TENT PREVIEW / PRINTABLE AREA */}
            <div className="flex flex-col items-center justify-center">
              {qrImage ? (
                <div className="w-full max-w-sm animate-in zoom-in-95 duration-500">
                  <div id="printable-qr-stand" className="bg-white/40 backdrop-blur-md p-2 rounded-[44px] shadow-2xl border border-white/50">
                    <div className="bg-white rounded-[36px] p-8 text-center shadow-inner">
                      <div className="mb-8">
                        <p className="text-[10px] font-black text-teal-500/50 uppercase tracking-[4px] mb-2">Scan & Order</p>
                        <div className="flex items-center justify-center gap-3">
                           <div className="h-[2px] w-8 bg-teal-50"></div>
                           <span className="text-4xl font-black text-teal-950 tracking-tighter italic">Table {tableNumber}</span>
                           <div className="h-[2px] w-8 bg-teal-50"></div>
                        </div>
                      </div>
                      
                      <div className="relative mx-auto w-fit">
                        <div className="absolute -inset-6 bg-[#39D4CD] rounded-[40px] blur-2xl opacity-20 no-print"></div>
                        <div className="relative bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm">
                          <img src={qrImage} alt="QR Code" className="w-44 h-44 rounded-lg" />
                        </div>
                      </div>

                      <div className="mt-8 space-y-2">
                        <p className="text-teal-900/30 text-[10px] font-black leading-relaxed uppercase tracking-[3px]">
                          Powered by <span className="text-teal-600">QrDine</span> Systems
                        </p>
                        <p className="text-teal-950 font-bold text-[11px] uppercase tracking-[2px] pt-2 border-t border-teal-50">
                           Company: NextWave Dev
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* APART URL CONTAINER (Visible on screen, hidden on print) */}
                  <div className="mt-6 no-print bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 shadow-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon size={14} className="text-teal-900" />
                      <span className="text-[10px] font-black text-teal-900 uppercase tracking-widest">Target URL</span>
                    </div>
                    <div className="bg-white/40 p-3 rounded-xl border border-white/50">
                      <p className="text-[11px] font-bold text-teal-950 break-all select-all cursor-pointer" title="Click to select">
                        {restaurantLink}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-8 no-print">
                    <button onClick={downloadQR} className="flex items-center justify-center gap-2 py-4 bg-teal-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-teal-950 transition-all active:scale-95 shadow-lg shadow-teal-900/20">
                      <Download size={16} /> Save Image
                    </button>
                    <button onClick={() => window.print()} className="flex items-center justify-center gap-2 py-4 bg-white/40 backdrop-blur-md border border-white/50 text-teal-950 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/60 transition-all active:scale-95">
                      <Printer size={16} /> Print Stand
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full max-w-sm aspect-[4/5] bg-white/20 backdrop-blur-sm rounded-[40px] border-4 border-dashed border-white/40 flex flex-col items-center justify-center text-teal-900/40 p-12 text-center group transition-all">
                  <div className="bg-white/30 p-8 rounded-full mb-6 border border-white/40 group-hover:bg-white/50 transition-all">
                    <QrCode size={48} strokeWidth={1} className="text-teal-900/60" />
                  </div>
                  <h3 className="text-teal-950 font-bold mb-2 uppercase tracking-wide text-sm">Preview Generator</h3>
                  <p className="text-xs font-medium">Define a table number on the left to see your brand-new digital menu QR stand.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {isSidebarOpen && <div className="fixed inset-0 bg-teal-950/40 z-[110] lg:hidden backdrop-blur-[2px]" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
}

export default TableCreate;