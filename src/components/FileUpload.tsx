import React, { useCallback } from 'react';
import { Upload, X, FileImage, FileVideo, FileCode } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadProps {
  type: 'image' | 'video' | 'html';
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  error?: string;
  variant?: 'dark' | 'light';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type,
  file,
  onFileSelect,
  onFileRemove,
  error,
  variant = 'dark'
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const isLight = variant === 'light';

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
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }, [onFileSelect]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const acceptTypes = {
    image: 'image/jpeg,image/png,image/gif,image/webp',
    video: 'video/mp4,video/webm',
    html: '.html,.htm,.zip,text/html,application/zip,application/x-zip-compressed'
  };

  const typeLabels = {
    image: '图片',
    video: '视频',
    html: 'HTML'
  };

  const typeIcons = {
    image: FileImage,
    video: FileVideo,
    html: FileCode
  };

  const Icon = typeIcons[type];

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={clsx(
            'border-2 border-dashed rounded-xl p-8 text-center',
            'transition-all duration-200 cursor-pointer',
            isDragging 
              ? 'border-blue-500 bg-blue-500/10'
              : isLight
                ? 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                : 'border-white/15 bg-black/30 hover:border-blue-400 hover:bg-white/5',
            error && 'border-red-500'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById(`file-input-${type}`)?.click()}
        >
          <input
            id={`file-input-${type}`}
            type="file"
            accept={acceptTypes[type]}
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center space-y-3">
            <div className={clsx(
              'w-16 h-16 rounded-full flex items-center justify-center',
              'bg-blue-100 text-blue-600'
            )}>
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className={clsx('font-medium', isLight ? 'text-slate-900' : 'text-slate-100')}>
                点击上传或拖拽{typeLabels[type]}文件
              </p>
              <p className={clsx('mt-1 text-sm', isLight ? 'text-slate-600' : 'text-slate-400')}>
                {type === 'image' && '支持 JPG、PNG、GIF、WebP 格式，最大 10MB'}
                {type === 'video' && '支持 MP4、WebM 格式，最大 50MB'}
                {type === 'html' && '支持单个 HTML 文件，或包含 index.html 的静态网站 ZIP 包，最大 20MB'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className={clsx(
          'rounded-xl border p-4',
          isLight ? 'border-slate-300 bg-slate-50' : 'border-white/15 bg-black/30'
        )}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={clsx('truncate text-sm font-medium', isLight ? 'text-slate-900' : 'text-slate-100')}>
                {file.name}
              </p>
              <p className={clsx('text-xs', isLight ? 'text-slate-600' : 'text-slate-400')}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className={clsx(
                'p-2 transition-colors hover:text-red-500',
                isLight ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
