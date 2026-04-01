import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap, 
  FileCheck, 
  Download,
  Calendar,
  Search,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentResults() {
  const [data, setData] = useState({ attempts: [], chartData: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const { data } = await axiosInstance.get('/student/results');
        setData(data);
      } catch (err) {
        toast.error('Failed to load performance analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const stats = useMemo(() => {
    if (!data.attempts.length) return { avg: 0, highest: 0, latest: 0 };
    const avg = Math.round(data.attempts.reduce((acc, curr) => acc + (curr.score / curr.totalMarks * 100), 0) / data.attempts.length);
    const highest = Math.max(...data.attempts.map(at => (at.score / at.totalMarks * 100)));
    const latest = Math.round((data.attempts[data.attempts.length - 1].score / data.attempts[data.attempts.length - 1].totalMarks) * 100);
    return { avg, highest: Math.round(highest), latest };
  }, [data.attempts]);

  const filtered = data.attempts.filter(at => 
    at.quiz?.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-12 animate-pulse p-12">
       <div className="h-44 bg-slate-100 rounded-[40px]" />
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-96 bg-slate-100 rounded-[40px]" />
          <div className="h-96 bg-slate-100 rounded-[40px]" />
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-1000">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="flex flex-col gap-2">
             <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none tracking-tighter">Competence Matrix</h1>
             <p className="text-slate-500 font-medium tracking-wide">Deep analytics on your academic progress and ranking metrics</p>
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-4 bg-white text-slate-700 font-black uppercase tracking-widest text-[10px] rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all flex items-center gap-3">
                <Download size={16} /> Export Dossier
             </button>
             <button className="px-8 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-slate-300 hover:bg-black transition-all flex items-center gap-3 active:scale-95">
                <Lock size={16} /> Request Re-Audit
             </button>
          </div>
       </div>

       {/* Summary KPIs */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="relative bg-white p-10 rounded-[45px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-emerald-500/50 transition-all">
             <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[25px] flex items-center justify-center font-black text-3xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-blue-100">
                   📊
                </div>
                <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Global PCTL.</span>
             </div>
             <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Average Integrity</h3>
                <p className="text-4xl font-black text-slate-900 leading-tight italic tracking-tighter">{stats.avg}%</p>
             </div>
             <div className="absolute right-0 bottom-0 opacity-5 -mr-10 -mb-10 pointer-events-none group-hover:scale-125 transition-transform">
                <TrendingUp size={200} strokeWidth={1} />
             </div>
          </div>

          <div className="relative bg-white p-10 rounded-[45px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-emerald-500/50 transition-all">
             <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[25px] flex items-center justify-center font-black text-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-lg shadow-emerald-100">
                   🏆
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Peak Power</span>
             </div>
             <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Highest Threshold</h3>
                <p className="text-4xl font-black text-slate-900 leading-tight italic tracking-tighter">{stats.highest}%</p>
             </div>
             <div className="absolute right-0 bottom-0 opacity-5 -mr-10 -mb-10 pointer-events-none group-hover:scale-125 transition-transform">
                <Trophy size={200} strokeWidth={1} />
             </div>
          </div>

          <div className="relative bg-slate-900 p-10 rounded-[45px] shadow-2xl shadow-slate-400 border border-slate-800 overflow-hidden group text-white">
             <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-white/5 text-amber-400 rounded-[25px] flex items-center justify-center font-black text-3xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg">
                   ⚡
                </div>
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Last Cycle</span>
             </div>
             <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Current Sync</h3>
                <p className="text-4xl font-black text-white leading-tight italic tracking-tighter">{stats.latest}%</p>
             </div>
             <div className="absolute right-0 bottom-0 opacity-5 -mr-10 -mb-10 pointer-events-none group-hover:scale-125 transition-transform text-white">
                <Zap size={200} strokeWidth={1} />
             </div>
          </div>

          <div className="relative bg-white p-10 rounded-[45px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden group hover:border-emerald-500/50 transition-all">
             <div className="flex justify-between items-start mb-10">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[25px] flex items-center justify-center font-black text-3xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg shadow-indigo-100">
                   🎯
                </div>
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">Digital Log</span>
             </div>
             <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Audit Totals</h3>
                <p className="text-4xl font-black text-slate-900 leading-tight italic tracking-tighter">{data.attempts.length || 0}</p>
             </div>
             <div className="absolute right-0 bottom-0 opacity-5 -mr-10 -mb-10 pointer-events-none group-hover:scale-125 transition-transform">
                <FileCheck size={200} strokeWidth={1} />
             </div>
          </div>
       </div>

       {/* Visualization Module */}
       <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          <div className="xl:col-span-2 bg-white p-12 rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-10 group overflow-hidden relative">
             <div className="flex justify-between items-center relative z-10">
                <div className="flex flex-col">
                   <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Competence Convergence</h2>
                   <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Temporal Evolution Trends</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-black uppercase text-slate-400">
                   <div className="flex items-center gap-2">
                       <span className="w-3 h-3 bg-emerald-500 rounded-full" /> Performance Score
                   </div>
                </div>
             </div>
             
             <div className="h-[450px] w-full relative z-10 transition-all duration-1000 group-hover:scale-[1.02]">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={data.chartData}>
                      <defs>
                         <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                        dy={20}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                        dx={-20}
                      />
                      <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#0f172a', 
                            borderRadius: '24px', 
                            border: 'none', 
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                            color: '#fff',
                            padding: '20px'
                        }}
                        itemStyle={{ color: '#10b981', fontWeight: 900 }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', fontStyle: 'italic', fontWeight: 900, letterSpacing: '0.1em' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10b981" 
                        strokeWidth={6} 
                        fillOpacity={1} 
                        fill="url(#scoreColor)" 
                        animationDuration={2500}
                        dot={{ fill: '#10b981', stroke: '#fff', strokeWidth: 4, r: 8 }}
                        activeDot={{ r: 12, shadow: '0 0 20px #10b981' }}
                      />
                   </AreaChart>
                </ResponsiveContainer>
             </div>

             <div className="absolute right-0 top-0 opacity-5 rotate-12 -mr-32 -mt-32 pointer-events-none pointer-events-none transition-transform duration-1000 group-hover:scale-110">
                <TrendingUp size={600} strokeWidth={1} />
             </div>
          </div>

          <div className="bg-slate-900 rounded-[60px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between group">
             <div className="relative z-10 flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                   <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight">Academic Ranking</h2>
                   <div className="w-16 h-1 bg-emerald-500 rounded-full mt-2" />
                </div>
                
                <div className="space-y-8">
                   <div className="flex items-center justify-between p-6 bg-white/5 rounded-[30px] border border-white/10 group/item hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-900">
                            A
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-500">Subject Master</span>
                            <span className="font-black text-emerald-400 font-black italic tracking-tighter uppercase italic tracking-tighter">Algorithm Design</span>
                         </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-700 group-hover/item:text-white transition-all transform group-hover/item:translate-x-2" />
                   </div>

                   <div className="flex items-center justify-between p-6 bg-white/5 rounded-[30px] border border-white/10 group/item hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-900 font-black italic tracking-tighter">
                            B+
                         </div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-500">Logic Flow</span>
                            <span className="font-black text-blue-400 font-black italic tracking-tighter uppercase italic tracking-tighter">UI Engineering</span>
                         </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-700 group-hover/item:text-white transition-all transform group-hover/item:translate-x-2" />
                   </div>
                </div>
             </div>

             <div className="relative z-10 pt-12">
                   <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Degree Progress</span>
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Phase 3 Of 4</span>
                   </div>
                   <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-emerald-500 w-[75%] rounded-full shadow-lg shadow-emerald-400" />
                   </div>
             </div>
             
             <div className="absolute left-0 bottom-0 opacity-5 -ml-16 -mb-16 pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-45">
                <Target size={300} strokeWidth={1} />
             </div>
          </div>
       </div>

       {/* Detailed Log Module */}
       <div className="bg-white rounded-[60px] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col group">
          <div className="px-12 py-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-8 bg-slate-50/20">
             <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Master Performance Ledger</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Audit Registry Trace</p>
             </div>
             <div className="relative w-full md:w-80 group/search">
                <input 
                   type="text" 
                   placeholder="Filter audit logs..." 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   className="w-full px-8 py-4 bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none transition-all pl-16 font-medium italic tracking-tight"
                />
                <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-hover/search:text-emerald-500 transition-colors" />
             </div>
          </div>

          <div className="overflow-x-auto min-h-[500px]">
             {filtered.length > 0 ? (
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.3em] border-b border-slate-50">
                        <th className="px-12 py-7 font-black italic tracking-tighter">Audit Node</th>
                        <th className="px-12 py-7 font-black italic tracking-tighter text-center">Score Delta</th>
                        <th className="px-12 py-7 font-black italic tracking-tighter text-center">PCTL Rate</th>
                        <th className="px-12 py-7 font-black italic tracking-tighter">Digital Timestamp</th>
                        <th className="px-12 py-7 text-right font-black italic tracking-tighter">Verification</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filtered.map((at) => {
                        const pct = Math.round((at.score / at.totalMarks) * 100);
                        return (
                          <tr key={at._id} className="group hover:bg-emerald-50/30 transition-all font-black text-sm uppercase italic tracking-tighter font-black text-sm italic tracking-tighter uppercase italic tracking-tighter">
                             <td className="px-12 py-8">
                                <div className="flex items-center gap-5">
                                   <div className={`w-12 h-12 ${pct > 80 ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'} rounded-2xl flex items-center justify-center text-xl shadow-md border group-hover:scale-110 transition-transform`}>
                                      {pct > 80 ? '👑' : '📄'}
                                   </div>
                                   <div className="flex flex-col gap-0.5">
                                      <p className="font-black text-slate-800 text-lg group-hover:text-emerald-700 transition-colors uppercase italic tracking-tighter leading-tight uppercase italic tracking-tighter uppercase italic tracking-tighter">
                                         {at.quiz?.title || 'Unknown Asset'}
                                      </p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-12 py-8 text-center text-slate-700">
                                <span className="bg-slate-100 px-4 py-2 rounded-xl text-xs font-black">{at.score} / {at.totalMarks}</span>
                             </td>
                             <td className="px-12 py-8 text-center">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black ${pct > 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                   <TrendingUp size={14} /> {pct}%
                                </div>
                             </td>
                             <td className="px-12 py-8">
                                <div className="flex items-center gap-3 text-slate-400">
                                   <Calendar size={14} />
                                   <span className="font-black text-xs uppercase">{new Date(at.attemptedAt).toLocaleDateString()}</span>
                                </div>
                             </td>
                             <td className="px-12 py-8 text-right">
                                <button className="p-4 bg-white border border-slate-200 text-slate-300 hover:border-emerald-600 hover:text-emerald-600 rounded-2xl shadow-sm transition-all active:scale-95">
                                   <CheckCircle2 size={24} />
                                </button>
                             </td>
                          </tr>
                        );
                     })}
                  </tbody>
               </table>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-32 gap-6 opacity-30">
                   <Target size={120} strokeWidth={1} />
                   <h3 className="text-4xl font-black italic tracking-tighter uppercase italic tracking-tighter">No Audit Cycles Recorded</h3>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
