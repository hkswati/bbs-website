const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
const backdrop = document.querySelector('.nav-backdrop');
const closeBtn = document.querySelector('.nav-close');

function openMenu() {
  links.classList.add('is-open');
  if (backdrop) backdrop.classList.add('is-open');
  toggle.setAttribute('aria-expanded', true);
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  links.classList.remove('is-open');
  if (backdrop) backdrop.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', false);
  document.body.style.overflow = '';
}

if (toggle) toggle.addEventListener('click', () => {
  links.classList.contains('is-open') ? closeMenu() : openMenu();
});
if (closeBtn) closeBtn.addEventListener('click', closeMenu);
if (backdrop) backdrop.addEventListener('click', closeMenu);

const heroTyped = document.getElementById('hero-typed');
if (heroTyped) {
  const fullText = heroTyped.textContent.trim();
  heroTyped.innerHTML = '<span id="hero-typed-text"></span><span class="typed-caret" aria-hidden="true"></span>';
  const textEl = document.getElementById('hero-typed-text');
  let hasTyped = false;
  try { hasTyped = !!sessionStorage.getItem('bb_hero_typed'); } catch(e) {}

  if (hasTyped) {
    textEl.textContent = fullText;
  } else {
    let i = 0;
    function typeChar() {
      textEl.textContent = fullText.slice(0, ++i);
      if (i < fullText.length) {
        setTimeout(typeChar, 48);
      } else {
        try { sessionStorage.setItem('bb_hero_typed', '1'); } catch(e) {}
      }
    }
    setTimeout(typeChar, 500);
  }
}

const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 2px 20px rgba(0,0,0,0.4)'
      : '';
  }, { passive: true });
}
