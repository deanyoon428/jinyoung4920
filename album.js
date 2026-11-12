const grid = document.querySelector('#chapter-grid');
const filters = document.querySelector('.filters');
const viewer = document.querySelector('#photo-viewer');
const largePhoto = document.querySelector('#large-photo');
const caption = document.querySelector('#photo-caption');
const count = document.querySelector('#photo-count');
const close = document.querySelector('#close-viewer');
let visiblePhotos = [];
let position = 0;
let opener;

function make(tag, cls, label) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (label) node.textContent = label;
  return node;
}
function showPhoto() {
  const photo = visiblePhotos[position];
  largePhoto.src = 'photo-' + photo.webp;
  largePhoto.alt = photo.caption;
  caption.textContent = photo.caption;
  count.textContent = (position + 1) + ' / ' + visiblePhotos.length;
}
function move(delta) {
  position = (position + delta + visiblePhotos.length) % visiblePhotos.length;
  showPhoto();
}
function render(filter) {
  const shown = filter === 'all' ? chapters : chapters.filter(chapter => chapter.id === filter);
  visiblePhotos = shown.flatMap(chapter => chapter.photos);
  document.querySelector('#album-count').textContent = '사진 ' + visiblePhotos.length + '장';
  grid.replaceChildren();
  for (const chapter of shown) {
    const section = make('section', 'chapter');
    section.append(make('h3', '', chapter.title), make('p', 'sub', chapter.subtitle));
    const photos = make('div', 'photo-grid');
    for (const photo of chapter.photos) {
      const button = make('button', 'photo-button');
      button.type = 'button';
      button.setAttribute('aria-label', photo.caption + ' 크게 보기');
      const shell = make('span', 'photo-shell');
      const img = make('img');
      img.src = 'photo-' + photo.webp;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      shell.append(img);
      button.append(shell, make('span', 'photo-label', photo.caption));
      button.addEventListener('click', () => {
        opener = button;
        position = visiblePhotos.indexOf(photo);
        showPhoto();
        viewer.showModal();
      });
      photos.append(button);
    }
    section.append(photos);
    grid.append(section);
  }
}
function selectChapter(id) {
  for (const candidate of filters.children) candidate.setAttribute('aria-pressed', String(candidate.dataset.chapter === id));
  render(id);
}
for (const [id, title] of [['all', '전체'], ['mom', '엄마의 모습'], ['together', '함께한 날'],
    ['little', '작은 순간들'], ['birthday', '진영데이']]) {
  const button = make('button', '', title);
  button.type = 'button';
  button.dataset.chapter = id;
  button.setAttribute('aria-pressed', String(id === 'all'));
  button.addEventListener('click', () => selectChapter(id));
  filters.append(button);
}
close.addEventListener('click', () => viewer.close());
document.querySelector('#previous').addEventListener('click', () => move(-1));
document.querySelector('#next').addEventListener('click', () => move(1));
viewer.addEventListener('close', () => opener?.focus());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
for (const link of document.querySelectorAll('.chapter-link')) {
  link.addEventListener('click', () => selectChapter(link.dataset.chapter));
}
document.querySelector('.nav-link').addEventListener('click', () => selectChapter('all'));
let touchStart = null;
largePhoto.addEventListener('touchstart', event => {
  const touch = event.changedTouches[0];
  touchStart = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
largePhoto.addEventListener('touchend', event => {
  if (!touchStart) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStart.x;
  const dy = touch.clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
}, { passive: true });
largePhoto.addEventListener('touchcancel', () => { touchStart = null; });
render('all');
