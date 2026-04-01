import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Info 
} from 'lucide-react';

export default function StudentAttendance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const monthStr = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }, [currentDate]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/student/attendance?month=${monthStr}`);
        setAttendance(data);
      } catch (err) {
        console.error('Failed to fetch attendance');
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, [monthStr]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const changeMonth = (offset) => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(next);
  };

  const getAttendanceForDay = (day) => {
    const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
    return attendance.find(a => a.date.startsWith(dateStr));
  };

  const attendanceSummary = useMemo(() => {
    const res = { present: 0, absent: 0, late: 0 };
    attendance.forEach(a => {
        if (a.status === 'present') res.present++;
        else if (a.status === 'absent') res.absent++;
        else if (a.status === 'late') res.late++;
    });
    return res;
  }, [attendance]);

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none tracking-tighter">Attendance Registry</h1>
          <p className="text-slate-500 font-medium tracking-wide">Monthly tracking of your presence & punctuality</p>
        </div>
        <div className="flex items-center bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 gap-2">
          <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="px-6 flex items-center gap-3">
             <CalendarIcon size={20} className="text-emerald-600" />
             <span className="font-black text-slate-700 w-32 text-center uppercase tracking-widest text-sm">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </span>
          </div>
          <button onClick={() => changeMonth(1)} className="p-3 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 bg-white p-10 rounded-[40px] shadow-2xl shadow-slate-200/60 border border-slate-100 relative group overflow-hidden">
           <div className="grid grid-cols-7 gap-6 text-center mb-10">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{day}</div>
              ))}
           </div>
           
           {loading ? (
             <div className="grid grid-cols-7 gap-6 animate-pulse">
                {[...Array(35)].map((_, i) => <div key={i} className="aspect-square bg-slate-100 rounded-2xl" />)}
             </div>
           ) : (
             <div className="grid grid-cols-7 gap-6">
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={i} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const record = getAttendanceForDay(day);
                  const statusColors = {
                    present: 'bg-emerald-500 text-white shadow-emerald-200',
                    absent: 'bg-red-500 text-white shadow-red-200',
                    late: 'bg-amber-500 text-white shadow-amber-200'
                  };
                  
                  return (
                    <div key={day} 
                        className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl border transition-all hover:scale-110 active:scale-95 group/day ${
                          record 
                            ? `${statusColors[record.status]} border-transparent shadow-lg` 
                            : 'bg-white border-slate-100 text-slate-300 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                    >
                       <span className="text-xl font-black">{day}</span>
                       {record && (
                          <div className="absolute top-1 right-1 opacity-0 group-hover/day:opacity-100 transition-opacity">
                             <div className="bg-white/20 backdrop-blur-md rounded-full p-0.5"><Info size={12} /></div>
                          </div>
                       )}
                    </div>
                  );
                })}
             </div>
           )}

           <div className="absolute -right-20 -bottom-20 opacity-5 group-hover:scale-125 transition-transform rotate-12">
              <CalendarIcon size={300} strokeWidth={1} />
           </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-8 h-full">
           <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group h-[400px] flex flex-col justify-between">
              <div>
                 <h3 className="text-2xl font-black mb-1 tracking-tight">Performance Summary</h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-loose">Current Enrollment Cycle</p>
              </div>
              
              <div className="space-y-6 flex-1 mt-10">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-black">
                          <CheckCircle2 size={24} />
                       </div>
                       <span className="font-bold text-sm">Present Days</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400">{attendanceSummary.present}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center font-black">
                         <XCircle size={24} />
                       </div>
                       <span className="font-bold text-sm">Absent Count</span>
                    </div>
                    <span className="text-2xl font-black text-red-400">{attendanceSummary.absent}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black">
                          <Clock size={24} />
                       </div>
                       <span className="font-bold text-sm">Late Frequency</span>
                    </div>
                    <span className="text-2xl font-black text-amber-400">{attendanceSummary.late}</span>
                 </div>
              </div>

              <div className="mt-8">
                 <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    <span>Target Rate</span>
                    <span>85%</span>
                 </div>
                 <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[78%] group-hover:w-[85%] transition-all duration-1000 ease-in-out"></div>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col gap-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Color Key Reference</h4>
              <div className="flex items-center gap-4 group">
                 <div className="w-5 h-5 bg-emerald-500 rounded-lg group-hover:scale-125 transition-transform" />
                 <span className="text-sm font-bold text-slate-700">Digital Presence Confirmed</span>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-5 h-5 bg-red-500 rounded-lg group-hover:scale-125 transition-transform" />
                 <span className="text-sm font-bold text-slate-700">Unexcused Absence Entry</span>
              </div>
              <div className="flex items-center gap-4 group">
                 <div className="w-5 h-5 bg-amber-500 rounded-lg group-hover:scale-125 transition-transform" />
                 <span className="text-sm font-bold text-slate-700">Delayed Login Session</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
