import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, CardTitle, CardContent } from '../components/Card';
import { useAuthStore } from '../stores/authStore';
import { useArtworkStore } from '../stores/artworkStore';
import { FolderOpen, Users, FileImage, FileVideo, FileCode, Download } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { artworks, fetchAllArtworks } = useArtworkStore();

  useEffect(() => {
    fetchAllArtworks();
  }, [fetchAllArtworks]);
  
  const stats = {
    totalStudents: new Set(artworks.map(a => a.studentId)).size,
    totalWorks: artworks.length,
    images: artworks.filter(w => w.type === 'image').length,
    videos: artworks.filter(w => w.type === 'video').length,
    htmls: artworks.filter(w => w.type === 'html').length
  };
  const lightCardClassName = '!border-slate-200 !bg-white !text-slate-900 shadow-lg shadow-black/20';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* 欢迎信息 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              老师控制台
            </h1>
            <p className="text-slate-300">
              欢迎，{currentUser?.name}！在这里管理所有学生的作品 👋
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className={`${lightCardClassName} text-center`}>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {stats.totalStudents}
              </div>
              <div className="text-sm font-medium text-slate-600">学生数量</div>
            </Card>
            <Card className={`${lightCardClassName} text-center`}>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {stats.totalWorks}
              </div>
              <div className="text-sm font-medium text-slate-600">作品总数</div>
            </Card>
            <Card className={`${lightCardClassName} text-center`}>
              <div className="text-3xl font-bold text-blue-500 mb-1">
                {stats.images}
              </div>
              <div className="text-sm font-medium text-slate-600">图片作品</div>
            </Card>
            <Card className={`${lightCardClassName} text-center`}>
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {stats.videos}
              </div>
              <div className="text-sm font-medium text-slate-600">视频作品</div>
            </Card>
            <Card className={`${lightCardClassName} text-center`}>
              <div className="text-3xl font-bold text-orange-500 mb-1">
                {stats.htmls}
              </div>
              <div className="text-sm font-medium text-slate-600">网页作品</div>
            </Card>
          </div>

          {/* 快速操作 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card hover className={`${lightCardClassName} cursor-pointer`}>
              <Link to="/teacher/works">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-slate-900">作品总览</CardTitle>
                    <CardContent className="text-slate-600">
                      <p className="text-sm">查看和管理所有学生提交的作品</p>
                    </CardContent>
                  </div>
                  <Button>查看作品</Button>
                </div>
              </Link>
            </Card>

            <Card className={lightCardClassName}>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-slate-900">学生管理</CardTitle>
                  <CardContent className="text-slate-600">
                    <p className="text-sm">已收集 {stats.totalStudents} 位学生的作品</p>
                  </CardContent>
                </div>
              </div>
            </Card>
          </div>

          {/* 功能说明 */}
          <Card className={lightCardClassName}>
            <CardTitle className="mb-4 text-slate-900">老师功能说明</CardTitle>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FileImage className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-900">查看作品</span>
                </div>
                <p className="text-sm text-slate-600">
                  在作品总览页面查看所有学生提交的作品
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-slate-900">下载作品</span>
                </div>
                <p className="text-sm text-slate-600">
                  支持单个下载或批量打包下载作品
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
