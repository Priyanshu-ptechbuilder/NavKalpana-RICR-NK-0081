import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ name: '', email: '', password: '' });

  const fetchTeachers = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/teachers');
      setTeachers(data);
    } catch (err) {
      console.error('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`/admin/teachers/${teacherForm._id}`, teacherForm);
      } else {
        await axiosInstance.post('/admin/teachers', teacherForm);
      }
      setTeacherForm({ name: '', email: '', password: '' });
      setIsEditing(false);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    try {
      await axiosInstance.delete(`/admin/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredTeachers = useMemo(() => 
    teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase())),
    [teachers, search]
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Faculty Management</h1>
        <div className="relative w-80">
          <input 
            type="text" 
            placeholder="Search teachers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-violet-500 outline-none transition-all pl-12"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">🔍</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Form Module */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 h-fit space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black text-slate-800">{isEditing ? 'Update Faculty' : 'Add New Faculty'}</h2>
            <p className="text-sm text-slate-500 font-medium tracking-tight">Enter system credentials</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
              <input
                type="text"
                value={teacherForm.name}
                onChange={(e) => setTeacherForm({...teacherForm, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Connection</label>
              <input
                type="email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Security Key {isEditing && '(Optional)'}</label>
              <input
                type="password"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                required={!isEditing}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <button 
                type="submit" 
                className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-95"
              >
                {isEditing ? 'Save Changes' : 'Create Account'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setTeacherForm({ name: '', email: '', password: '' }); }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Module */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[500px] flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-black text-slate-800">Faculty Registry</h2>
            <span className="bg-violet-100 text-violet-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {filteredTeachers.length} Accounts
            </span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-20 text-slate-400">Syncing database...</div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em] border-b border-slate-100">
                    <th className="px-8 py-4">Faculty Member</th>
                    <th className="px-8 py-4">Verification</th>
                    <th className="px-8 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher._id} className="group hover:bg-slate-50/50 transition-all border-b border-slate-50 last:border-0">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                            {teacher.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-black text-slate-800">{teacher.name}</p>
                            <p className="text-xs text-slate-400 font-medium">Joined {new Date(teacher.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-bold text-slate-700">{teacher.email}</p>
                          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Active Status</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setIsEditing(true); setTeacherForm({...teacher, password: ''}); }}
                            className="p-3 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition-all"
                            title="Edit Account"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(teacher._id)}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Deactivate Account"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
