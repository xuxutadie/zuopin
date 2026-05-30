import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, CardTitle } from '../components/Card';
import { Input, Textarea } from '../components/Input';
import { FileUpload } from '../components/FileUpload';
import { useAuthStore } from '../stores/authStore';
import { useArtworkStore } from '../stores/artworkStore';
import { ArrowLeft, FileImage, FileVideo, FileCode, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const SubmitWork: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { submitArtwork } = useArtworkStore();
  
  const [workType, setWorkType] = useState<'image' | 'video' | 'html'>('image');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
        file
      );
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/student/works');
        }, 2000);
      } else {
        setError(result.error || '提交失败，请重试');
      }
    } catch (err) {
      setError('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'image', label: '图片作品', icon: FileImage, color: 'blue' },
    { value: 'video', label: '视频作品', icon: FileVideo, color: 'green' },
    { value: 'html', label: '网页作品', icon: FileCode, color: 'purple' }
  ] as const;

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 text-center">
          <div className="py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">提交成功！</h2>
            <p className="text-gray-600 mb-6">你的作品已成功提交，正在跳转...</p>
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* 返回按钮 */}
          <button
            onClick={() => navigate('/student')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回控制台</span>
          </button>

          <Card>
            <CardTitle className="mb-6">提交新作品</CardTitle>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 作品类型选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  选择作品类型
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {typeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setWorkType(option.value);
                          setFile(null);
                        }}
                        className={clsx(
                          'p-4 rounded-lg border-2 transition-all',
                          'flex flex-col items-center space-y-2',
                          workType === option.value
                            ? `border-${option.color}-500 bg-${option.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <Icon className={clsx(
                          'w-8 h-8',
                          workType === option.value 
                            ? `text-${option.color}-600` 
                            : 'text-gray-400'
                        )} />
                        <span className={clsx(
                          'text-sm font-medium',
                          workType === option.value
                            ? `text-${option.color}-700`
                            : 'text-gray-600'
                        )}>
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 文件上传 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  上传作品文件
                </label>
                <FileUpload
                  type={workType}
                  file={file}
                  onFileSelect={setFile}
                  onFileRemove={() => setFile(null)}
                />
              </div>

              {/* 作品名称 */}
              <Input
                label="作品名称"
                placeholder="给你的作品起个名字"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              {/* 作品描述 */}
              <Textarea
                label="作品描述（可选）"
                placeholder="简单描述一下你的作品"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />

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
                  className="flex-1"
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
