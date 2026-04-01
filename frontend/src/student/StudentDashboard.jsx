import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  Trophy, 
  Clock, 
  LayoutDashboard, 
  CheckCircle2, 
  MapPin, 
  Calendar,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axiosInstance.get('/student/dashboard');
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-8 animate-pulse">
      <div className="h-56 bg-slate-200 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="h-96 bg-slate-200 rounded-3xl" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl shadow-emerald-200/50">
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight leading-none tracking-tighter">
            Hi, {stats?.name || 'Explorer'} 👋
          </h1>
          <p className="text-emerald-50 opacity-90 text-lg font-medium tracking-wide">
            You have {stats?.upcomingDeadlines?.length || 0} tasks nearing completion this week.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
             <Link to="/student/assignments" className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                View Assignments
             </Link>
             <Link to="/student/quizzes" className="bg-emerald-700/30 border border-emerald-400/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700/50 transition-colors">
                Practice Quizzes
             </Link>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 -mr-16 -mb-16">
           <Trophy size={400} strokeWidth={1} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
            📈
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Attendance</p>
            <p className="text-3xl font-black text-slate-900">{stats?.attendance || 0}</p>
            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">Present Status</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
            📚
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Assignments</p>
            <p className="text-3xl font-black text-slate-900">{stats?.assignments?.submitted}/{stats?.assignments?.total}</p>
            <p className="text-xs font-bold text-emerald-500 mt-1 flex items-center gap-1">Completed Cycles</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Practice Score</p>
            <p className="text-3xl font-black text-slate-900">88%</p>
            <p className="text-xs font-bold text-amber-600 mt-1">Excellent Level</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
            🏁
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Batch Progress</p>
            <p className="text-3xl font-black text-slate-900">72%</p>
            <p className="text-xs font-bold text-indigo-600 mt-1">Course Journey</p>
          </div>
        </div>
      </div>

      {/* Deadlines & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <div className="flex flex-col gap-0.5">
                  <h2 className="text-xl font-black text-slate-800">Upcoming Deadlines</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Immediate Actions Required</p>
               </div>
               <AlertTriangle className="text-amber-500" size={24} />
            </div>

            <div className="flex-1 overflow-x-auto min-h-[400px]">
               {stats?.upcomingDeadlines?.length > 0 ? (
                 <table className="w-full text-left">
                   <thead>
                     <tr className="border-b border-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <th className="px-8 py-5">Topic</th>
                        <th className="px-8 py-5">Lesson</th>
                        <th className="px-8 py-5">Expiry</th>
                        <th className="px-8 py-5 text-right">Link</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {stats.upcomingDeadlines.map((item) => (
                        <tr key={item._id} className="group hover:bg-slate-50/50 transition-all">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-2 h-8 bg-emerald-500 rounded-full group-hover:h-10 transition-all"></div>
                                 <p className="font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{item.title}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-sm font-bold text-slate-500">{item.lesson || 'N/A'}</td>
                           <td className="px-8 py-6">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase">
                                 <Clock size={12} />
                                 {new Date(item.dueDate).toLocaleDateString()}
                              </div>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <Link to="/student/assignments" className="p-3 bg-white border border-slate-100 inline-block rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                 <ArrowRight size={18} />
                              </Link>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               ) : (
                 <div className="flex flex-col items-center justify-center p-20 gap-4 text-slate-400">
                    <CheckCircle2 size={64} className="text-emerald-100" strokeWidth={1} />
                    <p className="font-black text-lg text-slate-300 uppercase tracking-widest">No pending deadlines</p>
                 </div>
               )}
            </div>
         </div>

         <div className="flex flex-col gap-8">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
               <h3 className="text-2xl font-black mb-2 relative z-10">Academic Support</h3>
               <p className="text-slate-400 text-sm font-medium mb-6 relative z-10">Need help with topics or technical issues?</p>
               <button className="bg-emerald-600 w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-emerald-500 transition-all relative z-10 active:scale-95">
                  Request Support
               </button>
               <MapPin className="absolute right-0 top-0 opacity-5 -mr-8 -mt-8 rotate-12 group-hover:scale-125 transition-transform" size={200} />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-200/50 flex-1">
               <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                  <Calendar className="text-emerald-600" size={20} />
                  System Notifications
               </h3>
               <div className="space-y-6">
                  <div className="flex gap-4 group">
                     <div className="w-1 h-12 bg-emerald-500 rounded-full shrink-0 group-hover:h-14 transition-all"></div>
                     <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Latest</p>
                        <p className="text-sm font-bold text-slate-800">Final Quiz schedule released for Core Algorithms session.</p>
                     </div>
                  </div>
                  <div className="flex gap-4 group opacity-60">
                     <div className="w-1 h-12 bg-slate-200 rounded-full shrink-0 group-hover:h-14 transition-all"></div>
                     <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Older</p>
                        <p className="text-sm font-bold text-slate-800">Holiday declared on Friday for Cultural Event.</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
