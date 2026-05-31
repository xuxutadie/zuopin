import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, CardTitle, CardContent } from '../components/Card';
import { useAuthStore } from '../stores/authStore';
import { useArtworkStore } from '../stores/artworkStore';
import { FileImage, FileVideo, FileCode, Upload, FolderOpen } from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getStudentWorks } = useArtworkStore();
  
  const myWorks = currentUser ? getStudentWorks(currentUser.id) : [];
  
  const workStats = {
    total: myWorks.length,
    images: myWorks.filter(w => w.type === 'image').length,
    videos: myWorks.filter(w => w.type === 'video').length,
    htmls: myWorks.filter(w => w.type === 'html').length
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* 欢迎信息 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              你好，{currentUser?.name}！
            </h1>
            <p className="text-slate-300">
              欢迎来到学生控制台，开始你的创作之旅吧 🎨
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {workStats.total}
              </div>
              <div className="text-sm text-slate-400">我的作品</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {workStats.images}
              </div>
              <div className="text-sm text-slate-400">图片作品</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {workStats.videos}
              </div>
              <div className="text-sm text-slate-400">视频作品</div>
            </Card>
            <Card className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {workStats.htmls}
              </div>
              <div className="text-sm text-slate-400">网页作品</div>
            </Card>
          </div>

          {/* 快速操作 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card hover className="cursor-pointer">
              <Link to="/student/submit">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>提交新作品</CardTitle>
                    <CardContent>
                      <p className="text-sm">上传你的AI创作成果</p>
                    </CardContent>
                  </div>
                  <Button>立即提交</Button>
                </div>
              </Link>
            </Card>

            <Card hover className="cursor-pointer">
              <Link to="/student/works">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>我的作品</CardTitle>
                    <CardContent>
                      <p className="text-sm">查看已提交的所有作品</p>
                    </CardContent>
                  </div>
                  <Button variant="secondary">查看作品</Button>
                </div>
              </Link>
            </Card>
          </div>

          {/* 功能介绍 */}
          <Card>
            <CardTitle className="mb-4">支持的作品类型</CardTitle>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border border-blue-400/20 bg-blue-500/10 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-slate-100">图片作品</span>
                </div>
                <p className="text-sm text-slate-400">
                  JPG、PNG、GIF、WebP 格式，最大 10MB
                </p>
              </div>
              <div className="rounded-lg border border-green-400/20 bg-green-500/10 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileVideo className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-slate-100">视频作品</span>
                </div>
                <p className="text-sm text-slate-400">
                  MP4、WebM 格式，最大 50MB
                </p>
              </div>
              <div className="rounded-lg border border-purple-400/20 bg-purple-500/10 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileCode className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-slate-100">HTML作品</span>
                </div>
                <p className="text-sm text-slate-400">
                  HTML 或 ZIP 格式，最大 20MB
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};
