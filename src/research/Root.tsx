import React, { Suspense } from 'react';
import { useEffect } from 'react';
import App from '../App';
import { parseResearchParams } from './randomize';

const ResearchApp = React.lazy(() =>
  import('./ResearchApp').then((m) => ({ default: m.ResearchApp }))
);

function Root() {
  const { enabled } = parseResearchParams();

  useEffect(() => {
    if (enabled) {
      document.title = 'Исследование СПбГУ — запросы сервисов';
      document.body.style.background = '#f4f1ea';
      document.body.style.minHeight = '100vh';
    }
  }, [enabled]);

  if (!enabled) return <App />;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea] text-[#8B1E3F] text-sm">
          Загрузка исследования СПбГУ…
        </div>
      }
    >
      <ResearchApp />
    </Suspense>
  );
}

export default Root;
