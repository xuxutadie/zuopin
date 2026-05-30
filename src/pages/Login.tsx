import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card, CardTitle } from '../components/Card';
import { useAuthStore } from '../stores/authStore';
import { User, Shield, GraduationCap } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        const result = await register(name, password);
        if (result.success) {
          navigate('/student');
        } else {
          setError(result.error || '注册失败');
        }
      } else {
        const result = await login(name, role, password);
        if (result.success) {
          navigate(role === 'teacher' ? '/teacher' : '/student');
        } else {
          setError(result.error || '登录失败');
        }
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    const nextMode = mode === 'login' ? 'register' : 'login';
    setMode(nextMode);
    setError('');
    setPassword('');

    if (nextMode === 'register') {
      setRole('student');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header showNav={false} />

      <section className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? '欢迎回来' : '学生注册'}
              </h1>
              <p className="text-gray-600">
                {mode === 'login' ? '登录账号后开始提交或管理作品' : '创建学生账号后即可提交作品'}
              </p>
            </div>

            <Card className="mb-6">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg
                    transition-all duration-200 font-medium
                    ${role === 'student'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>我是学生</span>
                </button>
                <button
                  type="button"
                  disabled={mode === 'register'}
                  onClick={() => setRole('teacher')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg
                    transition-all duration-200 font-medium
                    ${role === 'teacher'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                    ${mode === 'register' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <Shield className="w-5 h-5" />
                  <span>我是老师</span>
                </button>
              </div>
            </Card>

            <Card>
              <CardTitle className="mb-6">
                {mode === 'login' ? '账号登录' : '学生账号注册'}
              </CardTitle>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={role === 'teacher' ? '账号' : '姓名'}
                  placeholder={role === 'teacher' ? '输入老师账号' : '输入学生姓名'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />

                <Input
                  type="password"
                  label="密码"
                  placeholder={mode === 'register' ? '设置登录密码' : '输入登录密码'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {mode === 'login' ? '登录' : '注册'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {mode === 'login' ? '还没有账号？' : '已有账号？'}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {mode === 'login' ? '立即注册' : '立即登录'}
                  </button>
                </p>
              </div>

            </Card>

            {role === 'student' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">温馨提示：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>学生注册和登录都需要输入密码</li>
                      <li>同一个姓名只能注册一次</li>
                      <li>作品提交后会保存到服务器中</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
