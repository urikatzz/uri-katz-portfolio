// Small delights layered on top of the scene: coin pickup feedback and a first-climb hint.
const count = document.getElementById('coin-count');
const score = count?.parentElement;
if (count && score) {
  let last = Number(count.textContent) || 0;
  new MutationObserver(() => {
    const value = Number(count.textContent) || 0;
    if (value > last) {
      score.classList.remove('bump'); void score.offsetWidth; score.classList.add('bump');
      const plus = document.createElement('span');
      plus.className = 'coin-plus'; plus.textContent = `+${value - last}`; plus.setAttribute('aria-hidden', 'true');
      score.append(plus); plus.addEventListener('animationend', () => plus.remove());
    }
    last = value;
  }).observe(count, { childList: true, characterData: true, subtree: true });
}

const up = document.getElementById('up');
if (up) {
  up.classList.add('hint');
  const stop = () => { up.classList.remove('hint'); removeEventListener('keydown', onKey); removeEventListener('wheel', stop); up.removeEventListener('click', stop); };
  const onKey = event => { if (['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S'].includes(event.key)) stop(); };
  addEventListener('keydown', onKey); addEventListener('wheel', stop, { passive: true }); up.addEventListener('click', stop);
  document.getElementById('down')?.addEventListener('click', stop);
}
