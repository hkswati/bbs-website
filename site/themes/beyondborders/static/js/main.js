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

const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 8
      ? '0 2px 20px rgba(28,27,46,0.08)'
      : '';
  }, { passive: true });
}
