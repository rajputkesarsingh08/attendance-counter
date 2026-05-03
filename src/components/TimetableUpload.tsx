import React, { useState, useRef } from 'react';
import { Upload, FileText, File as FileIcon, Loader2, X } from 'lucide-react';
import { parseTimetable, Subject } from '../services/geminiService';
import { cn } from '../lib/utils';

interface TimetableUploadProps {
  onParsed: (subjects: Subject[]) => void;
}

export const TimetableUpload: React.FC<TimetableUploadProps> = ({ onParsed }) => {
  const [isParsing, setIsParsing] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    setIsParsing(true);
    try {
      const subjects = await parseTimetable(file);
      onParsed(subjects);
    } catch (error) {
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setIsParsing(true);
    try {
      const subjects = await parseTimetable(textInput);
      onParsed(subjects);
      setTextInput('');
      setShowTextInput(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-zinc-900">Upload Timetable</h2>
        <button 
          onClick={() => setShowTextInput(!showTextInput)}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          {showTextInput ? 'Use PDF Upload' : 'Paste Text Instead'}
        </button>
      </div>

      {showTextInput ? (
        <div className="space-y-3">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Paste your timetable text here..."
            className="w-full h-32 p-4 bg-white border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all resize-none text-sm"
          />
          <button
            onClick={handleTextSubmit}
            disabled={isParsing || !textInput.trim()}
            className="w-full py-3 bg-zinc-900 text-white rounded-2xl font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isParsing ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
            Parse Text
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative group cursor-pointer p-8 border-2 border-dashed border-zinc-200 rounded-3xl hover:border-zinc-400 hover:bg-zinc-50 transition-all text-center",
            isParsing && "pointer-events-none opacity-50"
          )}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="application/pdf" 
            className="hidden" 
          />
          
          <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-zinc-100 rounded-2xl group-hover:bg-white transition-colors">
              {isParsing ? (
                <Loader2 className="animate-spin text-zinc-900" size={24} />
              ) : (
                <FileIcon className="text-zinc-900" size={24} />
              )}
            </div>
            <div>
              <p className="font-medium text-zinc-900">
                {isParsing ? 'Analyzing Timetable...' : 'Drop PDF or click to upload'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Supports PDF files of your schedule</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
