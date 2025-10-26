"use client";

import { useState, useCallback } from 'react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function UploadZone({ onFileSelect, selectedFile }: UploadZoneProps) {
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
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gradient mb-2">Creative Upload</h3>
        <p className="text-sm text-muted-foreground">
          Upload the ad you want to test (.png, .jpg, .mp4)
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex-1 border-2 border-dashed rounded-2xl flex items-center justify-center transition-all duration-300 group
          ${isDragging 
            ? 'border-blue-400 bg-blue-500/10 scale-[1.02] shadow-glow' 
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
          id="creative-upload"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleFileInput}
        />

        <div className="text-center px-6 py-12 relative z-10">
          {!selectedFile ? (
            <>
              <div className="mb-6 relative">
                <svg
                  className="mx-auto h-20 w-20 text-muted-foreground group-hover:text-blue-400 transition-colors duration-300"
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
              <p className="text-lg font-medium text-foreground mb-2">
                Drag and drop your creative here
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                or
              </p>
              <label
                htmlFor="creative-upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl cursor-pointer hover:shadow-neon hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Browse Files
              </label>
            </>
          ) : (
            <>
              <div className="mb-6 relative">
                <svg
                  className="mx-auto h-20 w-20 text-green-400 animate-fade-in"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse-glow"></div>
              </div>
              <p className="text-lg font-semibold text-foreground mb-2">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <label
                htmlFor="creative-upload"
                className="text-sm text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors duration-200"
              >
                Change file
              </label>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
