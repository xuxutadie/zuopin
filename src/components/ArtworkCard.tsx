import React, { useState } from 'react';
import { Artwork } from '../types';
import { FileImage, FileVideo, FileCode, Calendar, Download, Trash2, Eye, X } from 'lucide-react';
import { formatFileSize } from '../utils/fileHelper';
import { downloadSingleFile, previewHtmlWork } from '../utils/downloadHelper';

interface ArtworkCardProps {
  artwork: Artwork;
  showStudent?: boolean;
  showActions?: boolean;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (artwork: Artwork) => void;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  showStudent = false,
  showActions = true,
  onDelete,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const typeIcons = {
    image: FileImage,
    video: FileVideo,
    html: FileCode
  };

  const typeLabels = {
    image: '图片',
    video: '视频',
    html: 'HTML'
  };

  const Icon = typeIcons[artwork.type];

  const handleDownload = () => {
    downloadSingleFile(artwork);
  };

  const handlePreview = () => {
    if (artwork.type === 'html') {
      previewHtmlWork(artwork);
    } else {
      setShowPreview(true);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm('确定要删除这个作品吗？')) {
      onDelete(artwork.id);
    }
  };

  return (
    <>
      <div className={`
        bg-white rounded-xl shadow-md overflow-hidden
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${selectable ? 'cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-blue-500' : ''}
      `}>
        {/* 预览区域 */}
        <div 
          className="relative h-48 bg-gray-100 cursor-pointer"
          onClick={handlePreview}
        >
          {artwork.type === 'image' && (
            <img
              src={artwork.thumbnail || artwork.fileData}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          )}
          {artwork.type === 'video' && (
            <video
              src={artwork.fileData}
              className="w-full h-full object-cover"
            />
          )}
          {artwork.type === 'html' && (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center">
                <FileCode className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">HTML作品</p>
                <p className="text-xs text-gray-500">点击预览</p>
              </div>
            </div>
          )}

          {/* 类型标签 */}
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <Icon className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">{typeLabels[artwork.type]}</span>
          </div>

          {/* 选中标记 */}
          {selectable && (
            <div className={`
              absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all
              ${selected 
                ? 'bg-blue-600 border-blue-600' 
                : 'bg-white/90 border-gray-300'
              }
            `}>
              {selected && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
            {artwork.title}
          </h3>
          
          {showStudent && (
            <p className="text-sm text-gray-600 mb-2">
              学生：{artwork.studentName}
            </p>
          )}
          
          {artwork.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {artwork.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
            </div>
            <span>{formatFileSize(artwork.fileSize)}</span>
          </div>

          {/* 操作按钮 */}
          {showActions && (
            <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview();
                }}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>预览</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>下载</span>
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 预览模态框 */}
      {showPreview && artwork.type !== 'html' && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="relative max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            {artwork.type === 'image' && (
              <img
                src={artwork.fileData}
                alt={artwork.title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
            )}
            {artwork.type === 'video' && (
              <video
                src={artwork.fileData}
                controls
                autoPlay
                className="max-w-full max-h-[90vh] rounded-lg"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
