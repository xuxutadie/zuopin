import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArtworkCard } from '../components/ArtworkCard';
import { useArtworkStore } from '../stores/artworkStore';
import { Sparkles, Search, FileImage, FileVideo, FileCode, UserRound, RefreshCw, Calendar, type LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

type FilterType = 'all' | 'image' | 'video' | 'html' | 'homepage';

export const Gallery: React.FC = () => {
  const navigate = useNavigate();
  const { publicWorks, fetchPublicWorks, isLoading } = useArtworkStore();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // 页面加载时拉取公开作品
    void fetchPublicWorks();
  }, [fetchPublicWorks]);

  // 根据筛选条件过滤作品
  const filteredWorks = publicWorks.filter(work => {
    if (filterType !== 'all' && work.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesTitle = work.title.toLowerCase().includes(q);
      const matchesAuthor = work.studentName.toLowerCase().includes(q);
      const matchesDesc = work.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesAuthor && !matchesDesc) return false;
    }
    return true;
  });

  // 按创建时间倒序展示（最新的在前）
  const sortedWorks = [...filteredWorks].sort((a, b) => b.createdAt - a.createdAt);

  const filterOptions: { value: FilterType; label: string; icon: LucideIcon }[] = [
    { value: 'all', label: '全部作品', icon: Sparkles },
    { value: 'image', label: '图片作品', icon: FileImage },
    { value: 'video', label: '视频作品', icon: FileVideo },
    { value: 'html', label: 'HTML 作品', icon: FileCode },
    { value: 'homepage', label: '个人主页', icon: UserRound }
  ];

  const getFilterCount = (type: FilterType) => {
    if (type === 'all') return publicWorks.length;
    return publicWorks.filter(work => work.type === type).length;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero 区域 */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-slate-900/40 pointer-events-none" />
        <div className="container mx-auto px-4 py-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm font-medium text-blue-100 shadow-sm backdrop-blur mb-4">
              <Sparkles className="w-4 h-4" />
              <span>AI 作品分享广场</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              欣赏同学们的
              <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                创意作品
              </span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              这里汇集了同学们提交的优秀作品，包括 AI 绘图、视频、网页互动作品等。点击卡片即可预览或下载欣赏。
            </p>
          </div>
        </div>
      </section>

      {/* 搜索、筛选和操作 */}
      <section className="px-4 pb-6">
        <div className="container mx-auto">
          <div className="mb-6 rounded-xl border border-slate-800 bg-slate-950/70 p-3 shadow-lg shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:flex-1">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-950/50 transition-colors hover:bg-blue-500"
                >
                  提交作品
                </button>
                <button
                  onClick={() => {
                    void fetchPublicWorks();
                  }}
                  className="inline-flex items-center justify-center space-x-2 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800"
                >
                  <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
                  <span>刷新</span>
                </button>
              </div>

              <div className="relative w-full xl:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索作品标题、作者或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900/90 py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* 类型筛选 */}
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              {filterOptions.map((opt) => {
                const Icon = opt.icon;
                const count = getFilterCount(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilterType(opt.value)}
                    aria-pressed={filterType === opt.value}
                    className={clsx(
                      'inline-flex min-w-max items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all',
                      filterType === opt.value
                        ? 'border-blue-500 bg-blue-500/15 text-blue-100'
                        : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{opt.label}</span>
                    <span className={clsx(
                      'rounded-full px-2 py-0.5 text-xs',
                      filterType === opt.value
                        ? 'bg-blue-400/20 text-blue-100'
                        : 'bg-slate-800 text-slate-300'
                    )}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 作品列表 */}
          {isLoading && sortedWorks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4" />
              <p className="text-slate-400">正在加载作品...</p>
            </div>
          ) : sortedWorks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? '没有找到匹配的作品' : '还没有公开作品'}
              </h3>
              <p className="text-slate-400 max-w-md">
                {searchQuery
                  ? '试试调整搜索关键词或筛选条件'
                  : '快来成为第一个分享作品的同学吧！'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors"
              >
                登录提交作品
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-400">
                  共 {sortedWorks.length} 个作品
                </p>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>按时间倒序排列</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedWorks.map((artwork) => (
                  <ArtworkCard
                    key={artwork.id}
                    artwork={artwork}
                    showStudent={true}
                    showActions={true}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
