import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, Calendar, Info, Clock, CalendarDays, AlertCircle } from 'lucide-react';
import { Subject } from '../services/geminiService';
import { cn } from '../lib/utils';

interface AttendanceCalculatorProps {
  subjects: Subject[];
  semesterStart: string;
  semesterEnd: string;
  onDatesChange: (start: string, end: string) => void;
  pastAttendance: Record<string, number>;
  onPastAttendanceChange: (monthKey: string, percentage: number) => void;
}

export const AttendanceCalculator: React.FC<AttendanceCalculatorProps> = ({ 
  subjects, 
  semesterStart, 
  semesterEnd,
  onDatesChange,
  pastAttendance,
  onPastAttendanceChange
}) => {
  const [requiredPercentage, setRequiredPercentage] = useState<number>(75);
  const [viewMode, setViewMode] = useState<'days' | 'lectures'>('days');

  const activeSubjects = useMemo(() => subjects.filter(s => !s.isMinor), [subjects]);

  const passedMonths = useMemo(() => {
    const start = new Date(semesterStart);
    const now = new Date();
    const months: { key: string; label: string }[] = [];
    
    if (isNaN(start.getTime())) return [];

    const current = new Date(start);
    current.setDate(1); // Start of month

    while (current < now) {
      // Only include if the month is fully or partially passed
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      if (monthEnd < now) {
        const key = `${current.getFullYear()}-${current.getMonth()}`;
        const label = current.toLocaleString('default', { month: 'long', year: 'numeric' });
        months.push({ key, label });
      }
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }, [semesterStart]);

  const calculation = useMemo(() => {
    if (activeSubjects.length === 0) return null;

    const start = new Date(semesterStart);
    const end = new Date(semesterEnd);
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) return null;

    // Helper to count working days in a range
    const countWorkingDays = (fromDate: Date, toDate: Date) => {
      let count = 0;
      const current = new Date(fromDate);
      while (current <= toDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    // Calculate total semester working days
    const totalWorkingDays = countWorkingDays(start, end);
    const totalLectures = totalWorkingDays * activeSubjects.length;

    // Calculate passed lectures and attended lectures
    let passedLectures = 0;
    let attendedLectures = 0;

    passedMonths.forEach(m => {
      const [year, month] = m.key.split('-').map(Number);
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);
      
      // Clamp to semester dates
      const rangeStart = monthStart < start ? start : monthStart;
      const rangeEnd = monthEnd > end ? end : monthEnd;
      
      const monthWorkingDays = countWorkingDays(rangeStart, rangeEnd);
      const monthTotalLectures = monthWorkingDays * activeSubjects.length;
      
      const attendancePercent = pastAttendance[m.key] ?? 100;
      const monthAttended = (attendancePercent / 100) * monthTotalLectures;
      
      passedLectures += monthTotalLectures;
      attendedLectures += monthAttended;
    });

    // Remaining lectures
    const remainingLectures = totalLectures - passedLectures;
    const requiredTotalAttended = Math.ceil((requiredPercentage / 100) * totalLectures);
    
    const neededFromRemaining = Math.max(0, requiredTotalAttended - attendedLectures);
    const skippableRemainingLectures = Math.floor(Math.max(0, remainingLectures - neededFromRemaining));
    
    // Convert to days
    const skippableRemainingDays = Math.floor(skippableRemainingLectures / activeSubjects.length);

    return {
      totalWorkingDays,
      totalLectures,
      passedLectures,
      attendedLectures,
      remainingLectures,
      requiredTotalAttended,
      skippableRemainingLectures,
      skippableRemainingDays,
      currentOverallPercent: passedLectures > 0 ? (attendedLectures / passedLectures) * 100 : null
    };
  }, [activeSubjects, requiredPercentage, semesterStart, semesterEnd, pastAttendance, passedMonths]);

  return (
    <div className="space-y-8">
      {/* Semester Configuration */}
      <div className="p-6 bg-white border border-zinc-200 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-zinc-900" size={18} />
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Semester Period</h3>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Start Date</label>
            <input
              type="date"
              value={semesterStart}
              onChange={(e) => onDatesChange(e.target.value, semesterEnd)}
              className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">End Date</label>
            <input
              type="date"
              value={semesterEnd}
              onChange={(e) => onDatesChange(semesterStart, e.target.value)}
              className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Past Attendance Section */}
      {passedMonths.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl space-y-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="text-zinc-900" size={18} />
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Past Attendance</h3>
          </div>
          <p className="text-xs text-zinc-500">Enter your attendance percentage for completed months.</p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {passedMonths.map(m => (
              <div key={m.key} className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">{m.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pastAttendance[m.key] ?? ''}
                    placeholder="100"
                    onChange={(e) => onPastAttendanceChange(m.key, Number(e.target.value))}
                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all text-sm font-medium pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Required Attendance (%)</label>
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
            {(['days', 'lectures'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                  viewMode === mode ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={requiredPercentage}
            onChange={(e) => setRequiredPercentage(Number(e.target.value))}
            className="flex-1 h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
          />
          <span className="text-2xl font-bold text-zinc-900 w-16 text-right">{requiredPercentage}%</span>
        </div>
      </div>

      {calculation ? (
        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-zinc-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                  <Clock size={12} className="text-zinc-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                    Remaining Allowance
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Current Status</p>
                  <p className="text-sm font-bold text-emerald-400">
                    {calculation.currentOverallPercent ? calculation.currentOverallPercent.toFixed(1) + '%' : 'N/A'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-bold tracking-tighter">
                    {viewMode === 'days' ? calculation.skippableRemainingDays : calculation.skippableRemainingLectures}
                  </span>
                  <span className="text-2xl text-zinc-500 font-medium">{viewMode}</span>
                </div>
                <p className="text-zinc-400 text-sm">
                  You can skip this many {viewMode} in the remaining semester.
                </p>
              </div>

              <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Lectures</p>
                  <p className="text-2xl font-bold text-white">{calculation.totalLectures}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Must Attend</p>
                  <p className="text-2xl font-bold text-white">{calculation.requiredTotalAttended}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <Info size={16} className="text-zinc-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Calculation adjusted for {passedMonths.length} passed months.
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Remaining lectures: {calculation.remainingLectures}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="p-12 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] text-center space-y-3">
          <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="text-zinc-300" size={24} />
          </div>
          <p className="text-zinc-500 text-sm font-medium">Add major subjects and set valid dates to see calculation.</p>
        </div>
      )}
    </div>
  );
};


