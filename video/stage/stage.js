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

const { episode, beat, code, log, urls, terminal } = data;
const durationMs = duration * 1000;

/* A scene may need something loaded before it can be filmed. */
let untilReady = Promise.resolve();
let replay = null;

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

/**
 * The real session, filmed by VHS, playing inside the card. Nothing here is
 * replayed text: the clip is a pty and the output in it is the shell's.
 */
function renderTerminal() {
  const shell = el('div', 'shell');
  const heading = el(
    'div',
    'heading',
    `<h2>${beat.scene.title ?? log.title}</h2><span class="path">~/palette-demo</span>`,
  );
  shell.append(heading);

  const term = el('div', 'term');
  const video = el('video');
  video.src = terminal.url;
  video.width = terminal.width;
  video.height = terminal.height;
  video.muted = true;
  video.playsInline = true;
  term.append(video);
  shell.append(term);
  scene.append(shell);

  /* The recorder must not start on a black card, and the clip must start on
     the beat, not when the browser felt like decoding it. */
  replay = video;
  untilReady = new Promise((resolve) => {
    if (video.readyState >= 2) return resolve();
    video.addEventListener('loadeddata', resolve, { once: true });
  });
}

/** A browser pane: real chrome drawn by the stage, a live server inside it. */
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

requestAnimationFrame(async () => {
  await untilReady;
  await new Promise((resolve) => requestAnimationFrame(resolve));

  canvas.classList.add('ready');
  caption.classList.add('on');
  replay?.play().catch(() => {});
  window.__STAGE_READY = true;
  requestAnimationFrame(tick);
});
