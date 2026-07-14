import React, { useState } from 'react';
import { Artwork } from '../types';
import { FileImage, FileVideo, FileCode, UserRound, Calendar, Download, Trash2, Eye, X, Link2, ExternalLink, Globe2, QrCode } from 'lucide-react';
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
  showPublicToggle?: boolean;
  onTogglePublic?: (artwork: Artwork) => void;
  isPublicUpdating?: boolean;
}

// 根据作品类型返回渐变色（用于没有缩略图时的占位背景）
function getPlaceholderGradient(type: string): string {
  switch (type) {
    case 'html':
      return 'linear-gradient(135deg, #1e3a8a 0%, #6d28d9 50%, #312e81 100%)';
    case 'homepage':
      return 'linear-gradient(135deg, #164e63 0%, #0f766e 50%, #1e3a8a 100%)';
    case 'video':
      return 'linear-gradient(135deg, #14532d 0%, #15803d 50%, #064e3b 100%)';
    case 'image':
      return 'linear-gradient(135deg, #7c2d12 0%, #b91c1c 50%, #7f1d1d 100%)';
    default:
      return 'linear-gradient(135deg, #1f2937 0%, #374151 100%)';
  }
}

// 根据作品类型返回图标
function getTypeIcon(type: string) {
  switch (type) {
    case 'image':
      return FileImage;
    case 'video':
      return FileVideo;
    case 'html':
      return FileCode;
    case 'homepage':
      return UserRound;
    default:
      return FileCode;
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'image':
      return '图片';
    case 'video':
      return '视频';
    case 'html':
      return 'HTML';
    case 'homepage':
      return '个人主页';
    default:
      return type;
  }
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  artwork,
  showStudent = false,
  showActions = true,
  onDelete,
  selectable = false,
  selected = false,
  onSelect,
  showPublicToggle = false,
  onTogglePublic,
  isPublicUpdating = false
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [htmlPreviewError, setHtmlPreviewError] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const Icon = getTypeIcon(artwork.type);

  const handleDownload = async () => {
    try {
      await downloadSingleFile(artwork);
    } catch {
      alert('下载失败，请重试');
    }
  };

  const handlePreview = async () => {
    if (artwork.type === 'html' || artwork.type === 'homepage') {
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

  const isStaticWebsite = artwork.type === 'html' || artwork.type === 'homepage';
  const canShareHtml = isStaticWebsite && !!artwork.shareUrl;

  const handleCopyShareLink = async () => {
    if (!artwork.shareUrl) return;

    try {
      await navigator.clipboard.writeText(artwork.shareUrl);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt('复制失败，请手动复制下方链接：', artwork.shareUrl);
    }
  };

  // 是否展示缩略图图片
  const hasThumbnail = !!artwork.thumbnail && !imageError;
  const canTogglePublic = showPublicToggle && !!onTogglePublic;
  const htmlPreviewUrl = isStaticWebsite ? artwork.shareUrl || artwork.fileData : '';
  const canShowHtmlPreview = isStaticWebsite && !!htmlPreviewUrl && !htmlPreviewError;
  const qrCodeUrl = artwork.shareUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(artwork.shareUrl)}`
    : '';

  return (
    <>
      <div className={`
        flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-950/80 shadow-md shadow-black/30
        transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-950/30
        ${selectable ? 'cursor-pointer' : ''}
        ${selected ? 'ring-2 ring-blue-500' : ''}
      `}
        onClick={() => {
          if (selectable && onSelect) {
            onSelect(artwork);
          }
        }}
      >
        {/* 预览区域：统一使用缩略图 */}
        <div
          className="relative aspect-[4/3] w-full shrink-0 cursor-pointer overflow-hidden"
          style={{ background: hasThumbnail ? '#0f172a' : getPlaceholderGradient(artwork.type) }}
          onClick={handlePreview}
        >
          {hasThumbnail && (
            <img
              src={artwork.thumbnail}
              alt={artwork.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {canShowHtmlPreview && !hasThumbnail && (
            <>
              <iframe
                src={htmlPreviewUrl}
                title={`${artwork.title} 预览`}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
                onError={() => setHtmlPreviewError(true)}
                className="absolute inset-0 h-full w-full border-0 bg-white pointer-events-none"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-10">
                <p className="text-center text-xs font-medium text-white/90">
                  点击打开{artwork.type === 'homepage' ? '个人主页' : ' HTML 作品'}
                </p>
              </div>
            </>
          )}
          {/* 渐变遮罩 + 图标 */}
          {!hasThumbnail && !canShowHtmlPreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              {isStaticWebsite ? (
                <div className="w-4/5 max-w-[220px] overflow-hidden rounded-xl border border-white/20 bg-slate-950/80 shadow-2xl">
                  <div className="flex items-center gap-1 border-b border-white/10 bg-white/10 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span className="h-2 w-2 rounded-full bg-yellow-400" />
                    <span className="h-2 w-2 rounded-full bg-green-400" />
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="h-3 w-2/3 rounded bg-blue-300/70" />
                    <div className="h-2 w-full rounded bg-white/30" />
                    <div className="h-2 w-5/6 rounded bg-white/20" />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="h-8 rounded bg-purple-300/40" />
                      <div className="h-8 rounded bg-cyan-300/40" />
                      <div className="h-8 rounded bg-pink-300/40" />
                    </div>
                  </div>
                  <div className="border-t border-white/10 px-3 py-2 text-center text-xs text-blue-100">
                    点击预览{artwork.type === 'homepage' ? '个人主页' : ' HTML 作品'}
                  </div>
                </div>
              ) : (
                <>
                  <Icon className="w-16 h-16 opacity-70 mb-2" />
                  <p className="text-sm opacity-80">
                    {artwork.type === 'video' ? '点击播放视频' : '点击查看大图'}
                  </p>
                </>
              )}
            </div>
          )}

          {/* 类型标签 */}
          <div className="absolute left-2 top-2 flex items-center space-x-1 rounded-lg border border-white/10 bg-black/70 px-2 py-1 backdrop-blur-sm text-white">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium">{getTypeLabel(artwork.type)}</span>
          </div>

          {/* 公开标签 */}
          {artwork.isPublic && (
            <div className={`absolute top-2 flex items-center space-x-1 rounded-lg border border-cyan-400/30 bg-cyan-500/20 px-2 py-1 backdrop-blur-sm text-cyan-100 ${selectable ? 'right-10' : 'right-2'}`}>
              <Link2 className="w-3 h-3" />
              <span className="text-xs font-medium">已公开</span>
            </div>
          )}

          {/* 选中标记 */}
          {selectable && (
            <div className={`
              absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center
              transition-all bg-black/70
              ${selected ? 'bg-blue-600 border-blue-600' : 'border-slate-500'}
            `}>
              {selected && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          )}

          {/* 底部渐变遮罩，让标题可读 */}
          {hasThumbnail && (
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          )}
        </div>

        {/* 内容区域 */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-1 line-clamp-2 min-h-12 font-semibold leading-6 text-white">
            {artwork.title}
          </h3>
          
          {showStudent && (
            <p className="mb-1 truncate text-sm text-slate-300">
              作者：{artwork.studentName}
            </p>
          )}
          
          {artwork.description && (
            <p className="mb-2 line-clamp-1 text-sm text-slate-400">
              {artwork.description}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(artwork.createdAt).toLocaleDateString()}</span>
            </div>
            <span>{formatFileSize(artwork.fileSize)}</span>
          </div>

          {/* 操作按钮 */}
          {showActions && (
            <div className="mt-4 border-t border-white/10 pt-3">
              {canTogglePublic && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePublic(artwork);
                  }}
                  disabled={isPublicUpdating}
                  className={`mb-2 flex w-full items-center justify-center space-x-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    artwork.isPublic
                      ? 'border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                      : 'border border-amber-500/30 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20'
                  }`}
                >
                  <Globe2 className="w-4 h-4" />
                  <span>
                    {isPublicUpdating
                      ? '更新中...'
                      : artwork.isPublic
                        ? '取消广场展示'
                        : '推送到作品广场'}
                  </span>
                </button>
              )}
              <div className="grid grid-cols-5 gap-1" role="toolbar" aria-label="作品操作">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreview();
                  }}
                  type="button"
                  title="预览作品"
                  aria-label="预览作品"
                  className="group relative flex h-10 items-center justify-center rounded-md text-blue-300 transition-colors hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  <Eye className="w-4 h-4" />
                  <span className="sr-only">预览作品</span>
                  <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">预览</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload();
                  }}
                  type="button"
                  title="下载作品"
                  aria-label="下载作品"
                  className="group relative flex h-10 items-center justify-center rounded-md text-green-300 transition-colors hover:bg-green-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                >
                  <Download className="w-4 h-4" />
                  <span className="sr-only">下载作品</span>
                  <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">下载</span>
                </button>
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleCopyShareLink();
                    }}
                    type="button"
                    title={canShareHtml ? '复制访问链接' : '此作品没有访问链接'}
                    aria-label={canShareHtml ? '复制访问链接' : '此作品没有访问链接'}
                    disabled={!canShareHtml}
                    className="group relative flex h-10 items-center justify-center rounded-md text-cyan-300 transition-colors hover:bg-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
                  >
                    <Link2 className="w-4 h-4" />
                    <span className="sr-only">{linkCopied ? '链接已复制' : '复制访问链接'}</span>
                    <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">{linkCopied ? '已复制' : '复制链接'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (artwork.shareUrl) {
                        window.open(artwork.shareUrl, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    type="button"
                    title={canShareHtml ? '在新窗口打开' : '此作品没有访问链接'}
                    aria-label={canShareHtml ? '在新窗口打开' : '此作品没有访问链接'}
                    disabled={!canShareHtml}
                    className="group relative flex h-10 items-center justify-center rounded-md text-indigo-300 transition-colors hover:bg-indigo-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="sr-only">在新窗口打开</span>
                    <span className="pointer-events-none absolute -top-9 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">打开链接</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQrCode(true);
                    }}
                    type="button"
                    title={canShareHtml ? '查看访问二维码' : '此作品没有访问链接'}
                    aria-label={canShareHtml ? '查看访问二维码' : '此作品没有访问链接'}
                    disabled={!canShareHtml}
                    className="group relative flex h-10 items-center justify-center rounded-md text-purple-300 transition-colors hover:bg-purple-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
                  >
                    <QrCode className="w-4 h-4" />
                    <span className="sr-only">查看访问二维码</span>
                    <span className="pointer-events-none absolute -top-9 right-0 z-20 hidden whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block group-focus-visible:block">二维码</span>
                  </button>
              </div>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  type="button"
                  className="mt-2 flex w-full items-center justify-center space-x-1 rounded-md px-3 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>删除作品</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 预览模态框 */}
      {showPreview && !isStaticWebsite && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="relative max-w-5xl max-h-full"
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

      {showQrCode && canShareHtml && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowQrCode(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-white/10 bg-slate-950 p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">作品访问二维码</h3>
              <button
                onClick={() => setShowQrCode(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mx-auto mb-4 flex h-60 w-60 items-center justify-center rounded-xl bg-white p-4">
              <img
                src={qrCodeUrl}
                alt={`${artwork.title} 二维码`}
                className="h-full w-full"
              />
            </div>
            <p className="mb-4 break-all text-xs text-slate-300">{artwork.shareUrl}</p>
            <button
              onClick={() => {
                if (artwork.shareUrl) {
                  void navigator.clipboard.writeText(artwork.shareUrl);
                  setLinkCopied(true);
                  window.setTimeout(() => setLinkCopied(false), 2000);
                }
              }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {linkCopied ? '链接已复制' : '复制访问链接'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
