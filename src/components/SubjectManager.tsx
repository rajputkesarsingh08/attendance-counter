import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Star, StarOff, AlertCircle } from 'lucide-react';
import { Subject } from '../services/geminiService';
import { cn } from '../lib/utils';

interface SubjectManagerProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => void;
}

export const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, onUpdate }) => {
  const toggleMinor = (id: string) => {
    onUpdate(subjects.map(s => s.id === id ? { ...s, isMinor: !s.isMinor } : s));
  };

  const setPriority = (id: string, priority: Subject['priority']) => {
    onUpdate(subjects.map(s => s.id === id ? { ...s, priority } : s));
  };

  const deleteSubject = (id: string) => {
    onUpdate(subjects.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900">Subjects</h2>
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
          {subjects.length} Total
        </span>
      </div>

      {subjects.length === 0 ? (
        <div className="p-8 border-2 border-dashed border-zinc-200 rounded-2xl text-center">
          <p className="text-zinc-500 text-sm">No subjects added yet.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {subjects.map((subject) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={subject.id}
              className={cn(
                "group p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between",
                subject.isMinor ? "bg-zinc-50 border-zinc-100 opacity-60" : "bg-white border-zinc-200 shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex flex-col gap-1">
                <span className={cn(
                  "font-medium text-zinc-900",
                  subject.isMinor && "line-through text-zinc-400"
                )}>
                  {subject.name}
                </span>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(subject.id, p)}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full border transition-colors",
                        subject.priority === p 
                          ? "bg-zinc-900 text-white border-zinc-900" 
                          : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400"
                      )}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMinor(subject.id)}
                  className={cn(
                    "p-2 rounded-xl transition-colors",
                    subject.isMinor ? "text-amber-500 bg-amber-50" : "text-zinc-400 hover:bg-zinc-100"
                  )}
                  title={subject.isMinor ? "Mark as Major" : "Mark as Minor"}
                >
                  {subject.isMinor ? <StarOff size={18} /> : <Star size={18} />}
                </button>
                <button
                  onClick={() => deleteSubject(subject.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
