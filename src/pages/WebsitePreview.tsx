import React, { useMemo, useRef } from 'react';
import { ArrowLeft, ExternalLink, Maximize2 } from 'lucide-react';

export const WebsitePreview: React.FC = () => {
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('url') || '';
  const title = params.get('title') || '学生网站作品';

  const safeTargetUrl = useMemo(() => {
    if (!targetUrl) return '';

    try {
      const parsed = new URL(targetUrl);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
    } catch {
      return '';
    }
  }, [targetUrl]);

  const handleFullscreen = async () => {
    try {
      await frameWrapRef.current?.requestFullscreen();
    } catch {
      window.open(safeTargetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <main className="fixed inset-0 z-50 flex bg-slate-950 text-white">
      <div className="flex min-h-0 w-full flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/95 px-3 backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="返回"
              title="返回"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{title}</p>
              <p className="hidden truncate text-xs text-slate-400 sm:block">{safeTargetUrl || '没有可用的预览地址'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFullscreen}
              disabled={!safeTargetUrl}
              className="inline-flex h-9 items-center gap-1 rounded-md border border-white/10 px-3 text-sm text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Maximize2 className="h-4 w-4" />
              <span className="hidden sm:inline">全屏</span>
            </button>
            <button
              type="button"
              onClick={() => window.open(safeTargetUrl, '_blank', 'noopener,noreferrer')}
              disabled={!safeTargetUrl}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">打开原链接</span>
            </button>
          </div>
        </header>

        <div ref={frameWrapRef} className="min-h-0 flex-1 bg-white">
          {safeTargetUrl ? (
            <iframe
              src={safeTargetUrl}
              title={title}
              sandbox="allow-downloads allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
              className="h-full w-full border-0 bg-white"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-950 px-6 text-center">
              <div>
                <h1 className="text-lg font-semibold text-white">无法打开这个网站作品</h1>
                <p className="mt-2 text-sm text-slate-400">预览地址缺失或格式不正确，请回到作品列表重新打开。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};
