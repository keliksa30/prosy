import * as fabric from 'fabric';
import { svg } from '../ui/icons.js';
import { PageManager } from './PageManager.js';

export class PresentationMode {
  constructor(app) {
    this.app = app;
    this.pageManager = app.pageManager;
    this.canvasManager = app.canvasManager;
    this.active = false;
    this.currentIndex = 0;
    this.laserActive = false;

    this.overlay = null;
    this.slideImg = null;
    this.counterEl = null;
    this.controlBar = null;
    this.laserEl = null;
    this._idleTimer = null;
    this._keydownHandler = this._handleKeydown.bind(this);
    this._fullscreenChangeHandler = this._handleFullscreenChange.bind(this);
    this._mouseMoveHandler = this._handleMouseMove.bind(this);
  }

  async start() {
    if (this.active) return;
    this.pageManager.saveCurrentPage();
    this.currentIndex = this.pageManager.currentIndex || 0;
    this.active = true;

    this._buildUI();
    document.body.appendChild(this.overlay);

    // Request HTML5 Fullscreen
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request bypassed or denied:', err);
    }

    document.addEventListener('keydown', this._keydownHandler);
    document.addEventListener('fullscreenchange', this._fullscreenChangeHandler);
    document.addEventListener('webkitfullscreenchange', this._fullscreenChangeHandler);
    document.addEventListener('mousemove', this._mouseMoveHandler);

    await this.renderSlide(this.currentIndex);
  }

  exit() {
    if (!this.active) return;
    this.active = false;

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } catch (err) {}
    }

    document.removeEventListener('keydown', this._keydownHandler);
    document.removeEventListener('fullscreenchange', this._fullscreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', this._fullscreenChangeHandler);
    document.removeEventListener('mousemove', this._mouseMoveHandler);

    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    // Switch editor back to slide
    if (this.pageManager && this.pageManager.currentIndex !== this.currentIndex) {
      this.pageManager.switchToPage(this.currentIndex);
    }
  }

  _buildUI() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'present-overlay';

    // Slide viewport container (maintains 16:9 ratio)
    const viewport = document.createElement('div');
    viewport.className = 'present-viewport';

    this.slideImg = document.createElement('img');
    this.slideImg.className = 'present-slide';
    this.slideImg.alt = 'Presentation Slide';
    viewport.appendChild(this.slideImg);

    // Click on left/right half of screen navigates
    viewport.addEventListener('click', (e) => {
      if (this.laserActive) return;
      const rect = viewport.getBoundingClientRect();
      const x = e.clientX - rect.left;
      if (x < rect.width * 0.35) {
        this.prevSlide();
      } else if (x > rect.width * 0.65) {
        this.nextSlide();
      }
    });

    this.overlay.appendChild(viewport);

    // Laser pointer dot
    this.laserEl = document.createElement('div');
    this.laserEl.className = 'present-laser';
    this.laserEl.style.display = 'none';
    this.overlay.appendChild(this.laserEl);

    // Bottom floating controller pill
    this.controlBar = document.createElement('div');
    this.controlBar.className = 'present-controls';

    const btnPrev = document.createElement('button');
    btnPrev.className = 'present-btn';
    btnPrev.title = 'Previous slide (←)';
    btnPrev.innerHTML = svg('ChevronLeft', 16);
    btnPrev.onclick = (e) => { e.stopPropagation(); this.prevSlide(); };

    this.counterEl = document.createElement('span');
    this.counterEl.className = 'present-counter';
    this.counterEl.textContent = `${this.currentIndex + 1} / ${this.pageManager.pages.length}`;

    const btnNext = document.createElement('button');
    btnNext.className = 'present-btn';
    btnNext.title = 'Next slide (→)';
    btnNext.innerHTML = svg('ChevronRight', 16);
    btnNext.onclick = (e) => { e.stopPropagation(); this.nextSlide(); };

    const divider = document.createElement('div');
    divider.className = 'present-divider';

    const btnLaser = document.createElement('button');
    btnLaser.className = 'present-btn';
    btnLaser.title = 'Laser pointer (L)';
    btnLaser.innerHTML = svg('Sparkles', 16);
    btnLaser.onclick = (e) => {
      e.stopPropagation();
      this.toggleLaser();
      btnLaser.classList.toggle('active', this.laserActive);
    };

    const btnExit = document.createElement('button');
    btnExit.className = 'present-btn';
    btnExit.title = 'Exit presentation (Esc)';
    btnExit.innerHTML = svg('X', 16);
    btnExit.onclick = (e) => { e.stopPropagation(); this.exit(); };

    this.controlBar.appendChild(btnPrev);
    this.controlBar.appendChild(this.counterEl);
    this.controlBar.appendChild(btnNext);
    this.controlBar.appendChild(divider);
    this.controlBar.appendChild(btnLaser);
    this.controlBar.appendChild(btnExit);

    this.overlay.appendChild(this.controlBar);
  }

  toggleLaser() {
    this.laserActive = !this.laserActive;
    if (this.laserEl) {
      this.laserEl.style.display = this.laserActive ? 'block' : 'none';
    }
    if (this.overlay) {
      this.overlay.style.cursor = this.laserActive ? 'none' : 'default';
    }
  }

  _handleMouseMove(e) {
    if (!this.active) return;

    if (this.laserActive && this.laserEl) {
      this.laserEl.style.left = `${e.clientX}px`;
      this.laserEl.style.top = `${e.clientY}px`;
    }

    if (this.controlBar) {
      this.controlBar.classList.remove('hidden');
      clearTimeout(this._idleTimer);
      this._idleTimer = setTimeout(() => {
        if (this.active && !this.laserActive) {
          this.controlBar?.classList.add('hidden');
        }
      }, 3000);
    }
  }

  _handleFullscreenChange() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && this.active) {
      this.exit();
    }
  }

  _handleKeydown(e) {
    if (!this.active) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      this.nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      this.prevSlide();
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'f') {
      e.preventDefault();
      this.exit();
    } else if (e.key.toLowerCase() === 'l') {
      e.preventDefault();
      this.toggleLaser();
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.renderSlide(this.currentIndex);
    }
  }

  nextSlide() {
    if (this.currentIndex < this.pageManager.pages.length - 1) {
      this.currentIndex++;
      this.renderSlide(this.currentIndex);
    }
  }

  async renderSlide(index) {
    const page = this.pageManager.pages[index];
    if (!page) return;

    if (this.counterEl) {
      this.counterEl.textContent = `${index + 1} / ${this.pageManager.pages.length}`;
    }

    // Render page offscreen for pixel-perfect clarity
    const W = this.canvasManager.PAGE_W;
    const H = this.canvasManager.PAGE_H;
    const el = document.createElement('canvas');
    el.width = W;
    el.height = H;
    const sc = new fabric.StaticCanvas(el, { width: W, height: H, enableRetinaScaling: false });

    try {
      const json = PageManager.normalizeJson(page.canvas_json);
      sc.backgroundColor = json.backgroundColor || '#ffffff';
      await sc.loadFromJSON(json);
      sc.renderAll();
      const dataUrl = sc.toDataURL({ format: 'jpeg', quality: 0.95 });
      if (this.slideImg) {
        this.slideImg.src = dataUrl;
      }
    } catch (err) {
      console.error('Failed to render presentation slide', err);
    } finally {
      sc.dispose && sc.dispose();
    }
  }
}
