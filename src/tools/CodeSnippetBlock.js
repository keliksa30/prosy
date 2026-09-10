import * as fabric from 'fabric';

/**
 * Programming languages metadata for Code Snippets
 */
export const CODE_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', ext: '.js' },
  { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'python', name: 'Python', ext: '.py' },
  { id: 'html', name: 'HTML / CSS', ext: '.html' },
  { id: 'json', name: 'JSON', ext: '.json' },
  { id: 'sql', name: 'SQL', ext: '.sql' },
  { id: 'rust', name: 'Rust', ext: '.rs' },
  { id: 'go', name: 'Go', ext: '.go' }
];

export const CODE_THEMES = {
  'one-dark': {
    name: 'One Dark',
    bg: '#1e1e2e',
    headerBg: '#181825',
    border: '#313244',
    text: '#cdd6f4',
    keyword: '#cba6f7',
    string: '#a6e3a1',
    number: '#fab387',
    comment: '#6c7086',
    function: '#89b4fa',
    lineNum: '#585b70'
  },
  'dracula': {
    name: 'Dracula',
    bg: '#282a36',
    headerBg: '#21222c',
    border: '#44475a',
    text: '#f8f8f2',
    keyword: '#ff79c6',
    string: '#f1fa8c',
    number: '#bd93f9',
    comment: '#6272a4',
    function: '#50fa7b',
    lineNum: '#6272a4'
  },
  'github-light': {
    name: 'GitHub Light',
    bg: '#ffffff',
    headerBg: '#f6f8fa',
    border: '#d0d7de',
    text: '#24292f',
    keyword: '#cf222e',
    string: '#0a3069',
    number: '#0550ae',
    comment: '#6e7781',
    function: '#8250df',
    lineNum: '#8c959f'
  },
  'monokai': {
    name: 'Monokai',
    bg: '#272822',
    headerBg: '#1e1f1c',
    border: '#3e3d32',
    text: '#f8f8f2',
    keyword: '#f92672',
    string: '#e6db74',
    number: '#ae81ff',
    comment: '#75715e',
    function: '#a6e22e',
    lineNum: '#75715e'
  }
};

const KEYWORDS_SET = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'import', 'export', 'from', 'class', 'async', 'await', 'try', 'catch',
  'def', 'self', 'print', 'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE',
  'DELETE', 'pub', 'fn', 'impl', 'struct', 'package', 'type', 'switch',
  'case', 'break', 'default', 'true', 'false', 'null', 'undefined', 'None',
  'new', 'this', 'throw', 'typeof', 'interface', 'extends', 'implements'
]);

/**
 * Tokenize a single line of code for basic syntax coloring
 */
function tokenizeCodeLine(line) {
  const tokens = [];
  let i = 0;
  while (i < line.length) {
    // Comment
    if ((line[i] === '/' && line[i + 1] === '/') || line[i] === '#') {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }
    // String
    const c = line[i];
    if (c === '"' || c === "'" || c === '`') {
      let end = i + 1;
      while (end < line.length && (line[end] !== c || line[end - 1] === '\\')) end++;
      tokens.push({ text: line.slice(i, end + 1), type: 'string' });
      i = end + 1;
      continue;
    }
    // Identifier / Keyword
    const idMatch = line.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
    if (idMatch) {
      const word = idMatch[0];
      const isKw = KEYWORDS_SET.has(word);
      const isFunc = line.slice(i + word.length).trim().startsWith('(');
      tokens.push({ text: word, type: isKw ? 'keyword' : (isFunc ? 'function' : 'text') });
      i += word.length;
      continue;
    }
    // Number
    const numMatch = line.slice(i).match(/^\d+(\.\d+)?/);
    if (numMatch) {
      tokens.push({ text: numMatch[0], type: 'number' });
      i += numMatch[0].length;
      continue;
    }
    // Any other char
    tokens.push({ text: line[i], type: 'text' });
    i++;
  }
  return tokens;
}

/**
 * Render code snippet card onto a high-DPI HTML Canvas
 */
export function renderCodeSnippetCanvas({
  code = 'const greeting = "Hello, World!";\nconsole.log(greeting);',
  lang = 'javascript',
  theme = 'one-dark',
  showLineNumbers = true,
  width = 560
} = {}) {
  const themeObj = CODE_THEMES[theme] || CODE_THEMES['one-dark'];
  const langObj = CODE_LANGUAGES.find(l => l.id === lang) || CODE_LANGUAGES[0];

  const lines = code.split('\n');
  const lineH = 22;
  const paddingY = 16;
  const headerH = 38;
  const contentH = Math.max(lines.length * lineH + paddingY * 2, 80);
  const totalH = headerH + contentH;

  const dpr = 2; // Retina sharpness
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(totalH * dpr);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // 1. Window Card Background
  ctx.fillStyle = themeObj.bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, totalH, 10);
  ctx.fill();
  ctx.strokeStyle = themeObj.border;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 2. macOS Window Titlebar
  ctx.fillStyle = themeObj.headerBg;
  ctx.beginPath();
  ctx.roundRect(0, 0, width, headerH, [10, 10, 0, 0]);
  ctx.fill();

  // Titlebar bottom border
  ctx.strokeStyle = themeObj.border;
  ctx.beginPath();
  ctx.moveTo(0, headerH);
  ctx.lineTo(width, headerH);
  ctx.stroke();

  // 3. macOS Window Traffic Light Controls (Red, Yellow, Green)
  const dots = [
    { color: '#ff5f56', x: 18 },
    { color: '#ffbd2e', x: 34 },
    { color: '#27c93f', x: 50 }
  ];
  dots.forEach(d => {
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(d.x, 19, 5.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 4. Filename / Language Pill
  ctx.fillStyle = themeObj.text;
  ctx.globalAlpha = 0.8;
  ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`snippet${langObj.ext} — ${langObj.name}`, width / 2, 23);
  ctx.globalAlpha = 1.0;

  // 5. Code Lines with Syntax Tokens & Line Numbers
  const codeStartX = showLineNumbers ? 54 : 20;
  const startY = headerH + paddingY + 14;

  lines.forEach((line, lineIdx) => {
    const y = startY + lineIdx * lineH;

    // Line number
    if (showLineNumbers) {
      ctx.textAlign = 'right';
      ctx.font = '12px "JetBrains Mono", "Fira Code", Menlo, monospace';
      ctx.fillStyle = themeObj.lineNum;
      ctx.fillText(String(lineIdx + 1), 38, y);
    }

    // Code Tokens
    ctx.textAlign = 'left';
    ctx.font = '13px "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace';

    const tokens = tokenizeCodeLine(line);
    let curX = codeStartX;

    tokens.forEach(tok => {
      let col = themeObj.text;
      if (tok.type === 'keyword') col = themeObj.keyword;
      else if (tok.type === 'string') col = themeObj.string;
      else if (tok.type === 'number') col = themeObj.number;
      else if (tok.type === 'comment') col = themeObj.comment;
      else if (tok.type === 'function') col = themeObj.function;

      ctx.fillStyle = col;
      ctx.fillText(tok.text, curX, y);
      curX += ctx.measureText(tok.text).width;
    });
  });

  return { canvas, width, height: totalH };
}

/**
 * Creates a pixel-perfect macOS-styled code window card Fabric Image
 */
export function createCodeSnippetGroup(options = {}) {
  const {
    code = 'const greeting = "Hello, World!";\nconsole.log(greeting);',
    lang = 'javascript',
    theme = 'one-dark',
    showLineNumbers = true,
    left = 200,
    top = 200,
    width = 560
  } = options;

  const { canvas, height } = renderCodeSnippetCanvas({
    code,
    lang,
    theme,
    showLineNumbers,
    width
  });

  const img = new fabric.FabricImage(canvas, {
    left,
    top,
    scaleX: 0.5,
    scaleY: 0.5,
    originX: 'left',
    originY: 'top',
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.35)',
      blur: 24,
      offsetX: 0,
      offsetY: 10
    })
  });

  img.isCodeSnippet = true;
  img.name = 'Code Snippet';
  img.codeData = {
    code,
    lang,
    theme,
    showLineNumbers,
    width
  };

  return img;
}

/**
 * Update an existing Code Snippet image with new code / options
 */
export function updateCodeSnippet(img, options = {}) {
  const merged = { ...img.codeData, ...options };
  const { canvas } = renderCodeSnippetCanvas(merged);

  img.setElement(canvas);
  img.setCoords();
  img.codeData = merged;
  img.dirty = true;
  return img;
}
