const HTTP_URL_PATTERN = /^https?:\/\/.+/i;
const MAILTO_PREFIX_PATTERN = /^mailto:/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isMailtoUrl = (url: string): boolean => MAILTO_PREFIX_PATTERN.test(url);

export const validateUrlFormat = (url: string): boolean => {
  if (isMailtoUrl(url)) {
    const address = url.slice('mailto:'.length).split('?')[0];
    try {
      return EMAIL_PATTERN.test(decodeURIComponent(address));
    } catch {
      return false;
    }
  }

  if (!HTTP_URL_PATTERN.test(url)) {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};
