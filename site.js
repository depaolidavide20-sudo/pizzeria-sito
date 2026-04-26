const LANGUAGE_KEY = 'siteLanguage';
let currentMenuSlide = 0;

function getPageTranslations() {
  const translations = window.pageTranslations || {};
  return {
    it: translations.it || {},
    en: translations.en || {}
  };
}

function shouldUseInnerHtml(value) {
  return /<[^>]+>/.test(value);
}

function getStoredLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) || 'it';
  } catch (error) {
    return 'it';
  }
}

function storeLanguage(lang) {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    // Ignore storage errors
  }
}

function showMenuSlide(index) {
  const slides = document.querySelectorAll('.showcase-card');
  if (!slides.length) return;
  currentMenuSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle('active', i === currentMenuSlide));
}

function prevMenuSlide() {
  showMenuSlide(currentMenuSlide - 1);
}

function nextMenuSlide() {
  showMenuSlide(currentMenuSlide + 1);
}

function toggleMobileMenu() {
  const panel = document.getElementById('mobileMenuPanel');
  if (!panel) return;
  panel.classList.toggle('open');
}

function closeMobileMenu() {
  const panel = document.getElementById('mobileMenuPanel');
  if (!panel) return;
  panel.classList.remove('open');
}

function setLanguage(lang) {
  const translations = getPageTranslations();
  const selected = translations[lang] ? lang : 'it';
  document.documentElement.lang = selected;

  document.querySelectorAll('[data-key]').forEach((el) => {
    const key = el.dataset.key;
    const value = translations[selected][key];
    if (value === undefined) return;
    if (shouldUseInnerHtml(value)) el.innerHTML = value;
    else el.textContent = value;
  });

  document.querySelectorAll('[data-ph-it][data-ph-en]').forEach((el) => {
    el.placeholder = selected === 'en' ? el.dataset.phEn : el.dataset.phIt;
  });

  document.querySelectorAll('option[data-opt-it][data-opt-en]').forEach((el) => {
    el.textContent = selected === 'en' ? el.dataset.optEn : el.dataset.optIt;
  });

  const btnIt = document.getElementById('btn-it');
  const btnEn = document.getElementById('btn-en');
  if (btnIt) btnIt.classList.toggle('active', selected === 'it');
  if (btnEn) btnEn.classList.toggle('active', selected === 'en');

  storeLanguage(selected);
}

function submitBooking(event) {
  event.preventDefault();

  const form = event.target;
  const lang = document.documentElement.lang || 'it';

  const nome = form.querySelector('[name="name"]')?.value?.trim() || '';
  const telefono = form.querySelector('[name="phone"]')?.value?.trim() || '';
  const persone = form.querySelector('[name="guests"]')?.value?.trim() || '';
  const data = form.querySelector('[name="date"]')?.value || '';
  const ora = form.querySelector('[name="time"]')?.value || '';
  const tavolo = form.querySelector('[name="preference"]')?.value?.trim() || '';
  const note = form.querySelector('[name="notes"]')?.value?.trim() || '';

  let msg = '';

  if (lang === 'en') {
    msg =
      `Hello, I would like to book a table:%0A%0A` +
      `Name: ${encodeURIComponent(nome)}%0A` +
      `Phone: ${encodeURIComponent(telefono)}%0A` +
      `Guests: ${encodeURIComponent(persone)}%0A` +
      `Date: ${encodeURIComponent(data)}%0A` +
      `Time: ${encodeURIComponent(ora)}`;

    if (tavolo) msg += `%0ATable preference: ${encodeURIComponent(tavolo)}`;
    if (note) msg += `%0ANotes: ${encodeURIComponent(note)}`;
  } else {
    msg =
      `Ciao, vorrei prenotare:%0A%0A` +
      `Nome: ${encodeURIComponent(nome)}%0A` +
      `Telefono: ${encodeURIComponent(telefono)}%0A` +
      `Persone: ${encodeURIComponent(persone)}%0A` +
      `Data: ${encodeURIComponent(data)}%0A` +
      `Ora: ${encodeURIComponent(ora)}`;

    if (tavolo) msg += `%0APreferenza tavolo: ${encodeURIComponent(tavolo)}`;
    if (note) msg += `%0ANote: ${encodeURIComponent(note)}`;
  }

  const numero = '393XXXXXXXXX';
  window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
}

function openModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

function getCurrentFileName() {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf('/') + 1);
  return file || 'index.html';
}

function markCurrentNav() {
  const current = getCurrentFileName();
  document.querySelectorAll('.nav-links a, .mobile-menu-panel a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const target = href.split('/').pop();
    if (!target) return;
    link.classList.toggle('active', target === current || (current === '' && target === 'index.html'));
  });
}

window.addEventListener('click', function (e) {
  const modal = document.getElementById('bookingModal');
  const menu = document.getElementById('mobileMenuPanel');
  const toggle = document.querySelector('.mobile-menu-toggle');

  if (modal && e.target === modal) closeModal();

  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && toggle && !toggle.contains(e.target)) {
    closeMobileMenu();
  }
});

const COOKIE_PREF_KEY = 'cookiePreference';
const COOKIE_PREF_TTL = 180 * 24 * 60 * 60 * 1000;

function getCookieBanner() {
  return document.getElementById('cookie-banner');
}

function openCookiePreferences() {
  const banner = getCookieBanner();
  if (!banner) return;
  banner.hidden = false;
  banner.style.display = 'block';
  banner.setAttribute('aria-hidden', 'false');
}

function closeCookiePreferences() {
  const banner = getCookieBanner();
  if (!banner) return;
  banner.hidden = true;
  banner.style.display = 'none';
  banner.setAttribute('aria-hidden', 'true');
}

function getStoredCookiePreference() {
  try {
    const raw = localStorage.getItem(COOKIE_PREF_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.choice || !parsed.timestamp) return null;

    if (Date.now() - parsed.timestamp > COOKIE_PREF_TTL) {
      localStorage.removeItem(COOKIE_PREF_KEY);
      return null;
    }

    return parsed.choice;
  } catch (error) {
    return null;
  }
}

function storeCookiePreference(choice) {
  try {
    localStorage.setItem(COOKIE_PREF_KEY, JSON.stringify({
      choice,
      timestamp: Date.now()
    }));
  } catch (error) {
    // Ignore storage errors
  }
}

function getMapElements() {
  return {
    placeholder: document.getElementById('map-placeholder'),
    container: document.getElementById('map-container')
  };
}

function resetMap() {
  const { placeholder, container } = getMapElements();
  if (!placeholder || !container) return;

  placeholder.style.display = 'block';
  container.style.display = 'none';
  container.innerHTML = '';
  container.dataset.loaded = 'false';
}

function renderMap() {
  const { placeholder, container } = getMapElements();
  if (!placeholder || !container) return;

  placeholder.style.display = 'none';
  container.style.display = 'block';

  if (container.dataset.loaded === 'true') return;

  container.innerHTML = `
    <iframe
      src="https://www.google.com/maps?q=Corso%20Giuseppe%20Garibaldi%2099%20Chiavari&output=embed"
      style="width:100%; height:520px; border:0;"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  `;
  container.dataset.loaded = 'true';
}

function applyCookiePreference() {
  const hasMap = document.getElementById('map-placeholder') && document.getElementById('map-container');
  const choice = getStoredCookiePreference();

  if (!hasMap) {
    if (choice) closeCookiePreferences();
    else openCookiePreferences();
    return;
  }

  if (choice === 'accepted') {
    closeCookiePreferences();
    renderMap();
    return;
  }

  resetMap();

  if (choice === 'rejected') {
    closeCookiePreferences();
    return;
  }

  openCookiePreferences();
}

function acceptExternalContent() {
  storeCookiePreference('accepted');
  closeCookiePreferences();
  renderMap();
}

function rejectExternalContent() {
  storeCookiePreference('rejected');
  closeCookiePreferences();
  resetMap();
}

function loadMap() {
  acceptExternalContent();
}

document.addEventListener('DOMContentLoaded', function () {
  markCurrentNav();
  showMenuSlide(0);
  setLanguage(getStoredLanguage());

  const acceptBtn = document.getElementById('accept-cookies');
  const rejectBtn = document.getElementById('reject-cookies');
  if (acceptBtn) acceptBtn.onclick = acceptExternalContent;
  if (rejectBtn) rejectBtn.onclick = rejectExternalContent;

  applyCookiePreference();
});
