// What a blog post tells link previews (LinkedIn, chat apps) about itself.

export interface SocialImage {
  /** A path on this site, made absolute by the layout */
  path: string;
  alt: string;
}

export interface SocialMeta {
  /** The browser tab title */
  title: string;
  /** The preview title; the site name already travels as og:site_name */
  ogTitle: string;
  type: 'website' | 'article';
  /** Undefined keeps the site's own card */
  image?: SocialImage;
  publishedTime?: string;
}

interface SharedPost {
  title: string;
  author: string;
  publishedAt: Date;
  socialImage?: string;
}

// Only a raster image served by this site: the field is free text in Firestore
const SITE_IMAGE = /^\/(?!\/)[\w\-./]+\.(png|jpe?g|webp)$/i;

export function postSocialMeta(post: SharedPost, siteName: string): SocialMeta {
  const image = post.socialImage && SITE_IMAGE.test(post.socialImage)
    ? { path: post.socialImage, alt: `Notice by ${post.author}: ${post.title}` }
    : undefined;

  return {
    title: `${post.title} | ${siteName}`,
    ogTitle: post.title,
    type: 'article',
    image,
    publishedTime: post.publishedAt.toISOString(),
  };
}
