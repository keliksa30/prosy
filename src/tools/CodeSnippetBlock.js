import * as fabric from 'fabric';

/**
 * Syntax Tokenizer for Code Snippets
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
    bg: '#181a1f',
    headerBg: '#21252b',
    border: '#2c313c',
    text: '#abb2bf',
    keyword: '#c678dd',
    string: '#98c379',
    number: '#d19a66',
    comment: '#5c6370',
    function: '#61afef',
    tag: '#e06c75',
    lineNum: '#4b5263'
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
    tag: '#ff5555',
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
    tag: '#116329',
    lineNum: '#8c959f'
  }
};

/**
 * Creates a macOS-styled code window card as a Fabric Group
 */
export function createCodeSnippetGroup({
  code = 'const greeting = "Hello, World!";\nconsole.log(greeting);',
  lang = 'javascript',
  theme = 'one-dark',
  showLineNumbers = true,
  left = 200,
  top = 200,
  width = 560
} = {}) {
  const themeObj = CODE_THEMES[theme] || CODE_THEMES['one-dark'];
  const langObj = CODE_LANGUAGES.find(l => l.id === lang) || CODE_LANGUAGES[0];

  const lines = code.split('\n');
  const lineH = 22;
  const padding = 20;
  const headerH = 38;
  const contentH = Math.max(lines.length * lineH + padding * 2, 100);
  const totalH = headerH + contentH;

  // Window background card
  const bg = new fabric.Rect({
    width,
    height: totalH,
    fill: themeObj.bg,
    stroke: themeObj.border,
    strokeWidth: 1,
    rx: 10,
    ry: 10,
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.35)',
      blur: 24,
      offsetX: 0,
      offsetY: 10
    })
  });

  // Header background
  const header = new fabric.Rect({
    width,
    height: headerH,
    fill: themeObj.headerBg,
    stroke: themeObj.border,
    strokeWidth: 1,
    rx: 10,
    ry: 10,
    top: 0,
    left: 0
  });

  // Header bottom border cover (so only top corners are rounded)
  const headerCover = new fabric.Rect({
    width,
    height: 12,
    fill: themeObj.headerBg,
    top: headerH - 12,
    left: 0
  });

  // Header divider line
  const divider = new fabric.Line([0, headerH, width, headerH], {
    stroke: themeObj.border,
    strokeWidth: 1
  });

  // macOS window control dots (red, yellow, green)
  const dotR = new fabric.Circle({ radius: 5.5, fill: '#ff5f56', left: 16, top: 14 });
  const dotY = new fabric.Circle({ radius: 5.5, fill: '#ffbd2e', left: 32, top: 14 });
  const dotG = new fabric.Circle({ radius: 5.5, fill: '#27c93f', left: 48, top: 14 });

  // Title / Filename badge
  const titleText = new fabric.Text(`snippet${langObj.ext} — ${langObj.name}`, {
    left: width / 2,
    top: 13,
    originX: 'center',
    fontSize: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '600',
    fill: themeObj.text,
    opacity: 0.75
  });

  // Code line numbers (optional)
  const lineNumText = showLineNumbers ? lines.map((_, i) => String(i + 1).padStart(2, ' ')).join('\n') : '';
  const numCol = new fabric.Text(lineNumText, {
    left: 20,
    top: headerH + padding,
    fontSize: 13,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    lineHeight: lineH / 13,
    fill: themeObj.lineNum,
    selectable: false
  });

  // Code body
  const codeLeft = showLineNumbers ? 54 : 24;
  const codeBody = new fabric.Text(code, {
    left: codeLeft,
    top: headerH + padding,
    fontSize: 13,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    lineHeight: lineH / 13,
    fill: themeObj.text,
    selectable: false
  });

  const elements = [bg, header, headerCover, divider, dotR, dotY, dotG, titleText];
  if (showLineNumbers) elements.push(numCol);
  elements.push(codeBody);

  const group = new fabric.Group(elements, {
    left,
    top,
    subTargetCheck: false,
    interactive: true
  });

  // Attach metadata
  group.isCodeSnippet = true;
  group.codeData = {
    code,
    lang,
    theme,
    showLineNumbers,
    width
  };

  return group;
}
