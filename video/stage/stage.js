/**
 * The stage: renders one beat and animates it to the length of its narration.
 *
 * Every scene is driven by the beat's *audio duration*, passed in by the
 * recorder, so a line is never out of sync with the voice and a re-render of one
 * beat is independent of every other. Scenes are declarative (`scene.type`),
 * which is why a new episode is JSON rather than more HTML.
 *
 *   /?beat=04-tokens&duration=31.4
 */
const params = new URLSearchParams(location.search);
const beatId = params.get('beat');
const duration = Number(params.get('duration') ?? 8);

const canvas = document.getElementById('canvas');
const scene = document.getElementById('scene');
const caption = document.getElementById('caption');
const progress = document.getElementById('progress');

const data = await fetch(`/api/beat/${beatId}`).then((response) => {
  if (!response.ok) throw new Error(`no beat ${beatId}`);
  return response.json();
});

const { episode, beat, code, log, urls } = data;
const durationMs = duration * 1000;

/* ------------------------------------------------------------------ utilities */

const el = (tag, className, html) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
};

const at = (fraction, fn) => setTimeout(fn, Math.max(0, fraction * durationMs));

/** Figures, cards and rows all appear with the same small motion. */
const show = (node, className = 'on') => node.classList.add(className);

/* -------------------------------------------------------------------- scenes */

function renderFigure() {
  const hasList = Boolean(beat.scene.steps?.length || beat.scene.outro?.length);
  const figure = el(
    'div',
    `figure${beat.scene.outro ? ' outro' : ''}${hasList ? ' has-steps' : ''}`,
  );

  const image = el('img');
  image.src = `/figures/${beat.scene.figure}.png`;
  image.alt = beat.caption;
  figure.append(image);

  if (beat.scene.steps?.length) {
    const steps = el('div', 'figure-steps');
    const rows = beat.scene.steps.map((text, index) => {
      const row = el('div', 'figure-step', `<b>${index + 1}</b><span>${text}</span>`);
      steps.append(row);
      return row;
    });
    figure.append(steps);

    const span = 0.62 / rows.length;
    rows.forEach((row, index) => at(0.16 + index * span, () => show(row)));
  }

  if (beat.scene.outro?.length) {
    const steps = el('div', 'figure-steps');
    const rows = beat.scene.outro.map((text) => {
      const row = el('div', 'figure-step', `<span>${text}</span>`);
      steps.append(row);
      return row;
    });
    figure.append(steps);
    rows.forEach((row, index) => at(0.3 + index * 0.22, () => show(row)));
  }

  scene.append(figure);
  at(0.02, () => figure.classList.add('moving'));
}

function renderCards() {
  const wrap = el('div', 'cards');
  wrap.append(el('p', 'kicker', beat.scene.kicker));
  wrap.append(el('h1', null, beat.scene.title));

  const row = el('div', 'card-row');
  const cards = beat.scene.cards.map((card) => {
    const node = el(
      'article',
      `trap ${card.tone}`,
      `<span class="label">${card.label}</span><h2>${card.title}</h2><p>${card.body}</p>`,
    );
    row.append(node);
    return node;
  });

  wrap.append(row);
  scene.append(wrap);

  cards.forEach((card, index) => at(0.12 + index * 0.26, () => show(card)));
}

function renderTerminal() {
  const shell = el('div', 'shell');
  const heading = el(
    'div',
    'heading',
    `<h2>${beat.scene.title ?? log.title}</h2><span class="path">~/palette-demo</span>`,
  );
  shell.append(heading);

  const term = el('div', 'term');
  term.append(
    el(
      'div',
      'term-bar',
      `<span class="dots"><i></i><i></i><i></i></span><span>zsh — konopskidev</span>`,
    ),
  );

  const body = el('div', 'term-body');
  const rows = [];

  for (const step of log.steps) {
    rows.push({ kind: 'cmd', text: step.cmd });
    for (const line of step.out) {
      const cut = line.startsWith('…');
      rows.push({ kind: cut ? 'cut' : 'out', text: line });
    }
  }

  const nodes = rows.map((row) => {
    const node = el('div', `row${row.kind === 'cut' ? ' cut' : ''}`);
    node.textContent = row.kind === 'cmd' ? row.text : `  ${row.text}`;
    body.append(node);
    return node;
  });

  term.append(body);
  shell.append(term);
  scene.append(shell);

  // Commands get a beat of their own; output scrolls in line by line.
  const span = 0.76 / Math.max(1, nodes.length);
  nodes.forEach((node, index) => at(0.08 + index * span, () => show(node)));
}

/** The IDE shell: explorer, tabs, breadcrumb, and a typed-in editor. */
function ideShell({ file, compact = false }) {
  const parts = file.split('/');
  const name = parts.at(-1);

  const ide = el('div', 'ide');
  ide.append(
    el(
      'div',
      'ide-bar',
      `<span class="dots"><i></i><i></i><i></i></span><span>konopskidev</span>` +
        `<span class="title">${name} — konopskidev-ui</span><span>⌘P</span>`,
    ),
  );

  const main = el('div', 'ide-main');

  const styles = [
    'tokens.css',
    'theme.css',
    'globals.css',
    'utilities.css',
    'base.css',
    'prose.css',
    'variants.css',
  ];
  const explorer = el('div', 'explorer');
  explorer.append(el('div', 'root', 'Explorer'));
  const list = el('ul');
  list.append(el('li', 'dir', '<span class="swatch"></span> src'));
  list.append(el('li', 'dir', '<span class="swatch"></span> styles'));

  for (const style of styles) {
    const active = style === name ? ' active' : '';
    list.append(el('li', active, `<span class="swatch"></span>${style}`));
  }

  list.append(el('li', 'dir', '<span class="swatch"></span> components'));
  explorer.append(list);
  main.append(explorer);

  const editor = el('div', 'editor');
  const otherTabs = ['theme.css', 'globals.css'].filter((tab) => tab !== name);
  editor.append(
    el(
      'div',
      'tabs',
      `<span class="tab active">${name}</span>` +
        otherTabs.map((tab) => `<span class="tab">${tab}</span>`).join(''),
    ),
  );
  editor.append(
    el(
      'div',
      'breadcrumb',
      `${parts.slice(0, -1).join(' › ')}${compact ? '' : ' › '}${compact ? '' : name}`,
    ),
  );

  const codeBox = el('div', 'code');
  const lines = code.lines.map((line, index) => {
    const row = el('div', 'line');
    row.append(el('span', 'gutter', String(index + 1)));
    const src = el('span', 'src', line.html || ' ');
    row.append(src);
    const caret = el('span', 'caret blink');
    row.append(caret);
    codeBox.append(row);
    return { row, src, caret, length: line.text.length };
  });

  editor.append(codeBox);
  main.append(editor);
  ide.append(main);
  ide.append(
    el(
      'div',
      'ide-status',
      `<span class="branch">⎇ main</span><span>0 errors</span><span>0 warnings</span>` +
        `<span class="spacer"></span><span>Ln 1, Col 1</span><span>UTF-8</span><span>CSS</span><span>Prettier</span>`,
    ),
  );

  return { ide, lines };
}

/** Reveals the code left to right, one clip-path per line, with a caret. */
function typeCode(lines, { from = 0.06, to = 0.92 } = {}) {
  const total = lines.reduce((sum, line) => sum + Math.max(1, line.length), 0);
  const start = from * durationMs;
  const end = to * durationMs;

  let done = 0;
  let cursor = 0;

  const frame = () => {
    const elapsed = performance.now() - startedAt;
    const ratio = Math.max(0, Math.min(1, (elapsed - start) / (end - start)));
    const budget = Math.floor(ratio * total);

    while (cursor < lines.length && done + Math.max(1, lines[cursor].length) <= budget) {
      const line = lines[cursor];
      line.src.style.clipPath = 'inset(0 0 0 0)';
      line.src.classList.add('done');
      line.caret.remove();
      done += Math.max(1, line.length);
      cursor += 1;
    }

    lines.forEach((line, index) => {
      if (index < cursor) return;
      if (index > cursor) {
        line.src.style.clipPath = 'inset(0 100% 0 0)';
        line.caret.style.opacity = '0';
        return;
      }

      const revealed = Math.max(0, budget - done);
      const width = Math.max(1, line.length);
      line.src.style.clipPath = `inset(0 ${Math.round((1 - revealed / width) * 100)}% 0 0)`;
      line.caret.style.opacity = '1';
      /* Measured, not assumed: the split layout has a narrower gutter. */
      line.caret.style.left = `${line.src.offsetLeft + (revealed / width) * line.src.offsetWidth}px`;
      line.row.classList.add('hot');
    });

    lines.forEach((line, index) => {
      if (index !== cursor - 1 && index !== cursor) line.row.classList.remove('hot');
    });

    if (ratio < 1) requestAnimationFrame(frame);
  };

  let startedAt = performance.now();
  requestAnimationFrame(frame);
}

function renderIde() {
  const { ide, lines } = ideShell({ file: beat.scene.file });
  scene.append(ide);
  typeCode(lines, { from: beat.scene.typeUntil ?? 0.08, to: 0.9 });
}

function browserChrome({ url, label }) {
  const browser = el('div', 'browser');
  browser.append(
    el(
      'div',
      'browser-bar',
      `<span class="dots"><i></i><i></i><i></i></span>` +
        `<span class="url">${url}</span><span class="theme-pill">${label}</span>`,
    ),
  );
  const frame = el('iframe');
  frame.src = url;
  browser.append(frame);
  return { browser, frame, pill: browser.querySelector('.theme-pill') };
}

function renderSplit() {
  const split = el('div', 'split');

  const { ide, lines } = ideShell({ file: beat.scene.file, compact: true });
  split.append(ide);

  const { browser, frame, pill } = browserChrome({
    url: beat.scene.preview === 'storybook' ? urls.storybook : urls.preview,
    label: 'light',
  });
  split.append(browser);
  scene.append(split);

  typeCode(lines, { from: 0.08, to: 0.92 });

  const themeAt = beat.scene.themeAt;
  if (themeAt) {
    at(themeAt, () => {
      pill.textContent = 'dark';
      frame.contentWindow?.postMessage({ theme: 'dark' }, '*');
    });
  }

  if (beat.scene.scrollTo) {
    at(beat.scene.scrollTo, () => frame.contentWindow?.postMessage({ scroll: 0.55 }, '*'));
  }
}

function renderPreview() {
  const wrap = el('div', 'preview');
  /* Storybook is served under a path prefix, so the path is appended, not
     assigned: `new URL('/iframe.html', base)` would drop /storybook. */
  const target = `${urls.storybook.replace(/\/$/, '')}/${beat.scene.path}`;

  const { browser, frame, pill } = browserChrome({
    url: `localhost:6006/${beat.scene.path}`,
    label: 'light',
  });
  frame.src = target;
  wrap.append(browser);
  scene.append(wrap);

  if (beat.scene.themeAt) {
    at(beat.scene.themeAt, () => {
      pill.textContent = 'dark';
      const dark = new URL(target);
      dark.searchParams.set('globals', 'theme:dark');
      frame.src = dark.href;
    });
  }
}

/* ---------------------------------------------------------------------- boot */

caption.append(el('span', 'series', `${episode.subtitle ?? ''}`), el('span', null, beat.caption));

const renderers = {
  figure: renderFigure,
  cards: renderCards,
  terminal: renderTerminal,
  ide: renderIde,
  'ide-split': renderSplit,
  preview: renderPreview,
};

const render = renderers[beat.scene.type];
if (!render) throw new Error(`unknown scene type ${beat.scene.type}`);
render();

const startedAt = performance.now();

const tick = () => {
  const elapsed = performance.now() - startedAt;
  progress.style.width = `${Math.min(100, (elapsed / durationMs) * 100)}%`;

  if (elapsed >= durationMs && !window.__STAGE_DONE) {
    window.__STAGE_DONE = true;
    canvas.classList.add('done');
    return;
  }
  requestAnimationFrame(tick);
};

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    canvas.classList.add('ready');
    window.__STAGE_READY = true;
    requestAnimationFrame(tick);
  });
});
