import * as fabric from 'fabric';
import { svg } from '../ui/icons.js';

/**
 * Curated HD Royalty-Free Stock Photos (Unsplash CDN)
 * High-resolution, copyright-safe, optimized for lightning-fast loads.
 */
export const STOCK_PHOTOS = [
  // 1. PORTRAITS & FACES
  {
    id: 'p1',
    title: 'Editorial Creative Portrait',
    category: 'portraits',
    tags: ['portrait', 'face', 'woman', 'editorial', 'model', 'fashion', 'studio'],
    author: 'Aiony Haust',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'p2',
    title: 'Minimalist Studio Portrait',
    category: 'portraits',
    tags: ['portrait', 'man', 'designer', 'minimalist', 'clean', 'profile'],
    author: 'Albert Dera',
    thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'p3',
    title: 'Neon Creative Lighting',
    category: 'portraits',
    tags: ['portrait', 'creative', 'cyberpunk', 'lighting', 'art', 'woman'],
    author: 'Oladimeji Odunsi',
    thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'p4',
    title: 'Monochrome Fashion Profile',
    category: 'portraits',
    tags: ['portrait', 'black and white', 'editorial', 'style', 'fashion', 'dark'],
    author: 'Julian Wan',
    thumb: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'p5',
    title: 'Modern Product Designer',
    category: 'portraits',
    tags: ['portrait', 'designer', 'glasses', 'developer', 'startup', 'smile'],
    author: 'Good Faces',
    thumb: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=1600&q=85'
  },

  // 2. TECH & WORKSPACE
  {
    id: 't1',
    title: 'Minimalist Desk & Workspace',
    category: 'tech',
    tags: ['desk', 'workspace', 'laptop', 'minimalist', 'clean', 'macbook'],
    author: 'Luca Bravo',
    thumb: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 't2',
    title: 'Dark Studio Setup with Code',
    category: 'tech',
    tags: ['tech', 'developer', 'coding', 'dark mode', 'software', 'screen', 'keyboard'],
    author: 'Fotis Fotopoulos',
    thumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 't3',
    title: 'Apple Ecosystem & Notebook',
    category: 'tech',
    tags: ['laptop', 'notebook', 'iphone', 'coffee', 'freelance', 'work'],
    author: 'Domenico Loia',
    thumb: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 't4',
    title: 'Product Design Wireframing',
    category: 'tech',
    tags: ['design', 'ui', 'ux', 'wireframe', 'sketches', 'creative', 'app'],
    author: 'Alvaro Reyes',
    thumb: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1600&q=85'
  },

  // 3. ARCHITECTURE & INTERIOR
  {
    id: 'a1',
    title: 'Minimalist Concrete Architecture',
    category: 'architecture',
    tags: ['architecture', 'concrete', 'brutalist', 'minimalist', 'shadow', 'geometry'],
    author: 'Simone Hutsch',
    thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'a2',
    title: 'Glass Facade & Geometric Angles',
    category: 'architecture',
    tags: ['building', 'glass', 'sky', 'modern', 'lines', 'urban'],
    author: 'Joel Filipe',
    thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'a3',
    title: 'Nordic Interior & Curved Arch',
    category: 'architecture',
    tags: ['interior', 'scandinavian', 'chair', 'arch', 'aesthetic', 'living'],
    author: 'Kam-Idris',
    thumb: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'a4',
    title: 'Spiraling Architectural Staircase',
    category: 'architecture',
    tags: ['stairs', 'geometry', 'monochrome', 'abstract', 'black and white'],
    author: 'Dan Freeman',
    thumb: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85'
  },

  // 4. STUDIO & OBJECTS
  {
    id: 's1',
    title: 'Tactile Ceramic & Shadow Play',
    category: 'studio',
    tags: ['ceramic', 'pottery', 'shadow', 'tactile', 'minimal', 'craft'],
    author: 'Tom Crew',
    thumb: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 's2',
    title: 'Luxury Perfume & Botanical Glass',
    category: 'studio',
    tags: ['packaging', 'bottle', 'cosmetics', 'branding', 'glass', 'luxury'],
    author: 'Laura Chouette',
    thumb: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 's3',
    title: 'Modern Furniture Sculpture',
    category: 'studio',
    tags: ['chair', 'furniture', 'industrial', 'yellow', 'studio', 'clean'],
    author: 'Jean-Philippe Delberghe',
    thumb: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 's4',
    title: 'Artisan Coffee & Warm Ceramic',
    category: 'studio',
    tags: ['coffee', 'latte', 'cafe', 'ceramic', 'cozy', 'warm'],
    author: 'Nathan Dumlao',
    thumb: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1600&q=85'
  },

  // 5. ABSTRACT & GRADIENTS
  {
    id: 'g1',
    title: 'Vibrant Holographic Gradient',
    category: 'abstract',
    tags: ['gradient', 'abstract', 'holographic', 'color', 'background', '3d'],
    author: 'Milad Fakurian',
    thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'g2',
    title: 'Iridescent Silk Waves',
    category: 'abstract',
    tags: ['texture', 'silk', 'fabric', 'flowing', 'purple', 'neon'],
    author: 'DeepMind',
    thumb: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'g3',
    title: 'Botanical Palm Shadow',
    category: 'abstract',
    tags: ['botanical', 'plant', 'shadow', 'green', 'leaf', 'nature'],
    author: 'Scott Webb',
    thumb: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1600&q=85'
  },
  {
    id: 'g4',
    title: 'Dark Moody Smoke Waves',
    category: 'abstract',
    tags: ['dark', 'smoke', 'fluid', 'black', 'wallpaper', 'texture'],
    author: 'Pawel Czerwinski',
    thumb: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?auto=format&fit=crop&w=400&q=80',
    url: 'https://images.unsplash.com/photo-1604076913837-52ab5629fba9?auto=format&fit=crop&w=1600&q=85'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Photos', icon: 'Sparkles' },
  { id: 'portraits', name: 'Portraits', icon: 'User' },
  { id: 'tech', name: 'Tech & Work', icon: 'Laptop' },
  { id: 'architecture', name: 'Architecture', icon: 'Building2' },
  { id: 'studio', name: 'Studio & Objects', icon: 'Package' },
  { id: 'abstract', name: 'Abstract', icon: 'Palette' }
];

export class PhotosPanel {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvasManager.getCanvas();
    this.cm = app.canvasManager;
    this.host = null;
    this.query = '';
    this.category = 'all';
  }

  mount(host) {
    this.host = host;
    this.render();
  }

  render() {
    if (!this.host) return;
    const host = this.host;
    host.innerHTML = '';

    const head = document.createElement('div');
    head.className = 'panel-head';
    head.innerHTML = `
      <div class="panel-head-title">Stock Photos</div>
      <div class="panel-head-sub">Unsplash HD curated · Drag or click to insert</div>
    `;
    host.appendChild(head);

    // Upload button (local photo/image)
    const uploadSection = document.createElement('div');
    uploadSection.style.cssText = 'padding: 8px 12px 10px;';
    const uploadBtn = document.createElement('button');
    uploadBtn.className = 'btn btn-primary';
    uploadBtn.style.cssText = 'width: 100%; justify-content: center; padding: 10px 14px; font-weight: 600; font-size: 13px; gap: 8px; box-shadow: 0 2px 10px rgba(123, 70, 248, 0.35); cursor: pointer;';
    uploadBtn.innerHTML = `${svg('Upload', 15)} Upload from your device`;
    uploadBtn.onclick = async () => {
      const file = await this.app.ops.promptUserForImage();
      if (file) {
        await this.cm.importImageFile(file);
        this.app.toast?.('Photo uploaded to canvas');
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
          this.app.closeMobileSheet?.();
        }
      }
    };
    uploadSection.appendChild(uploadBtn);
    host.appendChild(uploadSection);

    // Search input
    const searchWrap = document.createElement('div');
    searchWrap.className = 'icon-search-wrap';
    const ic = document.createElement('span');
    ic.innerHTML = svg('Search', 14);
    const search = document.createElement('input');
    search.className = 'icon-search';
    search.placeholder = 'Search portraits, tech, desk, studio…';
    search.value = this.query;
    search.addEventListener('input', () => {
      this.query = search.value;
      this.renderGrid();
    });
    searchWrap.appendChild(ic);
    searchWrap.appendChild(search);
    host.appendChild(searchWrap);

    // Category pills
    const filterBar = document.createElement('div');
    filterBar.className = 'icon-filter-bar';
    CATEGORIES.forEach(cat => {
      const chip = document.createElement('button');
      chip.className = 'icon-filter-chip' + (this.category === cat.id ? ' active' : '');
      chip.innerHTML = `${svg(cat.icon, 13)}<span>${cat.name}</span>`;
      chip.addEventListener('click', () => {
        this.category = cat.id;
        filterBar.querySelectorAll('.icon-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.renderGrid();
      });
      filterBar.appendChild(chip);
    });
    host.appendChild(filterBar);

    // Helper hint
    const hint = document.createElement('div');
    hint.className = 'panel-note';
    hint.style.display = 'flex';
    hint.style.alignItems = 'center';
    hint.style.gap = '6px';
    hint.style.padding = '5px 12px 6px';
    hint.style.fontSize = '11px';
    hint.style.color = 'var(--text-muted)';
    hint.innerHTML = `<span style="color:var(--accent);display:inline-flex;flex-shrink:0;">${svg('Lightbulb', 13)}</span><span>Drag photo onto any shape or mockup screen to auto-mask it</span>`;
    host.appendChild(hint);

    // Grid container
    this.grid = document.createElement('div');
    this.grid.className = 'photos-grid';
    host.appendChild(this.grid);

    this.renderGrid();
  }

  renderGrid() {
    if (!this.grid) return;
    const q = this.query.trim().toLowerCase();
    const cat = this.category;

    const filtered = STOCK_PHOTOS.filter(item => {
      const matchesCat = cat === 'all' || item.category === cat;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = `${item.title} ${item.tags.join(' ')} ${item.author}`.toLowerCase();
      return haystack.includes(q);
    });

    this.grid.innerHTML = '';
    if (!filtered.length) {
      this.grid.innerHTML = '<div class="icons-empty" style="grid-column: span 2;">No photos match your search.</div>';
      return;
    }

    filtered.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.draggable = true;
      card.title = `${photo.title} by ${photo.author} (Click or drag to page)`;

      const img = document.createElement('img');
      img.src = photo.thumb;
      img.alt = photo.title;
      img.loading = 'lazy';

      const overlay = document.createElement('div');
      overlay.className = 'photo-overlay';
      overlay.innerHTML = `
        <span class="photo-author">${photo.author}</span>
        <span class="photo-action">${svg('Plus', 12)} Add</span>
      `;

      card.appendChild(img);
      card.appendChild(overlay);

      // Drag event
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/prosy-photo-url', photo.url);
        e.dataTransfer.setData('text/plain', photo.url);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', () => card.classList.remove('dragging'));

      // Click to insert / fill currently selected object
      card.addEventListener('click', () => this.insertPhoto(photo.url));

      this.grid.appendChild(card);
    });
  }

  async insertPhoto(url) {
    const active = this.canvas.getActiveObject();
    const ops = this.app.ops || this.app.objectOps;

    // 1. If user currently has a shape or placeholder selected, fill it!
    if (active && ops && (this.cm._isPlaceholderShape(active) || active.custom?.maskWrap || active.custom?.isPhotoPlaceholder)) {
      const hit = this.cm.findPlaceholderTarget(active);
      if (hit) {
        await ops.fillPlaceholderWithImage(hit, url);
        this.app.toast?.('Photo clipped into selected shape');
        if (this.app._closePhotosMenu) this.app._closePhotosMenu();
        if (this.app.closeMobileSheet) this.app.closeMobileSheet();
        return;
      }
    }

    // 2. Otherwise insert photo onto canvas center
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      if (!img) return;

      const maxDim = 600;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      img.scale(scale);

      const targetW = img.width * scale;
      const targetH = img.height * scale;

      img.set({
        left: (this.cm.PAGE_W - targetW) / 2,
        top: (this.cm.PAGE_H - targetH) / 2,
        originX: 'left',
        originY: 'top',
        name: 'Photo'
      });

      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.canvas.requestRenderAll();
      this.app.historyManager?.saveState();
      this.app.toast?.('Photo added to slide');
      if (this.app._closePhotosMenu) this.app._closePhotosMenu();
      if (this.app.closeMobileSheet) this.app.closeMobileSheet();
    } catch (e) {
      console.error('Failed to insert stock photo', e);
      this.app.toast?.('Could not load photo', true);
    }
  }
}
