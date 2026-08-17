import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { educationalMaterials, redFlags, controlQuestions } from '../data/gameData';

type PanelView = 'menu' | 'materials' | 'questions' | 'flags';

export function MaterialsPanel() {
  const { showMaterialsPanel, toggleMaterialsPanel } = useGameStore();
  const [view, setView] = useState<PanelView>('menu');
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  
  if (!showMaterialsPanel) {
    return (
      <button
        className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 bg-gradient-to-br from-secondary to-orange-600 hover:from-orange-600 hover:to-secondary p-2 sm:p-2.5 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 group border border-orange-400/20"
        onClick={toggleMaterialsPanel}
        aria-label="Справка"
        title="Справка и образовательные материалы"
      >
        {/* SVG Icon - Question Mark in Circle */}
        <svg 
          className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </button>
    );
  }
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 z-[9998] animate-[fadeIn_0.3s_ease]"
        onClick={toggleMaterialsPanel}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="glass-card max-w-4xl max-h-[80vh] overflow-y-auto pointer-events-auto animate-scale-in relative">
          <button
            className="absolute top-4 right-4 text-4xl w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 hover:rotate-90 transition-all"
            onClick={toggleMaterialsPanel}
          >
            ×
          </button>
          
          {view === 'menu' && (
            <div>
              <h2 className="text-4xl font-bold mb-8">📚 Образовательные материалы</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  className="btn bg-primary/30 hover:bg-primary/50 p-6 text-left"
                  onClick={() => setView('materials')}
                >
                  <div className="text-4xl mb-2">📖</div>
                  <div className="text-xl font-bold">Материалы</div>
                  <div className="text-sm opacity-80 mt-2">
                    Обучающие материалы по финансовой грамотности
                  </div>
                </button>
                
                <button
                  className="btn bg-secondary/30 hover:bg-secondary/50 p-6 text-left"
                  onClick={() => setView('questions')}
                >
                  <div className="text-4xl mb-2">❓</div>
                  <div className="text-xl font-bold">Контрольные вопросы</div>
                  <div className="text-sm opacity-80 mt-2">
                    10 вопросов Золотого Детектора
                  </div>
                </button>
                
                <button
                  className="btn bg-danger/30 hover:bg-danger/50 p-6 text-left"
                  onClick={() => setView('flags')}
                >
                  <div className="text-4xl mb-2">🚩</div>
                  <div className="text-xl font-bold">Красные флажки</div>
                  <div className="text-sm opacity-80 mt-2">
                    Признаки финансового мошенничества
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {view === 'materials' && (
            <div>
              <button
                className="mb-6 text-lg hover:underline"
                onClick={() => setView('menu')}
              >
                ← Назад
              </button>
              
              <h2 className="text-3xl font-bold mb-6">📖 Образовательные материалы</h2>
              
              <div className="mb-6 flex flex-wrap gap-2">
                {educationalMaterials.map((material, index) => (
                  <button
                    key={material.id}
                    className={`btn text-sm ${selectedMaterial === index ? 'bg-primary' : 'bg-white/20'}`}
                    onClick={() => setSelectedMaterial(index)}
                  >
                    Материал {material.id}
                  </button>
                ))}
              </div>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">{educationalMaterials[selectedMaterial].title}</h3>
                {educationalMaterials[selectedMaterial].sections.map((section, index) => (
                  <div 
                    key={index}
                    className="p-5 bg-white/10 rounded-xl border-l-4 border-primary"
                  >
                    <h4 className="text-xl font-bold mb-3 text-secondary">{section.name}</h4>
                    <p className="text-base leading-relaxed whitespace-pre-line opacity-90">
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {view === 'questions' && (
            <div>
              <button
                className="mb-6 text-lg hover:underline"
                onClick={() => setView('menu')}
              >
                ← Назад
              </button>
              
              <h2 className="text-3xl font-bold mb-6">❓ Контрольные вопросы Золотого Детектора</h2>
              
              <div className="space-y-3">
                {controlQuestions.map((question, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-white/10 rounded-xl border-l-4 border-success"
                  >
                    {index + 1}. {question}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {view === 'flags' && (
            <div>
              <button
                className="mb-6 text-lg hover:underline"
                onClick={() => setView('menu')}
              >
                ← Назад
              </button>
              
              <h2 className="text-3xl font-bold mb-6">🚩 Красные флажки финансового мошенничества</h2>
              
              <div className="space-y-6">
                {redFlags.map((flag, index) => (
                  <div 
                    key={index}
                    className="p-5 bg-danger/10 rounded-xl border-l-4 border-danger"
                  >
                    <h4 className="text-xl font-bold mb-3">🚩 {flag.name}</h4>
                    <div className="flex flex-wrap gap-2">
                      {flag.examples.map((example, i) => (
                        <span 
                          key={i}
                          className="px-3 py-2 bg-danger/20 rounded-lg text-sm border border-danger/40"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

