import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { ArtworkCard } from '../components/ArtworkCard';
import { useArtworkStore } from '../stores/artworkStore';
import { ArrowLeft, Plus, FolderOpen } from 'lucide-react';

export const MyWorks: React.FC = () => {
  const navigate = useNavigate();
  const { myWorks, fetchMyWorks, deleteArtwork, isLoading } = useArtworkStore();
  
  useEffect(() => {
    fetchMyWorks();
  }, [fetchMyWorks]);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate('/student')}
                className="mb-2 flex items-center space-x-2 text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回控制台</span>
              </button>
              <h1 className="text-3xl font-bold text-white">
                我的作品
              </h1>
              <p className="mt-1 text-slate-300">
                共 {myWorks.length} 个作品
              </p>
            </div>
            <Button onClick={() => navigate('/student/submit')}>
              <Plus className="w-5 h-5 mr-2" />
              提交新作品
            </Button>
          </div>

          {/* 作品列表 */}
          {isLoading ? (
            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-12 text-center shadow-md shadow-black/30">
              <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-300">正在加载作品...</p>
            </div>
          ) : myWorks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myWorks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  onDelete={deleteArtwork}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-12 text-center shadow-md shadow-black/30">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <FolderOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                还没有提交任何作品
              </h2>
              <p className="mb-6 text-slate-300">
                开始你的创作之旅，提交第一个作品吧！
              </p>
              <Button onClick={() => navigate('/student/submit')}>
                <Plus className="w-5 h-5 mr-2" />
                提交第一个作品
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
