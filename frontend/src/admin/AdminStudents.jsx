import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', email: '', password: '', batchId: '', enrollmentNo: '', phone: '', course: '' });

  const fetchData = async () => {
    try {
      const [{ data: sData }, { data: bData }] = await Promise.all([
        axiosInstance.get('/admin/students'),
        axiosInstance.get('/batches')
      ]);
      setStudents(sData);
      setBatches(bData);
    } catch (err) {
      console.error('Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axiosInstance.put(`/admin/students/${studentForm._id}`, studentForm);
      } else {
        await axiosInstance.post('/admin/students', studentForm);
      }
      setStudentForm({ name: '', email: '', password: '', batchId: '', enrollmentNo: '', phone: '', course: '' });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this student?')) return;
    try {
      await axiosInstance.delete(`/admin/students/${id}`);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredStudents = useMemo(() => 
    students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.enrollmentNo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    ),
    [students, search]
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student Enrollment</h1>
          <p className="text-slate-500 font-medium">Manage student accounts and portal access</p>
        </div>
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search by name, ID or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-6 py-4 bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-200/50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all pl-14"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔎</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
        {/* Form Container */}
        <div className="xl:col-span-1 bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl shadow-slate-200/50 h-fit space-y-8 sticky top-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-black text-slate-800">{isEditing ? 'Sync Student' : 'Enroll Student'}</h2>
            <div className="w-12 h-1 bg-emerald-500 rounded-full mt-1"></div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Name</label>
              <input
                type="text"
                value={studentForm.name}
                onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Enrollment No</label>
              <input
                type="text"
                value={studentForm.enrollmentNo}
                onChange={(e) => setStudentForm({...studentForm, enrollmentNo: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Course</label>
              <input
                type="text"
                value={studentForm.course}
                onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Academic Batch</label>
              <select
                value={studentForm.batchId}
                onChange={(e) => setStudentForm({...studentForm, batchId: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
                required
              >
                <option value="">Select Batch</option>
                {batches.map(b => (
                  <option key={b._id} value={b._id}>{b.batchName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Contact Email</label>
              <input
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Secure Pass {isEditing && '(Optional)'}</label>
              <input
                type="password"
                value={studentForm.password}
                onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-emerald-600"
                required={!isEditing}
              />
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button 
                type="submit" 
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
              >
                {isEditing ? 'Update Records' : 'Complete Enrollment'}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setStudentForm({ name: '', email: '', password: '', batchId: '', enrollmentNo: '', phone: '', course: '' }); }}
                  className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Container */}
        <div className="xl:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col min-h-[600px]">
          <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Active Students</h2>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{filteredStudents.length} Verified Entries</span>
            </div>
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4 text-slate-300">
               <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="font-bold uppercase tracking-widest text-xs">Accessing Student Core...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-[0.25em] border-b border-slate-100">
                    <th className="px-10 py-6">ID & Student</th>
                    <th className="px-10 py-6">Course</th>
                    <th className="px-10 py-6">Assigned Batch</th>
                    <th className="px-10 py-6">Digital Reach</th>
                    <th className="px-10 py-6 text-center">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="group hover:bg-emerald-50/30 transition-all">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
                            {student.name[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">{student.enrollmentNo}</span>
                            <p className="font-black text-slate-800 text-lg group-hover:text-emerald-700 transition-colors">{student.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="font-bold text-slate-700">
                          {student.course || '—'}
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-black border border-slate-200">
                          📁 {student.batchId?.batchName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-10 py-7 text-sm font-bold text-slate-600">
                        <p>{student.email}</p>
                        <p className="text-xs font-medium text-slate-400 mt-1">Verified Digital Account</p>
                      </td>
                      <td className="px-10 py-7">
                        <div className="flex items-center justify-center gap-3 opacity-30 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setIsEditing(true); setStudentForm({...student, password: '', batchId: student.batchId?._id || '', course: student.course || ''}); }}
                            className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:text-emerald-500 shadow-sm transition-all"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(student._id)}
                            className="bg-white p-3 rounded-xl border border-slate-200 hover:border-red-500 hover:text-red-500 shadow-sm transition-all"
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
