export const setCookie = (k, v, d = 7, p = '/') => {
  document.cookie = `${k}=${encodeURIComponent(v)}; expires=${new Date(Date.now() + d * 864e5).toUTCString()}; path=${p}`;
};

export const getCookie = k =>
  document.cookie.split('; ').reduce((r, v) => {
    const [t, s] = v.split('=');
    return t === k ? decodeURIComponent(s) : r;
  }, null);

export const removeCookie = (k, p = '/') => setCookie(k, '', -1, p);

const keyFor = (modalId, type) => type === 'Promotional' ? 'reviewLater_PROMO' : `reviewLater_${modalId}`;

export const setLaterCookie = (modalId, type) => setCookie(keyFor(modalId, type), new Date().toISOString(), 3);

export const shouldShowModal = (modalId, type) => {
  const v = getCookie(keyFor(modalId, type));
  return !v || (Date.now() - new Date(v)) / 8.64e7 >= 3;
};

export const removeLaterCookie = (modalId, type) => removeCookie(keyFor(modalId, type));