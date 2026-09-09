import './styles/variables.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/canvas.css';

import * as fabric from 'fabric';
window.fabric = fabric;
import { EditorApp } from './core/EditorApp.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the Editor Application
  const app = new EditorApp(document.getElementById('app'));
  window.__editorApp = app;
  app.init();
});
