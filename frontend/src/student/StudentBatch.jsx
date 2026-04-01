import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  Users, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Briefcase,
  Star,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentBatch() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const { data } = await axiosInstance.get('/student/batch');
        setData(data);
      } catch (err) {
        toast.error('Failed to access batch core');
      } finally {
        setLoading(false);
      }
    };
    fetchBatch();
  }, []);

  if (loading) return (
    <div className="space-y-12 animate-pulse p-12 overflow-hidden">
       <div className="h-44 bg-slate-100 rounded-[50px] mb-12" />
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-96 bg-slate-100 rounded-[50px]" />
          <div className="h-96 bg-slate-100 rounded-[50px]" />
       </div>
    </div>
  );

  if (!data?.batch) return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center">
       <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
          <Users size={64} strokeWidth={1} />
       </div>
       <div className="space-y-2">
          <h2 className="text-4xl font-black italic tracking-tighter uppercase italic tracking-tighter text-slate-800">Unassigned Entry</h2>
          <p className="font-bold text-slate-500 max-w-md">Your account is not yet mapped to a specific academic cluster. Please contact the administrator registry.</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000">
       <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none tracking-tighter uppercase italic tracking-tighter">Academic Cluster</h1>
          <p className="text-slate-500 font-medium tracking-wide">Sync status and peer networking for your assigned batch</p>
       </div>

       {/* Batch Master Card */}
       <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-[60px] p-12 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 group border-b-[10px] border-emerald-500">
          <div className="relative z-10 flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <span className="bg-emerald-500 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest leading-none shadow-lg shadow-emerald-900 border border-emerald-400">Active Cycle</span>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">{data.batch.batchType} Enrollment</span>
             </div>
             <h2 className="text-6xl font-black italic tracking-tighter leading-tight uppercase tracking-tight group-hover:scale-105 transition-transform duration-700">{data.batch.batchName}</h2>
             <div className="flex flex-wrap gap-8 mt-4">
                <div className="flex items-center gap-3">
                   <Calendar size={20} className="text-emerald-500" />
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Established</p>
                      <p className="font-bold text-lg">{new Date(data.batch.createdAt).toLocaleDateString()}</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <Users size={20} className="text-emerald-500" />
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Clustered</p>
                      <p className="font-bold text-lg">{data.batch.totalStudents} Peers</p>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <Layers size={20} className="text-emerald-500" />
                   <div className="flex flex-col">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Sync Rate</p>
                      <p className="font-bold text-lg">{data.batch.progress}% Trace</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[50px] p-10 flex flex-col items-center text-center gap-6 shadow-2xl transition-all group-hover:bg-white/10">
             <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-5xl font-black shadow-xl shadow-emerald-900 animate-pulse border-4 border-white/10">
                🚀
             </div>
             <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-black uppercase tracking-widest">Ongoing Phase</h3>
                <p className="text-xs font-black text-slate-500 uppercase italic tracking-tighter">Academic Status: Verified Green</p>
             </div>
          </div>

          <div className="absolute right-0 top-0 opacity-10 -mr-32 -mt-32 pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
             <MapPin size={600} strokeWidth={1} />
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Faculty Assignment */}
          <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-10 group overflow-hidden relative">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                   <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Faculty Core</h2>
                   <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Cluster Supervisors</p>
                </div>
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                   <Briefcase size={22} />
                </div>
             </div>

             <div className="grid grid-cols-1 gap-6 relative z-10 h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                {data.teachers.map((teacher, i) => (
                   <div key={i} className="group/item flex items-center justify-between p-8 bg-slate-50/50 rounded-[35px] border border-slate-50 hover:bg-white hover:border-emerald-500/50 hover:shadow-2xl transition-all duration-500">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 bg-white border border-slate-100 rounded-[30px] flex items-center justify-center text-4xl shadow-md group-hover/item:rotate-12 transition-transform duration-500">
                            👨‍🏫
                         </div>
                         <div className="flex flex-col gap-1">
                            <h3 className="text-xl font-black italic tracking-tighter uppercase italic tracking-tighter text-slate-800">{teacher.name}</h3>
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-slate-400">
                                  <Mail size={14} /> <span className="text-xs font-bold font-black text-sm italic tracking-tighter uppercase italic tracking-tighter">{teacher.email}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400">
                         <Star size={16} fill="currentColor" />
                         <Star size={16} fill="currentColor" />
                         <Star size={16} fill="currentColor" />
                         <Star size={16} fill="currentColor" />
                         <Star size={16} fill="currentColor" />
                      </div>
                   </div>
                ))}
             </div>

             <div className="absolute right-0 bottom-0 opacity-5 -mr-16 -mb-16 -rotate-12 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                <Info size={400} strokeWidth={1} />
             </div>
          </div>

          {/* Peer Networking */}
          <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-10 group overflow-hidden relative">
             <div className="flex items-center justify-between relative z-10">
                <div className="flex flex-col">
                   <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Peer Network</h2>
                   <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Verified Classmates</p>
                </div>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full text-xs font-black">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   {data.classmates.length} Network Nodes
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 relative z-10 h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                {data.classmates.map((peer, i) => (
                   <div key={i} className="group/item flex flex-col gap-6 p-8 bg-slate-50/50 rounded-[40px] border border-slate-50 hover:bg-white hover:border-emerald-500/50 hover:shadow-2xl transition-all duration-500">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-emerald-600/10 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg border border-emerald-500/20 group-hover/item:bg-emerald-600 group-hover/item:text-white transition-all duration-500 uppercase italic tracking-tighter">
                            {peer.name[0]}
                         </div>
                         <div className="flex flex-col">
                            <h3 className="font-black italic tracking-tighter uppercase italic tracking-tighter leading-none mb-1 text-slate-800">{peer.name}</h3>
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{peer.email.split('@')[0]} Digital Key</span>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                         <div className="flex gap-2">
                            <div className="p-2 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer">
                               <Mail size={16} />
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all cursor-pointer">
                               <Phone size={16} />
                            </div>
                         </div>
                         <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all">
                            View Trace <ChevronRight size={14} />
                         </button>
                      </div>
                   </div>
                ))}
             </div>

             <div className="absolute right-0 bottom-0 opacity-5 -mr-16 -mb-16 pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-45">
                <ArrowRight size={500} strokeWidth={1} />
             </div>
          </div>
       </div>
    </div>
  );
}
