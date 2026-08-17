import React, { Suspense } from 'react';
import { useEffect } from 'react';
import App from '../App';
import { COPY } from './data/copy';
import { parseResearchParams } from './randomize';

const ResearchApp = React.lazy(() =>
  import('./ResearchApp').then((m) => ({ default: m.ResearchApp }))
);

function Root() {
  const { enabled } = parseResearchParams();

  useEffect(() => {
    if (enabled) {
      document.title = COPY.documentTitle;
      document.body.style.background = '#f4f1ea';
      document.body.style.color = '#1a1a1a';
      document.body.style.minHeight = '100vh';
      document.body.classList.add('research-mode');
    }
    return () => {
      document.body.classList.remove('research-mode');
    };
  }, [enabled]);

  if (!enabled) return <App />;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f4f1ea] text-[#8B1E3F] text-sm px-4 text-center">
          Загрузка исследования «{COPY.appTitle}»…
        </div>
      }
    >
      <ResearchApp />
    </Suspense>
  );
}

export default Root;
