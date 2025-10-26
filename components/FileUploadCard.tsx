"use client";

import { useState, useCallback } from 'react';

interface FileUploadCardProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUploadCard({ onFileSelect, selectedFile }: FileUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  return (
    <div className="glass-effect rounded-2xl p-8 hover-lift">
      <h2 className="text-xl font-semibold mb-8 text-gradient">Upload Creative</h2>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 group
          ${isDragging 
            ? 'border-blue-400 bg-blue-500/10 shadow-glow scale-105' 
            : 'border-border hover:border-blue-400/50'
          }
          ${selectedFile 
            ? 'border-green-400 bg-green-500/10 shadow-glow' 
            : ''
          }
        `}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileInput}
        />

        {!selectedFile ? (
          <div className="relative z-10">
            <div className="relative mb-6">
              <svg
                className="mx-auto h-16 w-16 text-muted-foreground group-hover:text-blue-400 transition-colors duration-300"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {isDragging && (
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse-glow"></div>
              )}
            </div>
            <p className="text-lg text-foreground mb-2 font-medium">
              Drag and drop your ad creative here
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Supports .png, .jpg, .mp4 (max 50MB)
            </p>
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl cursor-pointer hover:shadow-neon hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Select File
            </label>
          </div>
        ) : (
          <div className="relative z-10 space-y-4">
            <div className="relative">
              <svg
                className="mx-auto h-16 w-16 text-green-400 animate-fade-in"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse-glow"></div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <label
              htmlFor="file-upload"
              className="inline-block px-4 py-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer underline transition-colors duration-200"
            >
              Change file
            </label>
          </div>
        )}
      </div>

      <div className="mt-8 glass-effect rounded-xl p-6 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-blue-300 leading-relaxed">
              <span className="font-semibold text-blue-200">What happens next:</span> We'll extract signals from your creative and map it to artificial societies—networked buyer micro-communities who'll stress-test your messaging before you spend a dollar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
