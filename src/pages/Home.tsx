import React, { Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { Card, CardTitle, CardContent } from '../components/Card';
import { FileImage, FileVideo, FileCode, Sparkles, Users, Download } from 'lucide-react';

const MagicRings = lazy(() => import('../components/MagicRings'));

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header showNav={false} />

      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <Suspense fallback={null}>
            <MagicRings
              color="#A855F7"
              colorTwo="#6366F1"
              ringCount={9}
              speed={0.85}
              attenuation={7}
              lineThickness={2.6}
              baseRadius={0.18}
              radiusStep={0.14}
              scaleRate={0.16}
              opacity={1}
              blur={0}
              noiseAmount={0.1}
              rotation={0}
              ringGap={1.15}
              fadeIn={0.7}
              fadeOut={0.5}
              followMouse={false}
              mouseInfluence={0.2}
              hoverScale={1.2}
              parallax={0.08}
              clickBurst={false}
            />
          </Suspense>
        </div>

        <div className="absolute inset-0 bg-white/25" />

        <div className="container relative z-10 mx-auto flex min-h-[calc(100vh-64px)] items-center justify-center">
          <div className="max-w-4xl text-center">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 shadow-sm backdrop-blur mb-6">
              <Sparkles className="w-4 h-4" />
              <span>专为AI教育设计</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI作品收集平台
              </span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              轻松收集、管理和展示学生的AI创作成果。<br />
              支持图片、视频、HTML作品，让创作展示更便捷！
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                立即开始
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto"
              >
                老师登录
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-6">
            <Card hover className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileImage className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>图片作品</CardTitle>
              <CardContent>
                <p className="mt-2 text-sm">
                  支持 JPG、PNG、GIF、WebP 等多种格式，AI绘图作品一键上传展示
                </p>
              </CardContent>
            </Card>

            <Card hover className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileVideo className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle>视频作品</CardTitle>
              <CardContent>
                <p className="mt-2 text-sm">
                  支持 MP4、WebM 格式，AI生成的视频作品轻松收录
                </p>
              </CardContent>
            </Card>

            <Card hover className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileCode className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>HTML作品</CardTitle>
              <CardContent>
                <p className="mt-2 text-sm">
                  支持网页作品上传，AI编程成果完整呈现
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">简单易用</h3>
                <p className="text-sm text-gray-600">学生注册登录后即可提交作品，流程清晰，适合课堂快速使用</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">便捷管理</h3>
                <p className="text-sm text-gray-600">老师可批量下载所有作品，方便存档和评价</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">专为教育</h3>
                <p className="text-sm text-gray-600">专为青少年AI培训和竞赛设计的作品收集工具</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
