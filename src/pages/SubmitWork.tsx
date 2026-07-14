import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, CardTitle } from '../components/Card';
import { Input, Textarea } from '../components/Input';
import { FileUpload } from '../components/FileUpload';
import { useAuthStore } from '../stores/authStore';
import { useArtworkStore } from '../stores/artworkStore';
import { validateFileSize, validateFileType } from '../utils/fileHelper';
import { ArrowLeft, FileImage, FileVideo, FileCode, UserRound, CheckCircle, Link2, ExternalLink, Upload, X, Sparkles, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { ArtworkType } from '../types';

// 判断文件是否为图片（用于缩略图验证）
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true;
  const lower = file.name.toLowerCase();
  return /\.(png|jpg|jpeg|gif|webp|bmp)$/.test(lower);
}

export const SubmitWork: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { submitArtwork } = useArtworkStore();
  
  const [workType, setWorkType] = useState<ArtworkType>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string>('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileError, setFileError] = useState('');
  const [thumbError, setThumbError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError('');
    setFileError('');

    if (!validateFileType(selectedFile, workType)) {
      setFileError(
        workType === 'html'
          ? '网页作品仅支持 .html、.htm 或 ZIP 压缩包'
          : workType === 'homepage'
            ? '个人主页仅支持 ZIP 压缩包'
            : '所选文件类型与当前作品类型不匹配'
      );
      return;
    }

    if (!validateFileSize(selectedFile, workType)) {
      setFileError(
        workType === 'image'
          ? '图片大小不能超过 10MB'
          : workType === 'video'
            ? '视频大小不能超过 50MB'
            : workType === 'homepage'
              ? '个人主页 ZIP 不能超过 100MB'
              : '网页作品文件大小不能超过 20MB'
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThumbError('');
    const f = e.target.files?.[0];
    if (!f) return;

    if (!isImageFile(f)) {
      setThumbError('封面缩略图仅支持 PNG / JPG / GIF / WebP 图片');
      return;
    }

    // 限制缩略图大小 <= 5MB
    if (f.size > 5 * 1024 * 1024) {
      setThumbError('封面缩略图不能超过 5MB');
      return;
    }

    // 清理旧的预览 URL
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }

    setThumbnailFile(f);
    setThumbnailPreviewUrl(URL.createObjectURL(f));
  };

  const removeThumbnail = () => {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }
    setThumbnailFile(null);
    setThumbnailPreviewUrl('');
    setThumbError('');
    if (thumbInputRef.current) {
      thumbInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!file) {
      setError('请选择要上传的文件');
      return;
    }
    
    if (!title.trim()) {
      setError('请输入作品名称');
      return;
    }
    
    if (!currentUser) {
      setError('请先登录');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitArtwork(
        currentUser,
        title.trim(),
        description.trim(),
        workType,
        file,
        {
          thumbnail: thumbnailFile,
          isPublic
        }
      );
      
      if (result.success) {
        setShareUrl(result.artwork?.shareUrl || '');
        setSuccess(true);
        setTimeout(() => {
          navigate('/student/works');
        }, result.artwork?.shareUrl ? 5000 : 2500);
      } else {
        setError(result.error || '提交失败，请重试');
      }
    } catch {
      setError('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    {
      value: 'image',
      label: '图片作品',
      icon: FileImage,
      activeClassName: 'border-blue-500 bg-blue-50',
      activeIconClassName: 'text-blue-600',
      activeTextClassName: 'text-blue-700'
    },
    {
      value: 'video',
      label: '视频作品',
      icon: FileVideo,
      activeClassName: 'border-green-500 bg-green-50',
      activeIconClassName: 'text-green-600',
      activeTextClassName: 'text-green-700'
    },
    {
      value: 'html',
      label: '网页作品',
      icon: FileCode,
      activeClassName: 'border-purple-500 bg-purple-50',
      activeIconClassName: 'text-purple-600',
      activeTextClassName: 'text-purple-700'
    },
    {
      value: 'homepage',
      label: '个人主页',
      icon: UserRound,
      activeClassName: 'border-cyan-500 bg-cyan-50',
      activeIconClassName: 'text-cyan-600',
      activeTextClassName: 'text-cyan-700'
    }
  ] as const;
  const lightCardClassName = '!border-slate-200 !bg-white !text-slate-900 shadow-lg shadow-black/20';
  const lightInputClassName = '!border-slate-300 !bg-white !text-slate-900 placeholder:!text-slate-400';
  const lightLabelClassName = 'text-slate-700';

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('复制失败，请手动复制下方链接：', shareUrl);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className={`max-w-md w-full mx-4 text-center ${lightCardClassName}`}>
          <div className="py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-slate-900">提交成功！</h2>
            <p className="mb-4 text-slate-600">
              你的作品已成功提交{isPublic && '，并已展示在作品广场中'}，正在跳转...
            </p>
            {shareUrl && (
              <div className="mb-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-left">
                <p className="text-sm font-semibold text-slate-900">已生成公开分享链接</p>
                <p className="mt-2 break-all text-sm text-slate-600">{shareUrl}</p>
                <div className="mt-3 flex space-x-3">
                  <Button
                    type="button"
                    onClick={() => {
                      void handleCopyShareLink();
                    }}
                    className="flex-1"
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    {copied ? '已复制链接' : '复制链接'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => window.open(shareUrl, '_blank', 'noopener,noreferrer')}
                    className="flex-1 border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    打开链接
                  </Button>
                </div>
              </div>
            )}
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/student')}
            className="mb-6 flex items-center space-x-2 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回控制台</span>
          </button>

          <Card className={lightCardClassName}>
            <CardTitle className="mb-6 text-slate-900">提交新作品</CardTitle>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 作品类型选择 */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  选择作品类型
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {typeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setWorkType(option.value);
                          setFile(null);
                          setError('');
                          setFileError('');
                        }}
                        className={clsx(
                          'p-4 rounded-lg border-2 transition-all',
                          'flex flex-col items-center space-y-2',
                          workType === option.value
                            ? option.activeClassName
                            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
                        )}
                      >
                        <Icon className={clsx(
                          'w-8 h-8',
                          workType === option.value 
                            ? option.activeIconClassName
                            : 'text-slate-500'
                        )} />
                        <span className={clsx(
                          'text-sm font-medium',
                          workType === option.value
                            ? option.activeTextClassName
                            : 'text-slate-700'
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 主作品文件上传 */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  上传作品文件
                </label>
                <FileUpload
                  type={workType}
                  file={file}
                  onFileSelect={handleFileSelect}
                  onFileRemove={() => {
                    setFile(null);
                    setFileError('');
                  }}
                  error={fileError}
                  variant="light"
                />
                {workType === 'html' && (
                  <p className="mt-2 text-sm text-slate-600">
                    可上传单个 `.html` / `.htm` 网页文件，或包含完整网页资源的 ZIP 压缩包。
                  </p>
                )}
                {workType === 'homepage' && (
                  <p className="mt-2 text-sm text-slate-600">
                    请将包含 `index.html`、样式、脚本、图片和视频等完整资源的个人网站压缩为 ZIP。
                  </p>
                )}
              </div>

              {/* 封面缩略图上传（网页/视频类型使用，图片类型可直接使用作品本身） */}
              {workType !== 'image' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    <Sparkles className="inline w-4 h-4 mr-1 text-amber-500" />
                    封面缩略图（可选，将在作品广场中展示）
                  </label>
                  {!thumbnailPreviewUrl ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <Upload className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600">点击上传封面图片</p>
                      <p className="text-xs text-slate-400 mt-1">支持 PNG / JPG / GIF / WebP，不超过 5MB</p>
                      <input
                        ref={thumbInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        onChange={handleThumbnailSelect}
                      />
                    </label>
                  ) : (
                    <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img
                        src={thumbnailPreviewUrl}
                        alt="缩略图预览"
                        className="w-full h-48 object-contain bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={removeThumbnail}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="p-2 text-xs text-slate-600 bg-white">
                        <p>已选择：{thumbnailFile?.name}</p>
                      </div>
                    </div>
                  )}
                  {thumbError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{thumbError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 作品名称 */}
              <Input
                label="作品名称"
                placeholder="给你的作品起个名字"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                labelClassName={lightLabelClassName}
                className={lightInputClassName}
                required
              />

              {/* 作品描述 */}
              <Textarea
                label="作品描述（可选）"
                placeholder="简单描述一下你的作品"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                labelClassName={lightLabelClassName}
                className={lightInputClassName}
                rows={4}
              />

              {/* 是否公开到作品广场 */}
              <div className="border-t border-slate-200 pt-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  <Globe className="inline w-4 h-4 mr-1 text-blue-500" />
                  作品展示设置
                </label>
                <button
                  type="button"
                  onClick={() => setIsPublic(!isPublic)}
                  className={clsx(
                    'w-full p-4 rounded-lg border-2 transition-all text-left',
                    'flex items-center justify-between',
                    isPublic
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  )}
                >
                  <div>
                    <p className={clsx(
                      'text-sm font-medium',
                      isPublic ? 'text-blue-700' : 'text-slate-700'
                    )}>
                      公开到作品广场
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isPublic
                        ? '其他人可以在作品广场浏览并欣赏你的作品'
                        : '只有你自己和老师可以查看此作品'}
                    </p>
                  </div>
                  {/* 自定义开关样式 */}
                  <div
                    className={clsx(
                      'w-11 h-6 rounded-full transition-colors flex items-center',
                      isPublic ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                    )}
                  >
                    <span className="w-5 h-5 bg-white rounded-full shadow mx-0.5" />
                  </div>
                </button>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* 提交按钮 */}
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/student')}
                  className="flex-1 border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="flex-1"
                >
                  提交作品
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
