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

  const handleDownload = async () => {
    try {
      await downloadSingleFile(artwork);
    } catch (error) {
      alert('下载失败，请重试');
    }
  };

  const handlePreview = async () => {
    if (artwork.type === 'html') {
      await previewHtmlWork(artwork);
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
        overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 shadow-md shadow-black/30
        transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-950/30
        ${selectable ? 'cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-blue-500' : ''}
      `}>
        {/* 预览区域 */}
        <div 
          className="relative h-48 cursor-pointer bg-slate-900"
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
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-purple-950">
              <div className="text-center">
                <FileCode className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-slate-200">HTML作品</p>
                <p className="text-xs text-slate-400">点击预览</p>
              </div>
            </div>
          )}

          {/* 类型标签 */}
          <div className="absolute left-2 top-2 flex items-center space-x-1 rounded-lg border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-sm">
            <Icon className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-slate-100">{typeLabels[artwork.type]}</span>
          </div>

          {/* 选中标记 */}
          {selectable && (
            <div className={`
              absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all
              ${selected 
                ? 'bg-blue-600 border-blue-600' 
                : 'border-slate-500 bg-black/70'
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
          <h3 className="mb-2 line-clamp-2 font-semibold text-white">
            {artwork.title}
          </h3>
          
          {showStudent && (
            <p className="mb-2 text-sm text-slate-300">
              学生：{artwork.studentName}
            </p>
          )}
          
          {artwork.description && (
            <p className="mb-3 line-clamp-2 text-sm text-slate-400">
              {artwork.description}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
            </div>
            <span>{formatFileSize(artwork.fileSize)}</span>
          </div>

          {/* 操作按钮 */}
          {showActions && (
            <div className="mt-4 flex items-center space-x-2 border-t border-white/10 pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview();
                }}
                className="flex-1 flex items-center justify-center space-x-1 rounded-lg px-3 py-1.5 text-sm text-blue-300 transition-colors hover:bg-blue-500/10"
              >
                <Eye className="w-4 h-4" />
                <span>预览</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="flex-1 flex items-center justify-center space-x-1 rounded-lg px-3 py-1.5 text-sm text-green-300 transition-colors hover:bg-green-500/10"
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
                  className="flex-1 flex items-center justify-center space-x-1 rounded-lg px-3 py-1.5 text-sm text-red-300 transition-colors hover:bg-red-500/10"
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
