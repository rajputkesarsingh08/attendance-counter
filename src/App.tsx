/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Info, 
  MessageSquare, 
  Settings as SettingsIcon, 
  X, 
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Mail,
  MessageCircle
} from 'lucide-react';
import { Subject, View } from './types';

// Mock/Initial Data
const INITIAL_SUBJECTS: Subject[] = [];

export default function App() {
  // --- App States ---
  // activeView: Konse screen par hai (timetable, subjects, etc.)
  const [activeView, setActiveView] = useState<View>('timetable');
  // subjects: Subjects ki list aur unka data
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  // isAboutModalOpen: About modal dikhana hai ya nahi
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  // isSupportModalOpen: Support modal ka state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  // targetPercentage: Kitni attendance chahiye (default 75%)
  const [targetPercentage, setTargetPercentage] = useState(75);
  // allowanceUnit: Skip allowance days mein dikhani hai ya lectures mein
  const [allowanceUnit, setAllowanceUnit] = useState<'days' | 'lectures'>('days');

  // Attendance Details
  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'short' }).toLowerCase();
  
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-05-31');
  
  // Past Attendance: Pichle mahino ka percentage store karne ke liye
  const [pastAttendance, setPastAttendance] = useState<Record<string, number>>({});

  // --- Logic and Syncing ---
  // Yeh effect auto-populate karta hai pichle mahino ko system date ke hisab se
  useEffect(() => {
    const start = new Date(startDate);
    const months: Record<string, number> = {};
    let tempDate = new Date(start);
    
    while (tempDate < today && tempDate.getMonth() < today.getMonth()) {
      const mName = tempDate.toLocaleString('default', { month: 'short' }).toLowerCase();
      months[mName] = pastAttendance[mName] || 100;
      tempDate.setMonth(tempDate.getMonth() + 1);
    }
    setPastAttendance(months);
  }, [startDate]);

  // --- Calculation Logic ---
  // totalAttended: Kitne lectures attend kiye hain sab milake
  const totalAttended = subjects.reduce((acc, s) => acc + s.attended, 0);
  // totalPossible: Kul kitne lectures ho sakte hain
  const totalPossible = subjects.reduce((acc, s) => acc + s.total, 0);
  // currentPercentage: Abhi ki attendance %
  const currentPercentage = totalPossible > 0 ? (totalAttended / totalPossible) * 100 : 0;

  // calculateCanSkip: Kitne din skip kar sakte hain, yeh calculate karta hai
  const calculateCanSkip = () => {
    if (totalPossible === 0) return 0;
    const maxPossibleTotal = Math.floor((totalAttended * 100) / targetPercentage);
    const skipDays = maxPossibleTotal - totalPossible;
    return skipDays > 0 ? skipDays : 0;
  };

  const calculateRequiredForImprovement = () => {
    if (totalPossible === 0) return 0;
    if (currentPercentage >= targetPercentage) return 0;
    const required = Math.ceil((targetPercentage * totalPossible - 100 * totalAttended) / (100 - targetPercentage));
    return required > 0 ? required : 0;
  };

  const canSkip = calculateCanSkip();
  const required = calculateRequiredForImprovement();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-50">
      {/* Header Tabs */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-50/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-screen-xl mx-auto px-6 h-20 flex items-center justify-center md:justify-end">
          <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
            {(['timetable', 'subjects', 'attendance'] as View[]).map((view) => (
              <button
                key={view}
                id={`tab-${view}`}
                onClick={() => setActiveView(view)}
                className={`px-5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all duration-300 ${
                  activeView === view 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <AnimatePresence mode="wait">
          {activeView === 'timetable' && (
            <motion.div
              key="timetable"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                  Manage your <span className="text-slate-300">academic</span> balance.
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Upload your timetable, set priorities, and find out exactly how many days you can skip while staying on track.
                </p>
              </div>

              <div className="space-y-6 pt-12">
                <div className="flex justify-between items-end">
                   <h2 className="text-xl md:text-2xl font-bold text-slate-800">Upload Timetable</h2>
                   <button className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors">Paste Text Instead</button>
                </div>
                <label className="w-full h-80 bg-white border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-100/30 transition-all group shadow-sm">
                  <div className="bg-slate-50 p-6 rounded-2xl group-hover:scale-110 transition-transform mb-6 border border-slate-100 shadow-sm">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">Drop PDF or click to upload</span>
                  <span className="text-sm text-slate-400 font-bold mt-2">Supports PDF files of your schedule</span>
                  <input type="file" className="hidden" />
                </label>
              </div>
            </motion.div>
          )}

          {activeView === 'subjects' && (
            <motion.div
              key="subjects"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                  Manage your <span className="text-slate-300">academic</span> balance.
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Upload your timetable, set priorities, and find out exactly how many days you can skip while staying on track.
                </p>
              </div>

              <div className="space-y-6 pt-12">
                <div className="flex justify-between items-end">
                  <h2 className="text-xl md:text-2xl font-bold text-slate-800">Subjects</h2>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">{subjects.length} TOTAL</span>
                </div>

                {subjects.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-100 rounded-[32px] h-48 flex items-center justify-center text-slate-300 font-black tracking-widest text-xs uppercase italic overflow-hidden">
                    No subjects added yet.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {subjects.map((subject) => (
                      <div 
                        key={subject.id} 
                        className="bg-white p-6 rounded-[28px] border border-slate-100 flex items-center justify-between hover:border-slate-200 hover:bg-slate-50/50 transition-all group"
                      >
                        <div className="space-y-1">
                          <h3 className="text-lg font-bold text-slate-800">{subject.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-400 font-bold">
                            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-40"/> {subject.attended} / {subject.total} Lectures</span>
                            <span className="bg-slate-100 px-3 py-1 rounded-full border border-slate-100 text-[10px] font-black text-slate-600">
                              {((subject.attended / subject.total) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                            <Plus className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setSubjects(subjects.filter(s => s.id !== subject.id))}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed border-slate-200 rounded-[28px] text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-900 hover:border-slate-300 transition-all bg-white hover:bg-slate-50/50">
                  <Plus className="w-5 h-5" />
                  Add Custom Subject
                </button>
              </div>
            </motion.div>
          )}

          {activeView === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                  Manage your <span className="text-slate-300">academic</span> balance.
                </h1>
                <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                  Upload your timetable, set priorities, and find out exactly how many days you can skip while staying on track.
                </p>
              </div>

              {/* Semester Period */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <Calendar className="w-4 h-4" /> SEMESTER PERIOD
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">Start Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">End Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Past Attendance Section */}
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <Clock className="w-4 h-4" /> PAST ATTENDANCE
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(pastAttendance).map(([month, val]) => (
                    <div key={month} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest pl-1">{month} 2026</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={val} 
                          onChange={(e) => setPastAttendance({...pastAttendance, [month]: parseInt(e.target.value)})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all font-bold text-slate-700"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 font-black">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <span>Required Attendance (%)</span>
                  <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                    <button 
                      onClick={() => setAllowanceUnit('days')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${allowanceUnit === 'days' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      DAYS
                    </button>
                    <button 
                      onClick={() => setAllowanceUnit('lectures')}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${allowanceUnit === 'lectures' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      LECTURES
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    step="5"
                    value={targetPercentage} 
                    onChange={(e) => setTargetPercentage(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
                  />
                  <span className="text-3xl font-black text-slate-900 min-w-16 text-right">{targetPercentage}%</span>
                </div>
              </div>

              {/* Main Allowance Card */}
              <div className="bg-[#1a1a1a] p-10 rounded-[48px] shadow-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] rounded-full -mr-20 -mt-20"></div>
                 
                 <div className="flex justify-between items-start mb-12">
                   <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                     <Clock className="w-4 h-4 text-white/40" />
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Remaining Allowance</span>
                   </div>
                   <div className="text-right">
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Current Status</span>
                     <span className="text-xl font-black text-emerald-400">{(totalPossible > 0 ? currentPercentage : 100).toFixed(1)}%</span>
                   </div>
                 </div>

                 <div className="mb-12">
                   <div className="flex items-baseline gap-4">
                     <h3 className="text-[120px] font-black text-white leading-none tracking-tighter">
                       {allowanceUnit === 'days' 
                         ? (totalPossible > 0 ? canSkip : 0) 
                         : Math.max(0, (totalAttended || 0) - Math.ceil((targetPercentage / 100) * (totalPossible || 0)))
                       }
                     </h3>
                     <span className="text-4xl font-black text-white/20">{allowanceUnit}</span>
                   </div>
                   <p className="text-xl font-bold text-white/40 mt-4 leading-relaxed max-w-sm">
                     You can skip this many {allowanceUnit} in the remaining semester.
                   </p>
                 </div>
 
                 <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-10">
                   <div>
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Total Lectures</span>
                     <span className="text-3xl font-black text-white/80">{totalPossible || 0}</span>
                   </div>
                   <div>
                     <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Must Attend</span>
                     <span className="text-3xl font-black text-white/80">{totalPossible > 0 ? Math.ceil((targetPercentage / 100) * totalPossible) : 0}</span>
                   </div>
                 </div>

                 <div className="mt-10 bg-white/5 border border-white/5 rounded-3xl p-6 flex items-start gap-4">
                    <div className="bg-white/10 p-2 rounded-xl">
                      <Info className="w-5 h-5 text-white/60 shrink-0" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-white/60">Calculation adjusted {Object.keys(pastAttendance).length} passed months.</p>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Remaining lectures: {totalPossible > 0 ? Math.max(0, totalPossible - totalAttended) : 0}</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">Built for Students</span>
        <div className="flex gap-12">
          <button onClick={() => setIsAboutModalOpen(true)} className="text-xs text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest transition-all">About</button>
          <button onClick={() => setIsSupportModalOpen(true)} className="text-xs text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest transition-all">Support</button>
        </div>
      </footer>

      {/* About Modal */}
      <AnimatePresence>
        {isAboutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white text-slate-900 w-full max-w-xl rounded-[40px] p-8 md:p-10 relative z-10 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col"
            >
              <button 
                onClick={() => setIsAboutModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tighter text-slate-900">About the Creator</h2>
                    <p className="text-slate-500 leading-relaxed font-bold">
                      Hello Student!<br/><br/>
                      This website was created by <strong className="text-slate-900">Rajput Kesarsingh G</strong>, a CSE(AIML) student (Enrollment: 240670142055).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <Accordion title="Overview">
                      StudentHelper is a comprehensive website designed to help university students manage their academic attendance with precision. It provides a data-driven approach to balancing studies and personal time.
                    </Accordion>
                    <Accordion title="What does this platform do?">
                      The website analyzes your timetable and calculates exactly how many lectures or full days you can skip while still meeting your required attendance percentage (e.g., 75% or 80%). It takes into account your past attendance to provide a realistic skip allowance for the remaining semester.
                    </Accordion>
                    <Accordion title="How to use it?">
                      <div className="space-y-4">
                        <p>1. <strong>Upload Timetable:</strong> Go to the Timetable tab and upload your schedule as a PDF file.</p>
                        <p>2. <strong>Manage Subjects:</strong> In the Subjects tab, mark subjects as Major or Minor and set their priorities.</p>
                        <p>3. <strong>Configure Attendance:</strong> In the Attendance tab, set your semester dates and target percentage.</p>
                        <p>4. <strong>Track Progress:</strong> Enter your past attendance for completed months to get an accurate analysis of your remaining skip allowance.</p>
                      </div>
                    </Accordion>
                    <Accordion title="Why use it?">
                      University life is busy and unpredictable. This tool gives you the data you need to make informed decisions about your time, ensuring you never fall below the mandatory attendance threshold while enjoying your college life to the fullest.
                    </Accordion>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSupportModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white text-slate-900 w-full max-w-md rounded-[48px] p-12 relative z-10 shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setIsSupportModalOpen(false)}
                className="absolute top-10 right-10 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-8">
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">Support</h2>
                <div className="space-y-4">
                  <a 
                    href="mailto:rajputkesharsingh104@gmail.com?subject=Inquiry%20from%20Website&body=Hi%2C%20I%20am%20from%20your%20website."
                    className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Email</span>
                      <span className="text-sm font-bold text-slate-700">rajputkesharsingh104@gmail.com</span>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/919824877166?text=I%20am%20from%20your%20website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group"
                  >
                    <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                      <MessageCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">WhatsApp</span>
                      <span className="text-sm font-bold text-slate-700">Chat with Creator</span>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-black/5 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left group"
      >
        <span className="font-black text-sm uppercase tracking-widest text-black/60 group-hover:text-black transition-colors">{title}</span>
        <ChevronDown className={`w-5 h-5 text-black/20 transition-transform duration-500 ${isOpen ? 'rotate-180 text-black/80' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-sm text-black/40 font-bold leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
