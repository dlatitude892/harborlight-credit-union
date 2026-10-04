import { useEffect } from 'react';

const SITE_URL = 'https://harborlightcreditunion.org';
const SITE_NAME = 'Harborlight Credit Union';

interface PageMeta {
  /** Page-specific title. The site name is appended automatically. */
  title: string;
  description?: string;
  /** Path for the canonical URL, e.g. '/login'. Omit for pages that shouldn't set one. */
  path?: string;
}

// Updates an existing <meta>/<link> tag from index.html, or creates it if missing.
const setTag = (selector: string, attr: 'content' | 'href', value: string, create: () => HTMLElement) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const metaByName = (name: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute('name', name);
  return el;
};

const metaByProperty = (property: string) => () => {
  const el = document.createElement('meta');
  el.setAttribute('property', property);
  return el;
};

/**
 * This is a single-page app, so every route is served from the same
 * index.html with the same fixed meta tags. Without this, every page would
 * share the homepage's title/description, and every page's canonical tag
 * would point at the homepage - telling Google they're all duplicates of it.
 * Google renders JavaScript, so it picks up the tags set here.
 */
export function usePageMeta({ title, description, path }: PageMeta) {
  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;
    setTag('meta[property="og:title"]', 'content', fullTitle, metaByProperty('og:title'));
    setTag('meta[name="twitter:title"]', 'content', fullTitle, metaByName('twitter:title'));

    if (description) {
      setTag('meta[name="description"]', 'content', description, metaByName('description'));
      setTag('meta[property="og:description"]', 'content', description, metaByProperty('og:description'));
      setTag('meta[name="twitter:description"]', 'content', description, metaByName('twitter:description'));
    }

    if (path !== undefined) {
      const url = `${SITE_URL}${path === '/' ? '/' : path}`;
      setTag('link[rel="canonical"]', 'href', url, () => {
        const el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        return el;
      });
      setTag('meta[property="og:url"]', 'content', url, metaByProperty('og:url'));
    }
  }, [title, description, path]);
}
