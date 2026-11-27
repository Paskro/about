export const SITE_URL = 'https://paskro.com';
export const CONTACT_EMAIL = 'contact@paskro.com';
export const TELEGRAM_HANDLE = '@Paskro';
export const TELEGRAM_URL = 'https://t.me/Paskro';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/paskro/';

/** LinkedIn posts about the case study. Add { url, en, ru } items; an empty list hides the block. */
export const POSTS: { url: string; en: string; ru: string }[] = [
  { url: 'https://lnkd.in/p/erK_Pbnf', en: 'An onboarding that lasts 17 days', ru: 'Онбординг длиной 17 дней (на английском)' },
  { url: 'https://lnkd.in/p/ejc98HNF', en: 'Putting “ONLINE:” in front of nine Jira tasks', ru: 'Приставка «ONLINE:» у девяти задач в Jira (на английском)' },
  { url: 'https://lnkd.in/p/eSM4Kijq', en: 'Publishing an app is a second project', ru: 'Публикация приложения — это второй проект (на английском)' },
];

export const CV_FILES = {
  en: 'cv/Pavel_Skrobov_CV_EN.pdf',
  ru: 'cv/Pavel_Skrobov_CV_RU.pdf',
} as const;
