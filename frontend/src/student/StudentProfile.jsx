import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  UserCircle, 
  Mail, 
  Phone, 
  Lock, 
  ShieldCheck, 
  Camera, 
  Save, 
  Key,
  Info,
  Layers,
  ChevronRight,
  Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentProfile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', enrollmentNo: '', batchId: { batchName: '' } });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axiosInstance.get('/student/profile');
        setProfile(data);
      } catch (err) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const { data } = await axiosInstance.put('/student/profile', { name: profile.name, phone: profile.phone });
      setProfile(prev => ({ ...prev, name: data.name, phone: data.phone }));
      toast.success('Digital entry updated successfully');
    } catch (err) {
      toast.error('Profile update failed');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error('Verification mismatch: Passwords do not match');
    }
    setUpdatingPassword(true);
    try {
      await axiosInstance.put('/student/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Security key updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Access key update failed');
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center animate-pulse">
       <div className="w-44 h-44 bg-slate-100 rounded-full border-8 border-white shadow-2xl" />
       <div className="space-y-4">
          <div className="h-8 w-64 bg-slate-100 rounded-full mx-auto" />
          <div className="h-4 w-40 bg-slate-100 rounded-full mx-auto" />
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-10 duration-1000">
       <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none tracking-tighter uppercase italic tracking-tighter">Digital Identity</h1>
          <p className="text-slate-500 font-medium tracking-wide">Manage your academic credentials and system security protocols</p>
       </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-16 items-start">
          {/* Profile Master Card */}
          <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center text-center gap-10 group overflow-hidden relative border-t-[12px] border-emerald-500">
             <div className="relative z-10">
                <div className="relative group/avatar cursor-pointer">
                   <div className="w-44 h-44 bg-emerald-100 text-emerald-700 rounded-[60px] flex items-center justify-center font-black text-6xl shadow-2xl shadow-emerald-200 border-8 border-white group-hover/avatar:rotate-12 transition-transform duration-700">
                      {profile.name[0].toUpperCase()}
                   </div>
                   <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-slate-900 text-white rounded-3xl flex items-center justify-center shadow-xl border-4 border-white group-hover/avatar:scale-110 transition-transform">
                      <Camera size={24} />
                   </div>
                </div>
                <div className="mt-8 space-y-2">
                   <h2 className="text-3xl font-black italic tracking-tighter text-slate-800 uppercase tracking-tight">{profile.name}</h2>
                   <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">{profile.enrollmentNo || 'System UID Pending'}</span>
                      <span className="text-xs font-bold text-slate-400 capitalize">{profile.batchId?.batchName || 'Cluster Neutral Entry'}</span>
                   </div>
                </div>
             </div>

             <div className="w-full grid grid-cols-2 gap-6 relative z-10 pt-10 border-t border-slate-50">
                <div className="flex flex-col gap-1 p-6 bg-slate-50 rounded-[35px] border border-slate-100">
                   <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                   <span className="text-sm font-black text-emerald-600">Verified ✅</span>
                </div>
                <div className="flex flex-col gap-1 p-6 bg-slate-50 rounded-[35px] border border-slate-100">
                   <span className="text-[10px] font-black uppercase text-slate-400">Access Level</span>
                   <span className="text-sm font-black text-indigo-600">Student 🎓</span>
                </div>
             </div>

             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white p-3 rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all cursor-pointer">
                   <ShieldCheck size={24} />
                </div>
                <div className="w-12 h-12 bg-white p-3 rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all cursor-pointer">
                   <Layers size={24} />
                </div>
                <div className="w-12 h-12 bg-white p-3 rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-slate-400 hover:text-emerald-500 transition-all cursor-pointer">
                   <Info size={24} />
                </div>
             </div>

             <div className="absolute right-0 top-0 opacity-5 -mr-20 -mt-20 pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-12">
                <Fingerprint size={400} strokeWidth={1} />
             </div>
          </div>

          <div className="xl:col-span-2 space-y-16">
             {/* Profile Update Form */}
             <div className="bg-white rounded-[60px] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col gap-12 group overflow-hidden relative">
                <div className="flex items-center justify-between relative z-10">
                   <div className="flex flex-col">
                      <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Account Identity</h2>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mt-1 uppercase italic tracking-tighter">Modify Digital Signature</p>
                   </div>
                   <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center font-black">
                      <UserCircle size={28} />
                   </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 transition-all duration-700">
                   <div className="space-y-2 group/input">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Full Identity Name</label>
                      <div className="relative">
                         <input 
                            type="text" 
                            value={profile.name}
                            onChange={(e) => setProfile({...profile, name: e.target.value})}
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                            required
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">
                            <Info size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2 group/input opacity-60">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Digital Address (Static)</label>
                      <div className="relative">
                         <input 
                            type="email" 
                            value={profile.email}
                            disabled
                            className="w-full px-8 py-5 bg-slate-100 border border-slate-200 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter cursor-not-allowed"
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2 group/input">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Sync Connection Phone</label>
                      <div className="relative">
                         <input 
                            type="text" 
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none"
                            placeholder="+1 000 000 0000"
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors">
                            <Phone size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2 group/input opacity-60">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Enrollment Node (Read Only)</label>
                      <div className="relative">
                         <input 
                            type="text" 
                            value={profile.enrollmentNo}
                            disabled
                            className="w-full px-8 py-5 bg-slate-100 border border-slate-200 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter cursor-not-allowed"
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400">
                            <Layers size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="md:col-span-2 pt-6">
                      <button 
                        type="submit" 
                        disabled={updatingProfile}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-6 rounded-[35px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-emerald-900 transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                         {updatingProfile ? 'Syncing...' : 'Execute Profile Update'} <Save size={18} />
                      </button>
                   </div>
                </form>
             </div>

             {/* Password Security Module */}
             <div className="bg-slate-900 rounded-[60px] p-12 shadow-2xl shadow-slate-400 border border-slate-800 overflow-hidden relative group text-white">
                <div className="flex items-center justify-between relative z-10 mb-12">
                   <div className="flex flex-col">
                      <h2 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight">Security Protocols</h2>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mt-1 uppercase italic tracking-tighter">Update Cryptographic Key</p>
                   </div>
                   <div className="w-14 h-14 bg-white/5 text-amber-500 rounded-3xl flex items-center justify-center font-black border border-white/10 group-hover:bg-amber-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                      <Key size={28} />
                   </div>
                </div>

                <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-10 relative z-10">
                   <div className="space-y-2 group/input">
                      <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2">Current Access Key</label>
                      <div className="relative">
                         <input 
                            type="password" 
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-white placeholder-slate-700"
                            required
                            placeholder="Current Key"
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none group-focus-within/input:text-amber-500 transition-colors">
                            <Lock size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2 group/input">
                      <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2">Initialize New Key</label>
                      <div className="relative">
                         <input 
                            type="password" 
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-white placeholder-slate-700"
                            required
                            placeholder="New Signature Key"
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none group-focus-within/input:text-amber-500 transition-colors">
                            <ChevronRight size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-2 group/input">
                      <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-2">Verify Signature Key</label>
                      <div className="relative">
                         <input 
                            type="password" 
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-[30px] font-black text-sm italic tracking-tighter uppercase italic tracking-tighter focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all outline-none text-white placeholder-slate-700"
                            required
                            placeholder="Re-Enter New Key"
                         />
                         <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none group-focus-within/input:text-amber-500 transition-colors">
                            <ShieldCheck size={18} />
                         </div>
                      </div>
                   </div>

                   <div className="xl:col-span-2 pt-6 flex flex-col gap-6">
                      <button 
                        type="submit" 
                        disabled={updatingPassword}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-12 py-6 rounded-[35px] font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-black transition-all active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                         {updatingPassword ? 'Authorizing...' : 'Rotate Security Key'} <Lock size={18} />
                      </button>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                         <Info size={12} /> Key rotation will log out other active sessions
                      </div>
                   </div>
                </form>

                <div className="absolute right-0 top-0 opacity-5 -mr-16 -mt-16 pointer-events-none group-hover:scale-125 transition-transform duration-1000 rotate-12">
                   <Key size={400} strokeWidth={1} />
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
