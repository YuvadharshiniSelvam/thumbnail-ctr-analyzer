import React, { useRef, useState } from 'react';

export default function UploadBox({ onUpload, isUploading, previewImage }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ease-out flex flex-col items-center justify-center min-h-[300px] cursor-pointer group ${
        isDragging 
          ? 'border-brand-blue bg-brand-blue/10 scale-[1.02] shadow-[0_0_30px_rgba(45,107,255,0.2)]' 
          : 'border-white/20 bg-brand-dark/30 hover:border-brand-blue/50 hover:bg-brand-blue/5'
      } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/*"
        className="hidden"
      />

      {previewImage ? (
        <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-brand-blue/50 transition-all">
          <img 
            src={previewImage} 
            alt="Thumbnail preview" 
            className="w-full h-full object-contain bg-black/50 backdrop-blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
             <span className="text-white font-display text-sm tracking-widest uppercase bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md">Click to change image</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6 transform group-hover:-translate-y-1 transition-transform">
          <div className="w-20 h-20 mx-auto bg-brand-card rounded-full flex items-center justify-center shadow-lg ring-1 ring-white/5 group-hover:ring-brand-blue/30 group-hover:shadow-[0_0_20px_rgba(45,107,255,0.2)] transition-all">
            <svg className="w-8 h-8 text-brand-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-display uppercase tracking-widest text-white mb-2">
              Drag & Drop Thumbnail
            </p>
            <p className="text-sm font-light text-gray-400 max-w-sm mx-auto">
              Supports JPG, PNG formats up to 5MB. Or click to browse your files.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
