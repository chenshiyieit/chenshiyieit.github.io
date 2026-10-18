import { withBase } from './base-path.mjs';

export type Locale = 'en' | 'zh';
export const locales: Locale[] = ['en', 'zh'];
export const scholar = 'https://scholar.google.com/citations?user=G4cgJtgAAAAJ';
export const navigation = [
  { slug: '', key: 'home', en: 'Home', zh: '首页' },
  { slug: 'biography', key: 'biography', en: 'Biography', zh: '个人简介' },
  { slug: 'research', key: 'research', en: 'Research', zh: '研究方向' },
  { slug: 'publications', key: 'publications', en: 'Publications', zh: '论文发表' },
  { slug: 'people', key: 'people', en: 'People', zh: '团队成员' },
  { slug: 'gallery', key: 'gallery', en: 'Gallery', zh: '照片' },
] as const;

export function pathFor(locale: Locale, slug = '') {
  if (locale === 'en' && !slug) return assetPath('/');
  return assetPath(`/${locale}/${slug ? `${slug}/` : ''}`);
}

export function assetPath(path: string) {
  return withBase(path, import.meta.env.BASE_URL);
}
