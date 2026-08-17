// Access Control Utilities for Game Monetization

export type AccessStatus = 'free' | 'locked' | 'promo' | 'paid';

// Константы промокодов (в будущем можно вынести в конфиг или получать с сервера)
const VALID_PROMO_CODES = {
  buratino: 'promo', // Полный доступ через промокод
} as const;

/**
 * Проверяет валидность промокода
 * @param code - введённый промокод
 * @returns AccessStatus если промокод валиден, null если невалиден
 * 
 * TODO: Заменить на API-запрос к серверу для проверки промокода
 * Example:
 * ```
 * const response = await fetch('/api/promo-code/validate', {
 *   method: 'POST',
 *   body: JSON.stringify({ code })
 * });
 * return response.ok ? await response.json() : null;
 * ```
 */
export function validatePromoCode(code: string): AccessStatus | null {
  // Нормализация: lowercase, trim
  const normalizedCode = code.toLowerCase().trim();
  
  // Проверка в локальном словаре
  if (normalizedCode in VALID_PROMO_CODES) {
    return VALID_PROMO_CODES[normalizedCode as keyof typeof VALID_PROMO_CODES];
  }
  
  return null;
}

/**
 * Проверяет, доступен ли уровень пользователю
 * @param levelId - ID уровня (глава)
 * @param accessStatus - текущий статус доступа пользователя
 * @returns true если доступ разрешён, false если заблокирован
 */
export function canAccessLevel(levelId: number, accessStatus: AccessStatus): boolean {
  // Главы 0, 1, 2 (первые три главы) всегда бесплатны
  const FREE_CHAPTERS_COUNT = 3; // Главы с id: 0, 1, 2
  
  if (levelId < FREE_CHAPTERS_COUNT) {
    return true;
  }
  
  // Для глав 3+ требуется оплата или промокод
  return accessStatus === 'promo' || accessStatus === 'paid';
}

/**
 * Определяет, нужно ли показывать paywall при попытке доступа к уровню
 * @param levelId - ID уровня, к которому пытается получить доступ игрок
 * @param accessStatus - текущий статус доступа
 * @returns true если нужно показать paywall
 */
export function shouldShowPaywall(levelId: number, accessStatus: AccessStatus): boolean {
  return !canAccessLevel(levelId, accessStatus);
}

/**
 * Проверяет покупку (заглушка для будущей интеграции)
 * @returns Promise с результатом покупки
 * 
 * TODO: Интегрировать реальную платёжную систему (Stripe, PayPal, ЮKassa и т.д.)
 * Example:
 * ```
 * const response = await fetch('/api/payment/create', {
 *   method: 'POST',
 *   body: JSON.stringify({ userId, product: 'full_access' })
 * });
 * const { paymentUrl } = await response.json();
 * window.location.href = paymentUrl;
 * ```
 */
export async function initiatePurchase(): Promise<{ success: boolean; error?: string }> {
  console.log('🔒 TODO: integrate payment system');
  console.log('💳 Planned integration: YooKassa / Stripe / PayPal');
  
  // Заглушка: можно использовать для тестирования
  // return { success: true };
  
  return { 
    success: false, 
    error: 'Интеграция оплаты в разработке' 
  };
}

