'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  label: string;
  onChange: (file: File | null) => void;
  value?: File | string | null;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
}

export function ImageUpload({
  label,
  onChange,
  value,
  accept = 'image/png, image/jpeg, image/webp',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
    } else {
      setPreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [value]);

  const handleFile = (file: File) => {
    setError(null);

    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      setError('Invalid file type. Only PNG, JPG, and WebP are allowed.');
      return;
    }

    if (file.size > maxSize) {
      setError(`File size too large. Max size is ${maxSize / 1024 / 1024}MB.`);
      return;
    }

    onChange(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}
          ${preview ? 'h-64' : 'h-32'}
          flex flex-col items-center justify-center
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain rounded-md"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP up to {maxSize / 1024 / 1024}MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
