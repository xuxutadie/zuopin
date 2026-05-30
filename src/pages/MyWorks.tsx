import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { ArtworkCard } from '../components/ArtworkCard';
import { useAuthStore } from '../stores/authStore';
import { useArtworkStore } from '../stores/artworkStore';
import { ArrowLeft, Plus, FolderOpen } from 'lucide-react';

export const MyWorks: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { getStudentWorks, deleteArtwork } = useArtworkStore();
  
  const myWorks = currentUser ? getStudentWorks(currentUser.id) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* 头部信息 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button
                onClick={() => navigate('/student')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回控制台</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                我的作品
              </h1>
              <p className="text-gray-600 mt-1">
                共 {myWorks.length} 个作品
              </p>
            </div>
            <Button onClick={() => navigate('/student/submit')}>
              <Plus className="w-5 h-5 mr-2" />
              提交新作品
            </Button>
          </div>

          {/* 作品列表 */}
          {myWorks.length > 0 ? (
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
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                还没有提交任何作品
              </h2>
              <p className="text-gray-600 mb-6">
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
