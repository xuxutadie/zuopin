import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ArtworkCard } from '../components/ArtworkCard';
import { useArtworkStore } from '../stores/artworkStore';
import { downloadMultipleFiles } from '../utils/downloadHelper';
import { ArrowLeft, Search, Download, X, FileImage, FileVideo, FileCode } from 'lucide-react';
import { clsx } from 'clsx';
import { Artwork, FilterOptions } from '../types';

export const WorksOverview: React.FC = () => {
  const navigate = useNavigate();
  const { filterArtworks, fetchAllArtworks } = useArtworkStore();
  
  const [filters, setFilters] = useState<FilterOptions>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorks, setSelectedWorks] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchAllArtworks();
  }, [fetchAllArtworks]);

  const artworks = filterArtworks({ ...filters, search: searchTerm });

  const handleFilterChange = (type?: 'image' | 'video' | 'html') => {
    setFilters(prev => ({ ...prev, type: prev.type === type ? undefined : type }));
  };

  const handleSelectAll = () => {
    if (selectedWorks.length === artworks.length) {
      setSelectedWorks([]);
    } else {
      setSelectedWorks(artworks.map(a => a.id));
    }
  };

  const handleToggleSelect = (artwork: Artwork) => {
    setSelectedWorks(prev => 
      prev.includes(artwork.id)
        ? prev.filter(id => id !== artwork.id)
        : [...prev, artwork.id]
    );
  };

  const handleBatchDownload = async () => {
    if (selectedWorks.length === 0) return;
    
    setIsDownloading(true);
    try {
      const selectedArtworks = artworks.filter(a => selectedWorks.includes(a.id));
      await downloadMultipleFiles(selectedArtworks);
    } catch (error) {
      alert('下载失败，请重试');
    } finally {
      setIsDownloading(false);
    }
  };

  const typeFilters = [
    { value: 'image', label: '图片', icon: FileImage, count: filterArtworks({ type: 'image' }).length },
    { value: 'video', label: '视频', icon: FileVideo, count: filterArtworks({ type: 'video' }).length },
    { value: 'html', label: '网页', icon: FileCode, count: filterArtworks({ type: 'html' }).length }
  ] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto">
          {/* 头部信息 */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/teacher')}
              className="mb-2 flex items-center space-x-2 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>返回控制台</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  作品总览
                </h1>
                <p className="mt-1 text-slate-300">
                  共 {artworks.length} 个作品 {selectedWorks.length > 0 && `（已选择 ${selectedWorks.length} 个）`}
                </p>
              </div>
              {selectedWorks.length > 0 && (
                <Button 
                  onClick={handleBatchDownload}
                  isLoading={isDownloading}
                >
                  <Download className="w-5 h-5 mr-2" />
                  批量下载 ({selectedWorks.length})
                </Button>
              )}
            </div>
          </div>

          {/* 筛选栏 */}
          <div className="mb-6 rounded-xl border border-white/10 bg-slate-950/80 p-4 shadow-md shadow-black/30">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索作品名称、学生姓名..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border border-white/15 bg-black/45 py-2 pl-10 pr-4 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 类型筛选 */}
              <div className="flex items-center space-x-2">
                {typeFilters.map((filter) => {
                  const Icon = filter.icon;
                  const isActive = filters.type === filter.value;
                  return (
                    <button
                      key={filter.value}
                      onClick={() => handleFilterChange(filter.value)}
                      className={clsx(
                        'px-4 py-2 rounded-lg flex items-center space-x-2 transition-all',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/15'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{filter.label}</span>
                      <span className={clsx(
                        'text-xs px-1.5 py-0.5 rounded-full',
                        isActive ? 'bg-blue-500' : 'bg-white/10'
                      )}>
                        {filter.count}
                      </span>
                    </button>
                  );
                })}

                {(filters.type || searchTerm) && (
                  <button
                    onClick={() => {
                      setFilters({});
                      setSearchTerm('');
                    }}
                    className="flex items-center space-x-1 px-3 py-2 text-sm text-slate-300 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                    <span>清除</span>
                  </button>
                )}
              </div>

              {/* 全选 */}
              {artworks.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedWorks.length === artworks.length ? '取消全选' : '全选'}
                </Button>
              )}
            </div>
          </div>

          {/* 作品列表 */}
          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artworks.map((artwork) => (
                <ArtworkCard
                  key={artwork.id}
                  artwork={artwork}
                  showStudent
                  selectable
                  selected={selectedWorks.includes(artwork.id)}
                  onSelect={handleToggleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-12 text-center shadow-md shadow-black/30">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/10">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                没有找到作品
              </h2>
              <p className="text-slate-300">
                {searchTerm || filters.type
                  ? '尝试调整筛选条件'
                  : '还没有学生提交作品'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
