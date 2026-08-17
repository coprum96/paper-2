import { useState } from 'react';
import { FaLock, FaGift, FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { initiatePurchase } from '../utils/accessControl';

interface PaywallProps {
  onClose?: () => void;
  onAccessGranted: (status: 'promo' | 'paid') => void;
}

export function Paywall({ onClose, onAccessGranted }: PaywallProps) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handlePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setPromoError('Введите промокод');
      return;
    }
    
    setIsActivating(true);
    setPromoError('');
    
    // Имитация небольшой задержки для UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Проверка промокода через store
    const { useGameStore } = await import('../store/gameStore');
    const result = useGameStore.getState().activatePromoCode(promoCode);
    
    setIsActivating(false);
    
    if (result.success) {
      setPromoSuccess(true);
      
      // Показываем сообщение об успехе 2 секунды, потом продолжаем игру
      setTimeout(() => {
        onAccessGranted('promo');
      }, 2000);
    } else {
      setPromoError(result.error || 'Неверный промокод');
      setPromoCode('');
    }
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    
    try {
      const result = await initiatePurchase();
      
      if (result.success) {
        onAccessGranted('paid');
      } else {
        alert(result.error || 'Ошибка при оплате');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (promoSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="container max-w-2xl mx-auto">
          <div className="glass-card text-center animate-scale-in">
            <div className="text-8xl mb-6 animate-bounce">
              <FaCheckCircle className="text-success mx-auto" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-success">
              Промокод активирован!
            </h1>
            <p className="text-xl sm:text-2xl mb-6 opacity-90">
              Все уровни разблокированы. Продолжайте игру!
            </p>
            <div className="inline-flex items-center gap-2 text-lg text-success">
              <FaGift className="animate-pulse" />
              Полный доступ ко всем главам
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-primary via-secondary to-accent">
      <div className="container max-w-3xl mx-auto">
        <div className="glass-card animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl sm:text-7xl mb-4">
              <FaLock className="text-secondary mx-auto animate-float" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Дальше — уровни Буратино<br />только с полным доступом
            </h1>
            <p className="text-lg sm:text-xl opacity-90 max-w-2xl mx-auto">
              Пройдите все главы, мини-игры и тесты про финансовую безопасность
            </p>
          </div>

          {/* Benefits */}
          <div className="mb-8 p-6 bg-white/10 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 text-center">
              Что вас ждёт:
            </h3>
            <ul className="space-y-3 text-base sm:text-lg">
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-success flex-shrink-0 mt-1" />
                <span>5+ глав с захватывающим сюжетом</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-success flex-shrink-0 mt-1" />
                <span>Интерактивные мини-игры (калькулятор, детектор лжи, микроскоп договоров)</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-success flex-shrink-0 mt-1" />
                <span>Практические техники защиты от мошенников</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-success flex-shrink-0 mt-1" />
                <span>Финальный тест и сертификат знаний</span>
              </li>
              <li className="flex items-start gap-3">
                <FaCheckCircle className="text-success flex-shrink-0 mt-1" />
                <span>Обучающие материалы по финансовой грамотности</span>
              </li>
            </ul>
          </div>

          {/* Purchase Button */}
          <div className="mb-8">
            <button
              onClick={handlePurchase}
              disabled={isPurchasing}
              className="btn btn-primary w-full text-xl sm:text-2xl py-4 sm:py-5 flex items-center justify-center gap-3"
            >
              <FaCreditCard className="text-2xl" />
              {isPurchasing ? 'Обработка...' : 'Купить доступ'}
            </button>
            <p className="text-center mt-3 text-sm opacity-70">
              Интеграция оплаты в разработке
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/30"></div>
            <span className="text-sm opacity-70">или</span>
            <div className="flex-1 h-px bg-white/30"></div>
          </div>

          {/* Promo Code Section */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4 text-center flex items-center justify-center gap-2">
              <FaGift className="text-secondary" />
              Есть промокод?
            </h3>
            
            <form onSubmit={handlePromoSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoError('');
                  }}
                  placeholder="Введите промокод"
                  disabled={isActivating}
                  className="w-full px-4 py-3 sm:px-5 sm:py-4 text-lg bg-white/10 border-2 border-white/30 rounded-xl 
                           focus:border-secondary focus:outline-none transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed
                           placeholder:text-white/50"
                  autoComplete="off"
                />
                
                {promoError && (
                  <div className="mt-2 flex items-center gap-2 text-danger text-sm sm:text-base animate-slide-in-bottom">
                    <FaTimesCircle />
                    <span>{promoError}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isActivating || !promoCode.trim()}
                className="btn btn-secondary w-full text-lg sm:text-xl py-3 sm:py-4
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isActivating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Проверка...
                  </span>
                ) : (
                  'Активировать промокод'
                )}
              </button>
            </form>

            <p className="text-center mt-4 text-sm opacity-70">
              Промокод даёт полный доступ ко всем главам игры
            </p>
          </div>

          {/* Back button (optional) */}
          {onClose && (
            <div className="text-center mt-6">
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors text-sm underline"
              >
                ← Вернуться к карте глав
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

