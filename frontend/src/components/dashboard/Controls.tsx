import React, { useState, useRef } from 'react';
import { Send } from "lucide-react";
import { Upload } from 'lucide-react';

// --- ACTION BUTTON ---
interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function ActionButton({ children, active, className, ...props }: ActionButtonProps) {
  return (
    <button
      {...props}
      className={`bg-[#0c0c0e] border border-[#141416] text-[#f1f5f9] px-4 py-2 rounded font-mono text-[11.5px] sm:text-xs cursor-pointer transition-all hover:bg-white hover:text-black hover:border-white disabled:opacity-50 disabled:cursor-not-allowed ${
        active ? 'bg-white text-black border-white' : ''
      } ${className || ''}`}
    >
      {children}
    </button>
  );
}

// --- CATEGORY PILLS ---
interface CategoryPillsProps {
  categories: { label: string; value: string; count?: number }[];
  selectedValue: string;
  onChange: (value: string) => void;
}

export function CategoryPills({ categories, selectedValue, onChange }: CategoryPillsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`font-mono text-[10px] py-1 px-2.5 rounded border transition-all cursor-pointer ${
            selectedValue === cat.value
              ? 'bg-white text-black border-white font-bold'
              : 'bg-transparent border-[#141416] text-[#888888] hover:text-white hover:border-[#888888]'
          }`}
        >
          {cat.label} {cat.count !== undefined ? `(${cat.count})` : ''}
        </button>
      ))}
    </div>
  );
}

// --- SEARCH INPUT ---
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className="w-full">
      <input
        {...props}
        className={`w-full bg-[#030304] border border-[#141416] rounded-md px-3 py-2 text-xs text-[#f1f5f9] font-mono outline-none focus:border-white placeholder:text-[#444444] ${
          className || ''
        }`}
      />
    </div>
  );
}

// --- CHAT INPUT FORM ---
interface ChatInputFormProps {
  onSubmit: (text: string) => void;
}

export function ChatInputForm({ onSubmit }: ChatInputFormProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSubmit(inputValue);
    setInputValue('');
  };

  return (
    <div className="bg-[#08080b] border border-[#141416] rounded-lg p-4 flex flex-col gap-3.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Send system instructions or query agents..."
          autoComplete="off"
          className="flex-grow bg-transparent border-none outline-none text-[#f1f5f9] text-[11px] sm:text-xs font-mono placeholder:text-[#444444]"
        />
        <button
          type="submit"
          className="bg-white border-none text-black w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all hover:bg-[#888888] hover:text-white"
        >
          <Send className="h-4 w-4" strokeWidth={2} />
        </button>
      </form>
    </div>
  );
}

// --- UPLOAD DROPZONE ---
interface UploadDropzoneProps {
  onUpload: (fileName: string, fileSize: string) => void;
}

export function UploadDropzone({ onUpload }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      onUpload(file.name, sizeMb);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      onUpload(file.name, sizeMb);
    }
  };

  const triggerFileSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-7 text-center bg-[#030304] transition-colors flex justify-center items-center ${
        isDragOver ? 'border-white' : 'border-[#141416]'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <Upload className="h-9 w-9 text-[#888888]" strokeWidth={2} />
        <h3 className="font-mono text-xs sm:text-sm text-slate-100 font-bold">Drag & Drop Documents Here</h3>
        <p className="text-[11px] text-[#888888]">Supports .pdf, .md, .txt, .csv, .json (Max 25MB per file)</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
        />
        <ActionButton onClick={triggerFileSelect} className="mt-2.5">
          Select Local File
        </ActionButton>
      </div>
    </div>
  );
}
