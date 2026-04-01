import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Search, 
  ArrowRight,
  Info,
  Calendar,
  XCircle,
  FileBadge
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchAssignments = async () => {
    try {
      const { data } = await axiosInstance.get('/student/assignments');
      setAssignments(data);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSubmit = async (id) => {
    try {
      await axiosInstance.post(`/student/assignments/${id}/submit`);
      toast.success('Successfully recorded digital submission');
      fetchAssignments();
      setSelected(null);
    } catch (err) {
      toast.error('Submission failed');
    }
  };

  const filtered = assignments.filter(a => 
    (a.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (a.lesson || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
         <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none tracking-tighter">Academic Portfolios</h1>
            <p className="text-slate-500 font-medium tracking-wide">Manage, track and submit your curriculum assignments</p>
         </div>
         <div className="relative w-full md:w-96">
            <input 
               type="text" 
               placeholder="Search by module name..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full px-8 py-4 bg-white border border-slate-100 rounded-3xl shadow-2xl shadow-slate-200/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all pl-16 font-medium"
            />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 items-start">
         {/* Main List Module */}
         <div className="xl:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px] group">
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 font-black text-sm uppercase tracking-widest text-slate-400">
               <span>Assignment Queue</span>
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-600">{filtered.length} Modules Active</span>
               </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 text-slate-300">
                 <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                 <p className="font-black uppercase tracking-widest text-xs">Scanning Digital Vault...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-[0.25em] border-b border-slate-50">
                          <th className="px-10 py-6">Identity & Topic</th>
                          <th className="px-10 py-6">Temporal Window</th>
                          <th className="px-10 py-6">Digital Proof/Logs</th>
                          <th className="px-10 py-6 text-center">Gateway</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {filtered.map((item) => (
                         <tr key={item._id} className={`group hover:bg-emerald-50/20 transition-all cursor-pointer ${selected?._id === item._id ? 'bg-emerald-50/50' : ''}`} onClick={() => setSelected(item)}>
                            <td className="px-10 py-8">
                               <div className="flex items-center gap-5">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all shadow-lg ${item.submission ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                                     {item.submission ? <CheckCircle2 /> : <ClipboardList />}
                                  </div>
                                  <div className="flex flex-col gap-0.5">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.lesson || 'Coursework'}</p>
                                     <p className="font-black text-slate-800 text-lg group-hover:text-emerald-700 transition-colors uppercase italic tracking-tighter leading-tight">{item.title}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="flex flex-col gap-1.5 min-w-[120px]">
                                  <span className="text-[10px] font-black uppercase text-slate-400">Due Phase</span>
                                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                     <Calendar size={14} className="text-emerald-600" />
                                     {new Date(item.dueDate).toLocaleDateString()}
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-8">
                               {item.submission ? (
                                 <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-black uppercase text-emerald-500">Submitted</span>
                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                                       <Clock size={14} />
                                       {new Date(item.submission.submittedAt).toLocaleDateString()}
                                    </div>
                                 </div>
                               ) : (
                                 <div className="flex flex-col gap-1.5 opacity-50">
                                    <span className="text-[10px] font-black uppercase text-red-400 tracking-widest">Pending</span>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                       <XCircle size={14} />
                                       Awaiting Log
                                    </div>
                                 </div>
                               )}
                            </td>
                            <td className="px-10 py-8 text-center">
                               <div className="inline-block p-4 bg-white border border-slate-100 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                               </div>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            )}
            
            <div className="absolute top-0 right-0 opacity-5 group-hover:scale-125 transition-transform rotate-12 -mr-32 -mt-32">
               <ClipboardList size={500} strokeWidth={1} />
            </div>
         </div>

         {/* Selection Module / Detail Drawer */}
         <div className="xl:col-span-1 space-y-10 sticky top-12">
            {selected ? (
              <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group border border-slate-800 animate-in fade-in slide-in-from-right-10 duration-700">
                 <div className="relative z-10 space-y-10">
                    <div className="flex justify-between items-start">
                       <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Selected Portofolio</span>
                          <h2 className="text-3xl font-black italic tracking-tighter leading-none">{selected.title}</h2>
                       </div>
                       <button onClick={() => setSelected(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                          <XCircle size={20} />
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-slate-500">Max Score</span>
                          <span className="text-xl font-black">{selected.totalMarks} Points</span>
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase text-slate-500">Sub Type</span>
                          <span className="text-xl font-black">{selected.submissionType || 'PDF'} Digital</span>
                       </div>
                    </div>

                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-3">
                       <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                          <Info size={14} /> Description Logs
                       </h3>
                       <p className="text-sm font-medium text-slate-400 leading-relaxed font-mono">
                          {selected.description || 'System-generated academic coursework module overview.'}
                       </p>
                    </div>

                    {!selected.submission ? (
                      <div className="space-y-6 pt-4">
                         <div className="bg-emerald-950 p-6 rounded-3xl border border-emerald-800/50 flex gap-4 items-center">
                            <Clock className="text-emerald-400 shrink-0" size={28} />
                            <p className="text-xs font-bold text-emerald-200">Submit your work digital proof to mark this assignment as complete in the system registry.</p>
                         </div>
                         <button 
                            onClick={() => handleSubmit(selected._id)}
                            className="bg-emerald-600 w-full py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-900 group-hover:-translate-y-2 active:scale-95 flex items-center justify-center gap-3"
                         >
                            Confirm Digital Submission <ArrowRight size={20} />
                         </button>
                      </div>
                    ) : (
                      <div className="bg-white/10 p-8 rounded-4xl border border-emerald-500/50 flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-1000">
                         <FileBadge size={64} className="text-emerald-400" />
                         <div className="space-y-2">
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Verified Submission</h3>
                            <p className="text-sm font-medium text-slate-400">Your effort has been successfully logged. Grading in progress.</p>
                         </div>
                      </div>
                    )}
                 </div>
                 <div className="absolute right-0 bottom-0 opacity-5 -mr-12 -mb-12 pointer-events-none">
                    <CheckCircle2 size={300} strokeWidth={1} />
                 </div>
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border-4 border-dashed border-slate-100 p-12 flex flex-col items-center justify-center text-center gap-8 h-full min-h-[500px]">
                 <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center">
                    <ClipboardList size={48} strokeWidth={1.5} />
                 </div>
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Active State Awaiting</h3>
                    <p className="text-sm font-bold text-slate-400">Select an assignment from the registry to view details and proceed with submission gateway.</p>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-slate-200 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
