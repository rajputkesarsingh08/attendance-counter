/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, LayoutGrid, ListTodo, Settings2, Sparkles, ChevronDown, Mail, MessageCircle, X } from 'lucide-react';
import { TimetableUpload } from './components/TimetableUpload';
import { SubjectManager } from './components/SubjectManager';
import { AttendanceCalculator } from './components/AttendanceCalculator';
import { Subject } from './services/geminiService';
import { cn } from './lib/utils';

const Accordion = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:text-zinc-600 transition-colors"
      >
        <span className="font-semibold text-sm">{title}</span>
        <ChevronDown size={16} className={cn("transition-transform duration-200", isOpen && "rotate-180")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 text-sm text-zinc-500 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'timetable' | 'subjects' | 'attendance'>('timetable');
  const [semesterStart, setSemesterStart] = useState('2026-01-01');
  const [semesterEnd, setSemesterEnd] = useState('2026-05-19');
  const [pastAttendance, setPastAttendance] = useState<Record<string, number>>({});
  const [showAbout, setShowAbout] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  }, []);

  const platformName = isMobile ? 'app' : 'website';

  // Load from localStorage
  useEffect(() => {
    const savedSubjects = localStorage.getItem('student-helper-subjects');
    if (savedSubjects) {
      try {
        setSubjects(JSON.parse(savedSubjects));
      } catch (e) {
        console.error("Failed to load subjects", e);
      }
    }

    const savedDates = localStorage.getItem('student-helper-dates');
    if (savedDates) {
      try {
        const { start, end } = JSON.parse(savedDates);
        setSemesterStart(start);
        setSemesterEnd(end);
      } catch (e) {
        console.error("Failed to load dates", e);
      }
    }

    const savedAttendance = localStorage.getItem('student-helper-past-attendance');
    if (savedAttendance) {
      try {
        setPastAttendance(JSON.parse(savedAttendance));
      } catch (e) {
        console.error("Failed to load past attendance", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('student-helper-subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('student-helper-dates', JSON.stringify({ start: semesterStart, end: semesterEnd }));
  }, [semesterStart, semesterEnd]);

  useEffect(() => {
    localStorage.setItem('student-helper-past-attendance', JSON.stringify(pastAttendance));
  }, [pastAttendance]);

  const handleSubjectsParsed = (newSubjects: Subject[]) => {
    // Merge unique subjects
    setSubjects(prev => {
      const existingNames = new Set(prev.map(s => s.name.toLowerCase()));
      const filtered = newSubjects.filter(s => !existingNames.has(s.name.toLowerCase()));
      return [...prev, ...filtered];
    });
    setActiveTab('subjects');
  };

  const handleDatesChange = (start: string, end: string) => {
    setSemesterStart(start);
    setSemesterEnd(end);
  };

  const handlePastAttendanceChange = (monthKey: string, percentage: number) => {
    setPastAttendance(prev => ({ ...prev, [monthKey]: percentage }));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Logo and name removed for minimal look as requested */}
          </div>
          <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-2xl">
            {(['timetable', 'subjects', 'attendance'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize",
                  activeTab === tab 
                    ? "bg-white text-zinc-900 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-2"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Manage your <span className="text-zinc-400">academic</span> balance.
          </h1>
          <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
            Upload your timetable, set priorities, and find out exactly how many days you can skip while staying on track.
          </p>
        </motion.div>

        {/* Content Area */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeTab === 'timetable' && (
              <motion.div
                key="timetable"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <TimetableUpload onParsed={handleSubjectsParsed} />
              </motion.div>
            )}

            {activeTab === 'subjects' && (
              <motion.div
                key="subjects"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <SubjectManager subjects={subjects} onUpdate={setSubjects} />
              </motion.div>
            )}

            {activeTab === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <AttendanceCalculator 
                  subjects={subjects} 
                  semesterStart={semesterStart}
                  semesterEnd={semesterEnd}
                  onDatesChange={handleDatesChange}
                  pastAttendance={pastAttendance}
                  onPastAttendanceChange={handlePastAttendanceChange}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-6 py-12 border-t border-zinc-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">
            Built for students
          </p>
          <div className="flex gap-6">
            <button 
              onClick={() => setShowAbout(true)}
              className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors font-medium"
            >
              About
            </button>
            <button 
              onClick={() => setShowSupport(true)}
              className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors font-medium"
            >
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* About Modal */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">About the Creator</h2>
                  <button onClick={() => setShowAbout(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-zinc-600 leading-relaxed font-medium">
                    Hello Student!
                  </p>
                  <p className="text-zinc-600 leading-relaxed">
                    This {platformName} was created by <span className="font-bold text-zinc-900">Rajput Kesarsingh G</span>, 
                    a CSE(AIML) student (Enrollment: 240670142055).
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <Accordion title="Overview">
                    StudentHelper is a comprehensive {platformName} designed to help university students manage their academic attendance with precision. 
                    It provides a data-driven approach to balancing studies and personal time.
                  </Accordion>
                  <Accordion title="What does this {platformName} do?">
                    The {platformName} analyzes your timetable and calculates exactly how many lectures or full days you can skip while 
                    still meeting your required attendance percentage (e.g., 75% or 80%). It takes into account your past attendance 
                    to provide a realistic skip allowance for the remaining semester.
                  </Accordion>
                  <Accordion title="How to use it?">
                    <div className="space-y-2">
                      <p>1. <strong>Upload Timetable:</strong> Go to the Timetable tab and upload your schedule as a PDF file.</p>
                      <p>2. <strong>Manage Subjects:</strong> In the Subjects tab, mark subjects as Major or Minor and set their priorities.</p>
                      <p>3. <strong>Configure Attendance:</strong> In the Attendance tab, set your semester dates and target percentage.</p>
                      <p>4. <strong>Track Progress:</strong> Enter your past attendance for completed months to get an accurate analysis of your remaining skip allowance.</p>
                    </div>
                  </Accordion>
                  <Accordion title="Why use it?">
                    University life is busy and unpredictable. This tool gives you the data you need to make informed decisions about your time, 
                    ensuring you never fall below the mandatory attendance threshold while enjoying your college life to the fullest.
                  </Accordion>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {showSupport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSupport(false)}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Support</h2>
                  <button onClick={() => setShowSupport(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid gap-3">
                  <a 
                    href="mailto:rajputkesharsingh104@gmail.com"
                    className="flex items-center gap-4 p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all group"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <Mail size={20} className="text-zinc-900" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Email</p>
                      <p className="text-sm font-medium text-zinc-900">rajputkesharsingh104@gmail.com</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/919824877166?text=Hello,%20I%20came%20through%20your%20website/app."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl transition-all group"
                  >
                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                      <MessageCircle size={20} className="text-zinc-900" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">WhatsApp</p>
                      <p className="text-sm font-medium text-zinc-900">Chat with Creator</p>
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

