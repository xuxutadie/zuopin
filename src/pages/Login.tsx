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
        const result = await register(name);
        if (result.success) {
          navigate('/student');
        } else {
          setError(result.error || '注册失败');
        }
      } else {
        const result = await login(name, role, role === 'teacher' ? password : undefined);
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header showNav={false} />
      
      <section className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="container mx-auto">
          <div className="max-w-md mx-auto">
            {/* 标题 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? '欢迎回来' : '加入我们'}
              </h1>
              <p className="text-gray-600">
                {mode === 'login' ? '登录您的账户开始提交作品' : '创建账户，开始您的创作之旅'}
              </p>
            </div>

            {/* 角色选择 */}
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
                  onClick={() => setRole('teacher')}
                  className={`
                    flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg
                    transition-all duration-200 font-medium
                    ${role === 'teacher'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <Shield className="w-5 h-5" />
                  <span>我是老师</span>
                </button>
              </div>
            </Card>

            {/* 表单 */}
            <Card>
              <CardTitle className="mb-6">
                {mode === 'login' ? '账户登录' : '账户注册'}
              </CardTitle>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="姓名"
                  placeholder={role === 'teacher' ? '输入管理员账号' : '输入您的姓名'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />

                {role === 'teacher' && (
                  <Input
                    type="password"
                    label="密码"
                    placeholder="输入登录密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                )}

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
                  {mode === 'login' ? '还没有账户？' : '已有账户？'}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'login' ? 'register' : 'login');
                      setError('');
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {mode === 'login' ? '立即注册' : '立即登录'}
                  </button>
                </p>
              </div>

              {role === 'teacher' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>老师账号：</strong>admin<br />
                    <strong>默认密码：</strong>admin123
                  </p>
                </div>
              )}
            </Card>

            {/* 提示信息 */}
            {role === 'student' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">温馨提示：</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>学生无需密码，只需输入姓名即可注册和登录</li>
                      <li>同一个姓名只能注册一次</li>
                      <li>作品提交后会保存在服务器中</li>
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
