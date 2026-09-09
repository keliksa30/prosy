/**
 * BRAND & SOCIAL MEDIA ICONS
 * Curated, pixel-perfect 24x24 vector icons matching Lucide's stroke & aesthetic.
 * Fully recolorable via currentColor or custom hex, resizable, and auto-tagged for quick search.
 */

export const BRAND_ICONS = {
  Instagram: {
    title: 'Instagram',
    category: 'social',
    tags: ['instagram', 'ig', 'insta', 'social', 'photo', 'feed', 'reels', 'camera', 'dm', 'contact'],
    elements: [
      ['rect', { width: '20', height: '20', x: '2', y: '2', rx: '5', ry: '5' }],
      ['circle', { cx: '12', cy: '12', r: '4' }],
      ['circle', { cx: '17.5', cy: '6.5', r: '1.2', fill: 'currentColor' }]
    ]
  },

  WhatsApp: {
    title: 'WhatsApp',
    category: 'social',
    tags: ['whatsapp', 'wa', 'chat', 'message', 'phone', 'call', 'kontak', 'hubungi', 'contact'],
    elements: [
      ['path', { d: 'M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21' }],
      ['path', { d: 'M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1' }]
    ]
  },

  LinkedIn: {
    title: 'LinkedIn',
    category: 'social',
    tags: ['linkedin', 'in', 'career', 'job', 'social', 'resume', 'cv', 'work'],
    elements: [
      ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' }],
      ['rect', { width: '4', height: '12', x: '2', y: '9' }],
      ['circle', { cx: '4', cy: '4', r: '2' }]
    ]
  },

  Website: {
    title: 'Website / Web',
    category: 'social',
    tags: ['website', 'web', 'globe', 'browser', 'internet', 'url', 'domain', 'situs', 'link'],
    elements: [
      ['circle', { cx: '12', cy: '12', r: '10' }],
      ['line', { x1: '2', y1: '12', x2: '22', y2: '12' }],
      ['path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }]
    ]
  },

  Browser: {
    title: 'Browser / Web Page',
    category: 'social',
    tags: ['browser', 'website', 'web', 'window', 'page', 'internet', 'url'],
    elements: [
      ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
      ['path', { d: 'M2 9h20' }],
      ['circle', { cx: '6', cy: '6.5', r: '.5' }],
      ['circle', { cx: '8', cy: '6.5', r: '.5' }],
      ['circle', { cx: '10', cy: '6.5', r: '.5' }]
    ]
  },

  X: {
    title: 'X (Twitter)',
    category: 'social',
    tags: ['x', 'twitter', 'tweet', 'social', 'x-corp'],
    elements: [
      ['path', { d: 'M4 4l6.5 7.5L4 20h2l5.5-6.3L16 20h4l-7-8.1L19.5 4h-2L12.5 9.8 8 4H4z' }]
    ]
  },

  GitHub: {
    title: 'GitHub',
    category: 'social',
    tags: ['github', 'git', 'code', 'repo', 'dev', 'developer', 'software'],
    elements: [
      ['path', { d: 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4' }],
      ['path', { d: 'M9 18c-4.51 2-5-2-7-2' }]
    ]
  },

  Dribbble: {
    title: 'Dribbble',
    category: 'social',
    tags: ['dribbble', 'design', 'portfolio', 'ui', 'ux', 'ball', 'creative'],
    elements: [
      ['circle', { cx: '12', cy: '12', r: '10' }],
      ['path', { d: 'M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94' }],
      ['path', { d: 'M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32' }],
      ['path', { d: 'M8.5 2.5c4.75 4.8 7.37 11.23 8.2 19.3' }]
    ]
  },

  Behance: {
    title: 'Behance',
    category: 'social',
    tags: ['behance', 'design', 'portfolio', 'creative', 'adobe', 'case-study'],
    elements: [
      ['path', { d: 'M3 8h5a2.5 2.5 0 0 1 0 5H3z' }],
      ['path', { d: 'M3 13h5.5a2.5 2.5 0 0 1 0 5H3z' }],
      ['path', { d: 'M14 13h7a3.5 3.5 0 0 0-7 0v2a3.5 3.5 0 0 0 7 0' }],
      ['path', { d: 'M15 9h5' }]
    ]
  },

  YouTube: {
    title: 'YouTube',
    category: 'social',
    tags: ['youtube', 'yt', 'video', 'stream', 'play', 'channel', 'media'],
    elements: [
      ['path', { d: 'M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17' }],
      ['polygon', { points: '10 15 15 12 10 9 10 15' }]
    ]
  },

  TikTok: {
    title: 'TikTok',
    category: 'social',
    tags: ['tiktok', 'video', 'short', 'music', 'social', 'tt'],
    elements: [
      ['path', { d: 'M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5' }]
    ]
  },

  Figma: {
    title: 'Figma',
    category: 'social',
    tags: ['figma', 'design', 'ui', 'ux', 'prototype', 'tool', 'fig'],
    elements: [
      ['path', { d: 'M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z' }],
      ['path', { d: 'M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z' }],
      ['path', { d: 'M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z' }],
      ['path', { d: 'M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z' }],
      ['path', { d: 'M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z' }]
    ]
  },

  Facebook: {
    title: 'Facebook',
    category: 'social',
    tags: ['facebook', 'fb', 'meta', 'social'],
    elements: [
      ['path', { d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' }]
    ]
  },

  Telegram: {
    title: 'Telegram',
    category: 'social',
    tags: ['telegram', 'tg', 'message', 'chat', 'channel', 'group'],
    elements: [
      ['path', { d: 'm22 2-7 20-4-9-9-4Z' }],
      ['path', { d: 'M22 2 11 13' }]
    ]
  },

  Discord: {
    title: 'Discord',
    category: 'social',
    tags: ['discord', 'chat', 'gaming', 'community', 'voice', 'server'],
    elements: [
      ['path', { d: 'M18 6h-2c-1.5-1-3-1-4-1s-2.5 0-4 1H6c-2 3-3 7-3 11 2 1.5 4 1.5 5 1.5.5-.5 1-1.5 1.5-2-2-.5-2.5-1.5-2.5-1.5s.2.1.5.3c1.5.9 3.5 1.2 5 1.2s3.5-.3 5-1.2c.3-.2.5-.3.5-.3s-.5 1-2.5 1.5c.5.5 1 1.5 1.5 2 1 0 3 0 5-1.5 0-4-1-8-3-11z' }],
      ['circle', { cx: '9', cy: '12', r: '1.5' }],
      ['circle', { cx: '15', cy: '12', r: '1.5' }]
    ]
  },

  Spotify: {
    title: 'Spotify',
    category: 'social',
    tags: ['spotify', 'music', 'audio', 'podcast', 'playlist', 'song'],
    elements: [
      ['circle', { cx: '12', cy: '12', r: '10' }],
      ['path', { d: 'M6.5 9.5c3.5-1 7.5-.7 11 1' }],
      ['path', { d: 'M7.5 12.5c3-.8 6.5-.5 9.5.8' }],
      ['path', { d: 'M8.5 15.5c2.2-.6 4.8-.4 7 .5' }]
    ]
  },

  Medium: {
    title: 'Medium',
    category: 'social',
    tags: ['medium', 'blog', 'article', 'writing', 'post', 'publication'],
    elements: [
      ['circle', { cx: '6.5', cy: '12', r: '4.5' }],
      ['ellipse', { cx: '14.5', cy: '12', rx: '2.5', ry: '4.5' }],
      ['ellipse', { cx: '19.5', cy: '12', rx: '1', ry: '4' }]
    ]
  },

  Threads: {
    title: 'Threads',
    category: 'social',
    tags: ['threads', 'meta', 'social', 'text', 'microblog'],
    elements: [
      ['circle', { cx: '12', cy: '12', r: '10' }],
      ['path', { d: 'M16.5 11.5a4.5 4.5 0 1 0-2.5 4c1.5 0 2.5-.8 2.5-2.2v-1.3a4.5 4.5 0 0 0-4.5-4.5c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5c1.8 0 3.3-1.1 3.8-2.6' }]
    ]
  },

  Substack: {
    title: 'Substack',
    category: 'social',
    tags: ['substack', 'newsletter', 'email', 'blog', 'writing'],
    elements: [
      ['rect', { width: '18', height: '3', x: '3', y: '3', rx: '1' }],
      ['rect', { width: '18', height: '3', x: '3', y: '8', rx: '1' }],
      ['path', { d: 'M3 13v8l9-5 9 5v-8H3z' }]
    ]
  },

  Pinterest: {
    title: 'Pinterest',
    category: 'social',
    tags: ['pinterest', 'pin', 'board', 'inspiration', 'moodboard'],
    elements: [
      ['circle', { cx: '12', cy: '12', r: '9' }],
      ['line', { x1: '8', y1: '20', x2: '12', y2: '11' }],
      ['path', { d: 'M10.7 14c.437 1.263 1.43 2 2.55 2 2.071 0 3.75-1.554 3.75-4a5 5 0 1 0-9.7 1.7' }]
    ]
  },

  Slack: {
    title: 'Slack',
    category: 'social',
    tags: ['slack', 'team', 'chat', 'work', 'collaboration'],
    elements: [
      ['rect', { width: '3', height: '8', x: '10.5', y: '2', rx: '1.5' }],
      ['rect', { width: '8', height: '3', x: '2', y: '10.5', rx: '1.5' }],
      ['rect', { width: '3', height: '8', x: '10.5', y: '14', rx: '1.5' }],
      ['rect', { width: '8', height: '3', x: '14', y: '10.5', rx: '1.5' }],
      ['circle', { cx: '7', cy: '3.5', r: '1.5' }],
      ['circle', { cx: '3.5', cy: '17', r: '1.5' }],
      ['circle', { cx: '17', cy: '20.5', r: '1.5' }],
      ['circle', { cx: '20.5', cy: '7', r: '1.5' }]
    ]
  },

  Notion: {
    title: 'Notion',
    category: 'social',
    tags: ['notion', 'docs', 'notes', 'workspace', 'wiki'],
    elements: [
      ['rect', { width: '18', height: '18', x: '3', y: '3', rx: '3' }],
      ['path', { d: 'M7 7v10l7-10v10' }]
    ]
  },

  Codepen: {
    title: 'CodePen',
    category: 'social',
    tags: ['codepen', 'code', 'frontend', 'html', 'css', 'javascript'],
    elements: [
      ['polygon', { points: '12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2' }],
      ['line', { x1: '12', x2: '12', y1: '22', y2: '15.5' }],
      ['polyline', { points: '22 8.5 12 15.5 2 8.5' }],
      ['polyline', { points: '2 15.5 12 8.5 22 15.5' }],
      ['line', { x1: '12', x2: '12', y1: '2', y2: '8.5' }]
    ]
  },

  GitLab: {
    title: 'GitLab',
    category: 'social',
    tags: ['gitlab', 'git', 'devops', 'code', 'repo'],
    elements: [
      ['path', { d: 'm22 13-2.5-7.5-3 5.5H7.5L4.5 5.5 2 13l10 8 10-8Z' }]
    ]
  },

  Mail: {
    title: 'Email / Mail',
    category: 'social',
    tags: ['email', 'mail', 'gmail', 'inbox', 'envelope', 'surat', 'pesan', 'contact'],
    elements: [
      ['rect', { width: '20', height: '16', x: '2', y: '4', rx: '2' }],
      ['path', { d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' }]
    ]
  },

  Phone: {
    title: 'Phone / Call',
    category: 'social',
    tags: ['phone', 'call', 'telephone', 'hp', 'telepon', 'kontak', 'mobile'],
    elements: [
      ['path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' }]
    ]
  },

  MapPin: {
    title: 'Location / Address',
    category: 'social',
    tags: ['location', 'map', 'pin', 'address', 'alamat', 'tempat', 'lokasi', 'geo'],
    elements: [
      ['path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }],
      ['circle', { cx: '12', cy: '10', r: '3' }]
    ]
  },

  Calendar: {
    title: 'Calendar / Schedule',
    category: 'social',
    tags: ['calendar', 'schedule', 'date', 'jadwal', 'appointment', 'booking'],
    elements: [
      ['rect', { width: '18', height: '18', x: '3', y: '4', rx: '2' }],
      ['path', { d: 'M16 2v4' }],
      ['path', { d: 'M8 2v4' }],
      ['path', { d: 'M3 10h18' }]
    ]
  },

  Link: {
    title: 'Hyperlink / URL',
    category: 'social',
    tags: ['link', 'hyperlink', 'url', 'chain', 'tautan'],
    elements: [
      ['path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
      ['path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }]
    ]
  },

  ExternalLink: {
    title: 'External Link ↗',
    category: 'social',
    tags: ['external-link', 'arrow-up-right', 'open', 'view', 'link', 'out'],
    elements: [
      ['path', { d: 'M7 7h10v10' }],
      ['path', { d: 'M7 17 17 7' }]
    ]
  }
};
