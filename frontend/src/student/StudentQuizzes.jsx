import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { 
  Trophy, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  ChevronRight, 
  Play, 
  AlertCircle,
  XCircle,
  BarChart3,
  CheckCircle,
  ChevronLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [attempting, setAttempting] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const fetchQuizzes = async () => {
    try {
      const { data } = await axiosInstance.get('/student/quizzes');
      setQuizzes(data);
    } catch (err) {
      toast.error('Failed to load assessment modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const startQuiz = async (quiz) => {
    try {
      const { data } = await axiosInstance.get(`/student/quizzes/${quiz._id}`);
      setAttempting(data);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setTimeLeft(data.duration * 60);
      setQuizResult(null);
    } catch (err) {
      toast.error('Failed to initiate quiz');
    }
  };

  useEffect(() => {
    if (!attempting || timeLeft <= 0 || quizResult) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [attempting, timeLeft, quizResult]);

  const handleNext = () => {
    if (currentQuestionIndex < attempting.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitQuiz = async () => {
    try {
      const { data } = await axiosInstance.post(`/student/quizzes/${attempting._id}/attempt`, { answers });
      setQuizResult(data);
      fetchQuizzes();
      toast.success('Quiz Submitted Successfully');
    } catch (err) {
      toast.error('Submission encountered an error');
    }
  };

  const available = quizzes.filter(q => !q.attempt);
  const attempted = quizzes.filter(q => q.attempt);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-12">
       <div className="relative w-32 h-32">
          <div className="absolute inset-0 border-8 border-emerald-100 rounded-full animate-pulse" />
          <div className="absolute inset-0 border-t-8 border-emerald-600 rounded-full animate-spin" />
       </div>
       <p className="text-sm font-black text-slate-400 tracking-widest uppercase">Initializing Assessment Gateway...</p>
    </div>
  );

  if (attempting && !quizResult) {
     const question = attempting.questions[currentQuestionIndex];
     const minutes = Math.floor(timeLeft / 60);
     const seconds = timeLeft % 60;

     return (
        <div className="fixed inset-0 z-50 bg-slate-900 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-700">
           {/* Header */}
           <div className="h-24 bg-white/5 border-b border-white/10 flex items-center justify-between px-12">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest leading-none">Assessment Active</span>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight uppercase tracking-tight">{attempting.title}</h2>
              </div>
              <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl shadow-xl transition-all ${timeLeft < 60 ? 'bg-red-500 shadow-red-900' : 'bg-emerald-600 shadow-emerald-900 animate-pulse'}`}>
                 <Clock size={24} className="text-white" />
                 <span className="text-xl font-black text-white font-mono">{minutes}:{seconds < 10 ? '0' : ''}{seconds}</span>
              </div>
              <button 
                 onClick={() => { if (window.confirm('Erase all progress and exit?')) setAttempting(null); }}
                 className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/50"
              >
                 <XCircle size={28} />
              </button>
           </div>

           {/* Content */}
           <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-12 py-16 scroll-smooth">
              <div className="flex items-center gap-4 mb-2">
                 <span className="bg-emerald-900 border border-emerald-700 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest leading-none">Module Question</span>
                 <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
                    <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-lg shadow-emerald-400" style={{ width: `${((currentQuestionIndex + 1) / attempting.questions.length) * 100}%` }}></div>
                 </div>
                 <span className="text-white font-black">{currentQuestionIndex + 1} / {attempting.questions.length}</span>
              </div>
              
              <div className="flex flex-col gap-20 mt-16">
                 <div className="space-y-6">
                    <h3 className="text-4xl font-bold text-white tracking-tight leading-snug">{question.questionText}</h3>
                    <div className="w-20 h-2 bg-emerald-600 rounded-full opacity-50"></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {question.options.map((opt, idx) => (
                       <button
                          key={idx}
                          onClick={() => {
                             const newAns = [...answers];
                             newAns[currentQuestionIndex] = { questionIndex: currentQuestionIndex, selectedAnswer: idx };
                             setAnswers(newAns);
                          }}
                          className={`group relative p-10 rounded-[40px] border-2 transition-all text-left flex items-center justify-between overflow-hidden active:scale-[0.98] ${
                             answers[currentQuestionIndex]?.selectedAnswer === idx 
                                ? 'bg-emerald-600/20 border-emerald-500 shadow-2xl shadow-emerald-900/50 scale-105 z-10' 
                                : 'bg-white/5 border-white/10 hover:border-emerald-500/50 hover:bg-white/10 text-white/80'
                          }`}
                       >
                          <div className="relative z-10 flex flex-col gap-2">
                             <span className={`text-xs font-black uppercase tracking-widest ${answers[currentQuestionIndex]?.selectedAnswer === idx ? 'text-emerald-400' : 'text-white/20'}`}>Option {String.fromCharCode(65 + idx)}</span>
                             <span className={`text-2xl font-bold italic tracking-tight leading-tight ${answers[currentQuestionIndex]?.selectedAnswer === idx ? 'text-white' : ''}`}>{opt}</span>
                          </div>
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${answers[currentQuestionIndex]?.selectedAnswer === idx ? 'bg-emerald-500 border-none animate-in zoom-in-50' : 'border-white/10 group-hover:border-emerald-500/50'}`}>
                             {answers[currentQuestionIndex]?.selectedAnswer === idx && <CheckCircle size={24} className="text-white" />}
                          </div>
                          {answers[currentQuestionIndex]?.selectedAnswer === idx && (
                             <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                                <CheckCircle size={200} strokeWidth={1} />
                             </div>
                          )}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Controls */}
              <div className="mt-auto pt-16 flex items-center justify-between">
                 <button 
                    disabled={currentQuestionIndex === 0}
                    onClick={handlePrev}
                    className="group px-10 py-6 rounded-3xl border-2 border-white/10 text-white font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:border-emerald-500 hover:text-emerald-500 transition-all disabled:opacity-20 disabled:pointer-events-none active:scale-95"
                 >
                    <ChevronLeft size={24} className="group-hover:-translate-x-2 transition-transform" /> Prev Core
                 </button>
                 <button 
                    onClick={handleNext}
                    className="group px-12 py-7 rounded-[35px] bg-emerald-600 text-white font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-emerald-500 shadow-2xl shadow-emerald-900 transition-all active:scale-95 text-lg"
                 >
                    {currentQuestionIndex === attempting.questions.length - 1 ? 'Execute Submit' : 'Next Module'} 
                    <ChevronRight size={28} className="group-hover:translate-x-3 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
     );
  }

  if (quizResult) {
     return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center p-8 animate-in fade-in zoom-in-95 duration-1000">
           <div className="bg-white max-w-2xl w-full rounded-[60px] p-20 shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col items-center gap-12 text-center group">
              <div className="relative">
                 <div className="w-56 h-56 bg-emerald-50 text-emerald-600 rounded-[50px] flex items-center justify-center font-black text-7xl shadow-xl shadow-emerald-100 border-4 border-white rotate-6 group-hover:rotate-0 transition-transform duration-700">
                    {Math.round((quizResult.score / quizResult.totalMarks) * 100)}%
                 </div>
                 <div className="absolute -top-6 -right-6 animate-bounce">
                    <Trophy size={64} className="text-amber-500 fill-amber-500" />
                 </div>
              </div>

              <div className="space-y-4">
                 <h2 className="text-5xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Final Audit Report</h2>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Successfully achieved {quizResult.score} / {quizResult.totalMarks} points</p>
                 <div className="w-24 h-1.5 bg-emerald-500 rounded-full mx-auto mt-4"></div>
              </div>

              <div className="grid grid-cols-2 gap-10 w-full">
                 <div className="p-10 rounded-4xl bg-slate-50 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Time Elapsed</span>
                    <p className="text-2xl font-black text-slate-700">Audit Phase 1</p>
                 </div>
                 <div className="p-10 rounded-4xl bg-emerald-950 flex flex-col gap-2 shadow-xl shadow-emerald-900/10">
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest text-center">Digital Credential</span>
                    <p className="text-2xl font-black text-white text-center">Verified ✅</p>
                 </div>
              </div>

              <button 
                 onClick={() => setQuizResult(null)}
                 className="w-full bg-slate-900 hover:bg-black text-white py-6 rounded-[35px] font-black uppercase tracking-[0.4em] text-sm shadow-2xl shadow-slate-300 transition-all active:scale-95 mt-4"
              >
                 Return to Overview
              </button>
              
              <div className="absolute top-0 left-0 opacity-5 pointer-events-none -ml-20 -mt-20 group-hover:scale-125 transition-transform duration-1000">
                 <BookOpen size={400} strokeWidth={1} />
              </div>
           </div>
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none tracking-tighter">Academic Checkpoints</h1>
        <p className="text-slate-500 font-medium tracking-wide">Validate your competency through periodic digital assessments</p>
      </div>

      <div className="flex gap-4 p-2 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 w-fit">
         <button 
            onClick={() => setActiveTab('available')}
            className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'available' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
         >
            Available Now ({available.length})
         </button>
         <button 
            onClick={() => setActiveTab('attempted')}
            className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${activeTab === 'attempted' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
         >
            Digital History ({attempted.length})
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
         {activeTab === 'available' ? (
           available.length > 0 ? (
             available.map(q => (
               <div key={q._id} className="group bg-white rounded-[40px] p-10 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-10 hover:border-emerald-500/50 transition-all flex flex-col justify-between hover:-translate-y-4 duration-500">
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center font-black text-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-12 duration-500">
                           <Play size={24} className="ml-1" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">{q.duration} MIN</span>
                     </div>
                     <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{q.lesson || 'Coursework'}</span>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-800 uppercase tracking-tight leading-tight uppercase tracking-tight">{q.title}</h3>
                     </div>
                  </div>
                  
                  <div className="space-y-6 pt-4 border-t border-slate-50">
                     <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-2">
                           <HelpCircle size={14} /> <span>Audit Points</span>
                        </div>
                        <span className="font-black text-slate-700">{q.totalMarks} EXP</span>
                     </div>
                     <button 
                        onClick={() => startQuiz(q)}
                        className="w-full bg-emerald-600 text-white py-5 rounded-[30px] font-black uppercase tracking-widest text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200 group-hover:shadow-emerald-300 active:scale-95 flex items-center justify-center gap-3"
                     >
                        Initiate Audit <ChevronRight size={18} />
                     </button>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-32 flex flex-col items-center text-center gap-8 opacity-40">
                <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <CheckCircle2 size={80} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">Queue Purged</h3>
                   <p className="font-bold uppercase tracking-widest text-xs">All assessment modules successfully cleared.</p>
                </div>
             </div>
           )
         ) : (
           attempted.length > 0 ? (
             attempted.map(q => (
               <div key={q._id} className="group bg-slate-900 rounded-[40px] p-10 shadow-2xl border border-slate-800 space-y-10 text-white hover:bg-black transition-all duration-700">
                  <div className="flex justify-between items-start">
                     <div className="w-16 h-16 bg-white/5 text-emerald-400 border border-white/10 rounded-3xl flex items-center justify-center font-black text-3xl group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-[-12deg]">
                        <CheckCircle size={32} />
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block">Performance</span>
                        <span className="text-3xl font-black text-emerald-400 italic tracking-tighter">
                           {Math.round((q.attempt.score / q.attempt.totalMarks) * 100)}%
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <span className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Completed Cycle</span>
                     <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase tracking-tight leading-tight uppercase tracking-tight line-clamp-1">{q.title}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-600">Points Log</span>
                        <span className="text-lg font-black text-slate-300">{q.attempt.score} / {q.attempt.totalMarks}</span>
                     </div>
                     <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] font-black uppercase text-slate-600">Date Logged</span>
                        <span className="text-lg font-black text-slate-300">{new Date(q.attempt.attemptedAt).toLocaleDateString()}</span>
                     </div>
                  </div>
               </div>
             ))
           ) : (
             <div className="col-span-full py-32 flex flex-col items-center text-center gap-8 opacity-40">
                <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                  <BarChart3 size={80} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-black italic tracking-tighter leading-tight uppercase tracking-tight text-slate-800">History Empty</h3>
                   <p className="font-bold uppercase tracking-widest text-xs">No audit logs found in the digital ledger.</p>
                </div>
             </div>
           )
         )}
      </div>
    </div>
  );
}
