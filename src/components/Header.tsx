import React from 'react';
import { User, LogOut, Menu, X, GalleryHorizontalEnd } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface HeaderProps {
  showNav?: boolean;
  variant?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ showNav = true, variant = 'dark' }) => {
  const { currentUser, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isDark = variant === 'dark';

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={`${isDark ? 'border-b border-white/10 bg-black/80 text-white shadow-none backdrop-blur' : 'bg-white shadow-md'} sticky top-0 z-50`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo区域 */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              AI作品收集
            </span>
          </div>

          {/* 桌面端导航 */}
          {showNav && (
            <nav className="hidden md:flex items-center space-x-6">
              {/* 作品广场（所有人都能看到） */}
              <a
                href="/gallery"
                className={`flex items-center space-x-1 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
              >
                <GalleryHorizontalEnd className="w-4 h-4" />
                <span>作品广场</span>
              </a>

              {currentUser?.role === 'student' && (
                <>
                  <a 
                    href="/student" 
                    className={`${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    控制台
                  </a>
                  <a 
                    href="/student/submit" 
                    className={`${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    提交作品
                  </a>
                  <a 
                    href="/student/works" 
                    className={`${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    我的作品
                  </a>
                </>
              )}
              {currentUser?.role === 'teacher' && (
                <>
                  <a 
                    href="/teacher" 
                    className={`${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    控制台
                  </a>
                  <a 
                    href="/teacher/works" 
                    className={`${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'} transition-colors`}
                  >
                    作品总览
                  </a>
                </>
              )}
            </nav>
          )}

          {/* 用户信息和登出按钮 */}
          <div className="flex items-center space-x-4">
            {currentUser && (
              <>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className={`text-sm ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                    {currentUser.name}
                  </span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                    {currentUser.role === 'teacher' ? '老师' : '学生'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm transition-colors ${isDark ? 'text-slate-300 hover:text-red-300' : 'text-gray-600 hover:text-red-600'}`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">退出</span>
                </button>
              </>
            )}

            {/* 移动端菜单按钮 */}
            {showNav && currentUser && (
              <button
                className="md:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className={`h-6 w-6 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                ) : (
                  <Menu className={`h-6 w-6 ${isDark ? 'text-slate-200' : 'text-gray-600'}`} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* 移动端菜单 */}
        {showNav && mobileMenuOpen && (
          <nav className={`py-4 md:hidden ${isDark ? 'border-t border-white/10' : 'border-t'}`}>
            {/* 作品广场 */}
            <a
              href="/gallery"
              className={`flex items-center space-x-2 py-2 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'}`}
            >
              <GalleryHorizontalEnd className="w-4 h-4" />
              <span>作品广场</span>
            </a>

            {currentUser?.role === 'student' && (
              <>
                <a 
                  href="/student" 
                  className={`block py-2 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  控制台
                </a>
                <a 
                  href="/student/submit" 
                  className={`block py-2 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  提交作品
                </a>
                <a 
                  href="/student/works" 
                  className={`block py-2 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  我的作品
                </a>
              </>
            )}
            {currentUser?.role === 'teacher' && (
              <>
                <a 
                  href="/teacher" 
                  className={`block py-2 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  控制台
                </a>
                <a 
                  href="/teacher/works" 
                  className={`block py-2 ${isDark ? 'text-slate-300 hover:text-blue-300' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  作品总览
                </a>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
