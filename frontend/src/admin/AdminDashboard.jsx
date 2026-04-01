import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ teachers: 0, students: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [t, s] = await Promise.all([
          axiosInstance.get('/admin/teachers'),
          axiosInstance.get('/admin/students')
        ]);
        setStats({ teachers: t.data.length, students: s.data.length });
      } catch (err) {
        console.error('Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse flex items-center justify-center p-20 text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Overview</h1>
        <p className="text-slate-500 font-medium">Real-time system statistics and health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-100">
            📊
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">System Load</h3>
            <p className="text-3xl font-black text-slate-900 leading-tight">Optimal</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col gap-4">
          <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-violet-100">
            👨‍🏫
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">Total Teachers</h3>
            <p className="text-3xl font-black text-slate-900 leading-tight">{stats.teachers}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col gap-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-100">
            🎓
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">Total Students</h3>
            <p className="text-3xl font-black text-slate-900 leading-tight">{stats.students}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col gap-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-100">
            🔒
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-500 tracking-wider uppercase mb-1">System Security</h3>
            <p className="text-3xl font-black text-slate-900 leading-tight">Secure</p>
          </div>
        </div>
      </div>
    </div>
  );
}
