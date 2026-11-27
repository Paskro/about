const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* Expandable cards (timeline periods and case stories). */
function setExpanded(button: HTMLButtonElement, expanded: boolean) {
  button.setAttribute('aria-expanded', String(expanded));
  const panel = document.getElementById(button.getAttribute('aria-controls') ?? '');
  panel?.toggleAttribute('data-open', expanded);
  const label = button.querySelector('[data-label]');
  if (label) label.textContent = (expanded ? button.dataset.hide : button.dataset.show) ?? '';
}

for (const card of document.querySelectorAll<HTMLElement>('[data-expandable]')) {
  const button = card.querySelector<HTMLButtonElement>('.toggle');
  if (!button) continue;
  setExpanded(button, false);
  // The button handles the keyboard; a click anywhere on the card is a bigger target for pointers.
  card.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.closest('a')) return;
    if (!target.closest('.toggle') && (target.closest('.details') || window.getSelection()?.toString())) return;
    setExpanded(button, button.getAttribute('aria-expanded') !== 'true');
  });
}

/* Photos open large in a dialog. Esc closes it (built in) and focus returns to the photo. */
for (const gallery of document.querySelectorAll<HTMLElement>('.house')) {
  const dialog = gallery.querySelector('dialog')!;
  const slot = dialog.querySelector('figure')!;
  let opener: HTMLAnchorElement | null = null;
  gallery.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-zoom]');
    // A modified click keeps its usual meaning, such as opening the file in a new tab.
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    opener = link;
    const figure = link.closest('figure')!;
    const image = figure.querySelector('img')!.cloneNode() as HTMLImageElement;
    image.loading = 'eager';
    slot.replaceChildren(image, figure.querySelector('figcaption')!.cloneNode(true));
    dialog.setAttribute('aria-label', image.alt);
    dialog.showModal();
  });
  // A click on the backdrop lands on the dialog element itself.
  dialog.addEventListener('click', (event) => event.target === dialog && dialog.close());
  dialog.addEventListener('close', () => opener?.focus());
}

/* Tag filters: matching periods are highlighted, the rest are dimmed. */
const chips = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const periods = [...document.querySelectorAll<HTMLElement>('.period')];
const statusLine = document.querySelector<HTMLElement>('[data-status]');

function applyFilters() {
  const selected = chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.dataset.filter!);
  let matches = 0;
  for (const period of periods) {
    const tags = (period.dataset.tags ?? '').split(' ');
    const match = selected.some((tag) => tags.includes(tag));
    if (match) matches++;
    period.classList.toggle('is-match', match);
    period.classList.toggle('is-dimmed', selected.length > 0 && !match);
    for (const label of period.querySelectorAll<HTMLElement>('[data-tag]')) {
      label.classList.toggle('is-selected', selected.includes(label.dataset.tag!));
    }
  }
  if (statusLine) {
    statusLine.textContent = selected.length
      ? statusLine.dataset.template!.replace('{count}', String(matches)).replace('{total}', String(periods.length))
      : '';
  }
}

for (const chip of chips) {
  chip.addEventListener('click', () => {
    chip.setAttribute('aria-pressed', String(chip.getAttribute('aria-pressed') !== 'true'));
    applyFilters();
  });
}

document.querySelector('[data-reset]')?.addEventListener('click', () => {
  for (const chip of chips) chip.setAttribute('aria-pressed', 'false');
  applyFilters();
});

/* The timeline line fills with colour while scrolling and the dots light up with it.
   With reduced motion the line is static: fully filled from the start. */
const timeline = document.querySelector<HTMLElement>('[data-timeline]');
const fill = document.querySelector<HTMLElement>('[data-fill]');

if (timeline && fill) {
  let frame = 0;
  const update = () => {
    frame = 0;
    const still = reducedMotion.matches;
    const front = still ? Infinity : window.innerHeight * 0.65;
    const { top, height } = timeline.getBoundingClientRect();
    fill.style.transform = still ? '' : `scaleY(${Math.min(1, Math.max(0, (front - top) / height))})`;
    for (const period of periods) period.classList.toggle('is-seen', period.getBoundingClientRect().top < front);
  };
  const schedule = () => {
    frame ||= requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // Expanding a card changes the height of the line.
  new ResizeObserver(schedule).observe(timeline);
  reducedMotion.addEventListener('change', schedule);
}
