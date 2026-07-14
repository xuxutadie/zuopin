import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, CardTitle, CardContent } from '../components/Card';
import { useAuthStore } from '../stores/authStore';
import { useArtworkStore } from '../stores/artworkStore';
import { FolderOpen, Users, FileImage, Download, Trash2, Clock } from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { artworks, students, fetchAllArtworks, fetchStudents, deleteStudent } = useArtworkStore();

  useEffect(() => {
    fetchAllArtworks();
    fetchStudents();
  }, [fetchAllArtworks, fetchStudents]);
  
  const stats = {
    totalStudents: students.length,
    totalWorks: artworks.length,
    images: artworks.filter(w => w.type === 'image').length,
    videos: artworks.filter(w => w.type === 'video').length,
    htmls: artworks.filter(w => w.type === 'html').length,
    homepages: artworks.filter(w => w.type === 'homepage').length
  };
  const lightCardClassName = '!border-slate-200 !bg-white !text-slate-900 shadow-lg shadow-black/20';

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    const confirmed = window.confirm(
      `确定删除学生「${studentName}」吗？\n\n删除后将同时移除该学生账号、所有作品记录和上传文件，且无法恢复。`
    );
    if (!confirmed) return;

    const result = await deleteStudent(studentId);
    if (!result.success) {
      alert(result.error || '删除学生失败，请重试');
      return;
    }

    await fetchAllArtworks();
  };

  const formatDate = (dateValue: string | null) => {
    if (!dateValue) return '暂无';
    return new Date(dateValue).toLocaleString();
  };

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
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
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
            <Card className={`${lightCardClassName} text-center`}>
              <div className="mb-1 text-3xl font-bold text-cyan-600">
                {stats.homepages}
              </div>
              <div className="text-sm font-medium text-slate-600">个人主页</div>
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

          {/* 注册学生明细 */}
          <Card className={`${lightCardClassName} mb-8`}>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-slate-900">注册学生明细</CardTitle>
                <CardContent className="mt-1 text-slate-600">
                  <p className="text-sm">查看已注册学生、作品数量和最近提交情况</p>
                </CardContent>
              </div>
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                共 {students.length} 位注册学生
              </div>
            </div>

            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-4 font-semibold">学生姓名</th>
                      <th className="py-3 pr-4 font-semibold">注册时间</th>
                      <th className="py-3 pr-4 font-semibold">作品统计</th>
                      <th className="py-3 pr-4 font-semibold">广场展示</th>
                      <th className="py-3 pr-4 font-semibold">最近提交</th>
                      <th className="py-3 text-right font-semibold">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="border-b border-slate-100 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-400">ID: {student.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {formatDate(student.createdAt)}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">共 {student.workCount} 个</div>
                          <div className="mt-1 text-xs text-slate-500">
                            图片 {student.imageCount} / 视频 {student.videoCount} / HTML {student.htmlCount} / 主页 {student.homepageCount}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          {student.publicWorkCount} 个
                        </td>
                        <td className="py-3 pr-4 text-slate-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span>{formatDate(student.lastSubmittedAt)}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除注册者
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                <p className="font-medium text-slate-700">暂无注册学生</p>
                <p className="mt-1 text-sm text-slate-500">学生注册后会显示在这里</p>
              </div>
            )}
          </Card>

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
