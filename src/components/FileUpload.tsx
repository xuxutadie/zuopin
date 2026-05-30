import React, { useCallback } from 'react';
import { Upload, X, FileImage, FileVideo, FileCode } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadProps {
  type: 'image' | 'video' | 'html';
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  type,
  file,
  onFileSelect,
  onFileRemove,
  error
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

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
    html: 'text/html,application/zip'
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
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
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
              <p className="text-gray-700 font-medium">
                点击上传或拖拽{typeLabels[type]}文件
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {type === 'image' && '支持 JPG、PNG、GIF、WebP 格式，最大 10MB'}
                {type === 'video' && '支持 MP4、WebM 格式，最大 50MB'}
                {type === 'html' && '支持 HTML 或 ZIP 压缩包，最大 20MB'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-gray-300 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
