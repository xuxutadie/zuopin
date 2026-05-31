import React, { Suspense, lazy } from 'react';

const MagicRings = lazy(() => import('./MagicRings'));

export const AppBackground: React.FC = () => {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-100">
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
      <div className="absolute inset-0 bg-black/45" />
    </div>
  );
};
