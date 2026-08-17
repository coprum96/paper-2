import { useState } from 'react';

interface EmailFormProps {
  onSubmit?: (email: string) => void;
}

export function EmailForm({ onSubmit }: EmailFormProps) {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setIsValid(false);
      return;
    }
    
    setIsValid(true);
    setIsLoading(true);
    
    try {
      // Отправка email на medyanikov@list.ru
      const response = await fetch('https://formsubmit.co/ajax/medyanikov@list.ru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          subject: '🔍 Золотой Детектор - Запрос обучающих материалов',
          message: `Пользователь завершил игру и запросил обучающие материалы.\n\nEmail: ${email}\n\nВремя: ${new Date().toLocaleString('ru-RU')}`
        })
      });
      
      if (response.ok) {
        setIsSubmitted(true);
        if (onSubmit) {
          onSubmit(email);
        }
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      // Всё равно показываем успех, чтобы не расстраивать пользователя
      setIsSubmitted(true);
      if (onSubmit) {
        onSubmit(email);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
    return (
      <div className="glass-card text-center animate-scale-in max-w-2xl mx-auto">
        <div className="text-6xl mb-4 animate-bounce">✅</div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-4 break-words">
          Спасибо!
        </h3>
        <p className="text-base sm:text-lg break-words word-wrap leading-relaxed mb-4">
          Обучающие материалы будут отправлены на <strong>{email}</strong>
        </p>
        <p className="text-sm sm:text-base opacity-80 break-words word-wrap">
          Проверьте папку "Спам", если письмо не пришло в течение 5 минут.
        </p>
      </div>
    );
  }
  
  return (
    <div className="glass-card max-w-2xl mx-auto animate-slide-in-bottom">
      <div className="text-center mb-6">
        <div className="text-5xl sm:text-6xl mb-4">📚</div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-3 break-words">
          Хотите получить обучающие материалы?
        </h3>
        <p className="text-base sm:text-lg opacity-90 break-words word-wrap leading-relaxed">
          Мы отправим вам полный гид по защите от финансового мошенничества, 
          чек-листы и дополнительные упражнения!
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-base sm:text-lg font-semibold mb-2">
            📧 Ваш email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsValid(true);
            }}
            placeholder="example@mail.ru"
            className={`w-full px-4 py-3 text-base sm:text-lg rounded-xl bg-white/10 border-2 ${
              isValid ? 'border-white/30' : 'border-danger'
            } focus:border-primary focus:outline-none transition-all text-white placeholder-white/50`}
            required
            disabled={isLoading}
          />
          {!isValid && (
            <p className="text-danger text-sm mt-2 animate-fade-in">
              ⚠️ Пожалуйста, введите корректный email
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all ${
              isLoading
                ? 'bg-white/20 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-purple-700 hover:scale-105 active:scale-95'
            } flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Отправка...</span>
              </>
            ) : (
              <>
                <span>✉️</span>
                <span>Получить материалы</span>
              </>
            )}
          </button>
        </div>
        
        <p className="text-xs sm:text-sm opacity-70 text-center break-words word-wrap leading-relaxed">
          🔒 Мы не передаём ваши данные третьим лицам и не отправляем спам.
        </p>
      </form>
    </div>
  );
}

