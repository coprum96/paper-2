export function createParticle(x: number, y: number, emoji: string) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.textContent = emoji;
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.fontSize = '24px';
  document.body.appendChild(particle);
  
  setTimeout(() => particle.remove(), 2000);
}

export function createParticleBurst(emoji: string, count: number = 10) {
  const coinStat = document.getElementById('coinStat');
  if (!coinStat) return;
  
  const rect = coinStat.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const x = rect.left + Math.random() * 100 - 50;
      const y = rect.top + Math.random() * 100 - 50;
      createParticle(x, y, emoji);
    }, i * 50);
  }
}

