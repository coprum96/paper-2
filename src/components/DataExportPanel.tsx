import { useState } from 'react';
import { sessionAnalytics } from '../utils/sessionAnalytics';
import { FaDownload, FaTrash, FaChartBar, FaTimes, FaDatabase } from 'react-icons/fa';

interface DataExportPanelProps {
  onClose: () => void;
}

export function DataExportPanel({ onClose }: DataExportPanelProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const allSessions = sessionAnalytics.getAllSessions();
  const totalSessions = allSessions.length;
  
  // Статистика
  const stats = totalSessions > 0 ? {
    totalPlayers: totalSessions,
    avgPlayTime: Math.floor(
      allSessions.reduce((sum, s) => sum + (s.totalPlayTime || 0), 0) / totalSessions
    ),
    avgCompletedLevels: Math.floor(
      allSessions.reduce((sum, s) => sum + s.completedLevels.length, 0) / totalSessions
    ),
    avgWisdom: Math.floor(
      allSessions.reduce((sum, s) => sum + s.finalWisdom, 0) / totalSessions
    ),
    totalQuizAnswers: allSessions.reduce((sum, s) => sum + s.quizAnswers.length, 0),
    totalDialogueChoices: allSessions.reduce((sum, s) => sum + s.dialogueChoices.length, 0)
  } : null;
  
  const handleExport = () => {
    const data = sessionAnalytics.exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buratino-research-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleClearData = () => {
    if (showConfirm) {
      sessionAnalytics.clearAllData();
      setShowConfirm(false);
      onClose();
    } else {
      setShowConfirm(true);
    }
  };
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м ${secs}с`;
    } else if (minutes > 0) {
      return `${minutes}м ${secs}с`;
    } else {
      return `${secs}с`;
    }
  };
  
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl border-2 border-purple-400/50 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FaDatabase className="text-purple-400" />
            Панель исследователя
          </h2>
          <button
            onClick={onClose}
            className="text-3xl hover:text-red-400 transition-colors"
            aria-label="Закрыть"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Stats Overview */}
        {stats && (
          <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaChartBar className="text-blue-400" />
              Статистика сессий
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-purple-300">{stats.totalPlayers}</div>
                <div className="text-sm opacity-80">Всего сессий</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-300">
                  {formatTime(stats.avgPlayTime)}
                </div>
                <div className="text-sm opacity-80">Ср. время игры</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-300">{stats.avgCompletedLevels}</div>
                <div className="text-sm opacity-80">Ср. пройдено уровней</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-300">{stats.avgWisdom}%</div>
                <div className="text-sm opacity-80">Ср. мудрость</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-300">{stats.totalQuizAnswers}</div>
                <div className="text-sm opacity-80">Ответов на вопросы</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-300">{stats.totalDialogueChoices}</div>
                <div className="text-sm opacity-80">Выборов в диалогах</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Sessions List Preview */}
        <div className="mb-6 p-4 bg-white/10 rounded-xl border border-white/20">
          <h3 className="text-xl font-bold mb-4">Последние сессии</h3>
          {allSessions.length === 0 ? (
            <p className="text-center opacity-70 py-4">Нет собранных данных</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allSessions.slice(-10).reverse().map((session, index) => (
                <div
                  key={session.sessionId}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-sm">
                        Сессия #{allSessions.length - index}
                      </div>
                      <div className="text-xs opacity-70">
                        {new Date(session.startTime).toLocaleString('ru-RU')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {session.completedLevels.length} ур. | {session.finalWisdom}% муд.
                      </div>
                      {session.totalPlayTime > 0 && (
                        <div className="text-xs opacity-70">
                          {formatTime(session.totalPlayTime)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Data Description */}
        <div className="mb-6 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
          <h3 className="text-lg font-bold mb-2">Что включает экспорт:</h3>
          <ul className="text-sm space-y-1 opacity-90">
            <li>✅ Все игровые сессии с временными метками</li>
            <li>✅ Ответы на вопросы викторин и тестов</li>
            <li>✅ Выборы в диалогах с персонажами</li>
            <li>✅ Временные метрики (время на уровень, общее время)</li>
            <li>✅ Финальные результаты (монеты, мудрость, достижения)</li>
            <li>✅ Просмотры образовательных материалов</li>
            <li>✅ Агрегированная статистика по всем сессиям</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleExport}
            className="flex-1 btn btn-primary text-lg py-4 flex items-center justify-center gap-2"
            disabled={allSessions.length === 0}
          >
            <FaDownload />
            Экспортировать данные (JSON)
          </button>
          
          <button
            onClick={handleClearData}
            className={`px-6 py-4 rounded-xl font-bold transition-all ${
              showConfirm
                ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                : 'bg-red-500/30 hover:bg-red-500/50'
            } flex items-center gap-2`}
          >
            <FaTrash />
            {showConfirm ? 'Подтвердить удаление!' : 'Очистить данные'}
          </button>
        </div>
        
        {showConfirm && (
          <div className="mt-4 p-4 bg-red-500/20 rounded-xl border border-red-400/50">
            <p className="text-center font-bold">
              ⚠️ Это действие нельзя отменить! Все собранные данные будут удалены.
            </p>
            <p className="text-center text-sm mt-2 opacity-80">
              Нажмите "Подтвердить удаление!" снова для подтверждения или закройте панель для отмены.
            </p>
          </div>
        )}
        
        {/* Instructions */}
        <div className="mt-6 p-4 bg-purple-500/20 rounded-xl border border-purple-400/30">
          <h3 className="text-sm font-bold mb-2">💡 Для исследователей:</h3>
          <p className="text-xs opacity-90 leading-relaxed">
            Данные сохраняются локально в браузере (localStorage). Регулярно экспортируйте данные для резервного копирования.
            Для доступа к этой панели нажмите комбинацию клавиш <kbd className="px-2 py-1 bg-white/20 rounded">Ctrl+Shift+D</kbd> или
            <kbd className="px-2 py-1 bg-white/20 rounded ml-1">⌘+Shift+D</kbd> (Mac) на любом экране игры.
          </p>
        </div>
      </div>
    </div>
  );
}


