import { createFoxMotion } from './fox-motion.js';
import { createAssets } from './world-assets.js';
import { games as catalog } from './adventure-data.js';
import { createEnvironment } from './environments.js';
import { createCoinTrail } from './coin-trail.js';

const $ = id => document.getElementById(id);
const imageViewer = document.createElement('dialog');
imageViewer.className = 'image-viewer';
imageViewer.setAttribute('aria-label', 'Project image');
const closeImage = document.createElement('button');
closeImage.type = 'button';
closeImage.textContent = 'Close ×';
const enlargedImage = document.createElement('img');
imageViewer.append(closeImage, enlargedImage);
document.body.append(imageViewer);
closeImage.addEventListener('click', () => imageViewer.close());
imageViewer.addEventListener('click', event => { if (event.target === imageViewer) imageViewer.close(); });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let selected = 0;
let moveScene = () => {};
const visited = new Set([0]);
const flocking = catalog.find(game => game.title === 'Flocking Simulation');
const games = [...catalog];
const featuredOrder = ['Flocking Simulation', 'ZIGIT', 'Jelly Tap Blast', 'Bubble Shooter', 'Animals & Coins'];
const featuredGames = featuredOrder.map(title => games.find(game => game.title === title)).filter(Boolean);
const firstFeaturedIndex = Math.min(...featuredGames.map(game => games.indexOf(game)));
for (const game of featuredGames) games.splice(games.indexOf(game), 1);
games.splice(firstFeaturedIndex, 0, ...featuredGames);
const cards = games.map((game, i) => {
  const card = document.createElement('article');
  card.className = 'island-card';
  card.setAttribute('aria-label', game.title);
  const top = document.createElement('div'); top.className = 'board-top';
  top.textContent = `${String(i + 1).padStart(2, '0')} / ${game.category}`;
  const image = document.createElement('img'); image.src = game.image; image.alt = `${game.title} artwork`;
  const imageButton = document.createElement('button');
  imageButton.type = 'button';
  imageButton.className = 'board-image';
  imageButton.setAttribute('aria-label', `Enlarge ${game.title} image`);
  imageButton.append(image);
  const classifyImage = () => imageButton.classList.toggle('portrait', image.naturalHeight > image.naturalWidth * 1.2);
  image.addEventListener('load', classifyImage);
  if (image.complete) classifyImage();
  imageButton.addEventListener('click', () => {
    enlargedImage.src = image.src;
    enlargedImage.alt = image.alt;
    imageViewer.showModal();
  });
  const copy = document.createElement('div'); copy.className = 'board-copy';
  const platform = document.createElement('p'); platform.className = 'eyebrow'; platform.textContent = game.platform;
  const title = document.createElement('h2'); title.textContent = game.title;
  const description = document.createElement('p'); description.className = 'board-description';
  description.textContent = game.description.split(/(?<=\.)\s/)[0];
  const links = document.createElement('div'); links.className = 'board-links';
  (game.links || []).forEach(([label, url]) => {
    const a = document.createElement('a'); a.textContent = `${label} ↗`; a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; links.append(a);
  });
  copy.append(platform, title, description, links);
  card.append(top);
  if (game.title !== 'ZIGIT') card.append(imageButton);
  card.append(copy);
  $('island-cards').append(card); return card;
});
const buttons = games.map((game, i) => {
  const button = document.createElement('button');
  button.title = `${i + 1}. ${game.title}`;
  button.setAttribute('aria-label', `Climb to ${game.title}`);
  button.addEventListener('click', () => select(i));
  $('stops').append(button);
  return button;
});
function select(index) {
  selected = Math.max(0, Math.min(games.length - 1, index));
  visited.add(selected);
  const game = games[selected];
  $('current-game').textContent = `${selected + 1} of ${games.length}: ${game.title}`;
  cards.forEach((card, i) => {card.classList.toggle('active', i === selected); card.inert = i !== selected;});
  $('progress').textContent = `${String(selected + 1).padStart(2, '0')} / ${games.length}`;
  $('altitude').textContent = String(selected * 6).padStart(2, '0');
  $('down').disabled = selected === 0;
  $('up').disabled = selected === games.length - 1;
  buttons.forEach((b, i) => { b.setAttribute('aria-current', String(i === selected)); b.classList.toggle('visited', visited.has(i) && i !== selected); });
  moveScene(selected);
}
$('up').addEventListener('click', () => select(selected + 1));
$('down').addEventListener('click', () => select(selected - 1));
// Vertical swipes on the world move one island; links and controls keep their taps.
let swipe = null;
const playArea = document.querySelector('main');
playArea.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch') return;
  if (!event.isPrimary) { swipe = null; return; }
  if (event.target.closest('a, button, .trail, .coin-quest')) return;
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
playArea.addEventListener('pointerup', event => {
  if (!swipe || swipe.id !== event.pointerId) return;
  const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
  swipe = null;
  if (Math.abs(dy) >= 40 && Math.abs(dy) > Math.abs(dx) * 1.4) select(selected + (dy < 0 ? 1 : -1));
});
playArea.addEventListener('pointercancel', () => { swipe = null; });
const touchControls = matchMedia('(pointer: coarse)');
const narrowScreen = matchMedia('(max-width:700px)');
function updateControlHint() {
  document.querySelector('.controls small').textContent = touchControls.matches || narrowScreen.matches ? 'Swipe up / down or tap arrows' : '↑ ↓ · W / S · scroll to climb';
}
touchControls.addEventListener('change', updateControlHint);
narrowScreen.addEventListener('change', updateControlHint);
updateControlHint();
let lastKey = 0;
let wheelTotal = 0;
let wheelLock = false;
window.addEventListener('keydown', event => {
  if (imageViewer.open) return;
  if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
  const direction = ['ArrowUp', 'w', 'W'].includes(event.key) ? 1 : ['ArrowDown', 's', 'S'].includes(event.key) ? -1 : 0;
  if (!direction) return;
  event.preventDefault();
  if (event.repeat && performance.now() - lastKey < 350) return;
  lastKey = performance.now(); select(selected + direction);
});
window.addEventListener('wheel', event => {
  if (imageViewer.open) return;
  if (event.ctrlKey || event.metaKey || event.shiftKey || wheelLock) return;
  // Track a small amount of trackpad movement before changing level. This
  // prevents one natural wheel gesture from skipping several islands.
  wheelTotal += event.deltaY;
  if (Math.abs(wheelTotal) < 42) return;
  const direction = wheelTotal > 0 ? -1 : 1;
  wheelTotal = 0;
  const next = selected + direction;
  if (next === selected) return;
  event.preventDefault();
  wheelLock = true;
  select(next);
  window.setTimeout(() => { wheelLock = false; }, 420);
}, { passive: false });
select(0);

try {
  const THREE = await import('./vendor/three.module.js');
  const { CSS3DRenderer, CSS3DObject } = await import('./vendor/CSS3DRenderer.js');
  startWorld(THREE, CSS3DRenderer, CSS3DObject);
  $('scene-status').textContent = '';
} catch (error) {
  console.error('The woodland could not start:', error);
  $('scene-status').textContent = 'The 3D woodland is unavailable here. You can still explore every game with the arrows below.';
}

function startWorld(T, CSS3DRenderer, CSS3DObject) {
  const host = $('world');
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, touchControls.matches ? 1.35 : 1.75));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.setClearColor(0xeeeeE3, 0);
  host.append(renderer.domElement);
  renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); $('scene-status').textContent = 'The woodland paused. Reload to restore 3D, or keep exploring with the arrows.'; });
  const scene = new T.Scene();
  const environment = createEnvironment(document.querySelector('main'), reduced);
  const boardScene = new T.Scene();
  const boardRenderer = new CSS3DRenderer({element: $('island-cards')});
  document.body.classList.add('world-ready');
  const boards = [];
  scene.fog = new T.Fog(0xeeeee3, 38, 85);
  scene.add(new T.HemisphereLight(0xdbeaf3, 0x52634c, 1.65));
  const sun = new T.DirectionalLight(0xffe9c5, 3.1); sun.position.set(-8, 16, 12); scene.add(sun);
  sun.castShadow = true;
  sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048);
  Object.assign(sun.shadow.camera,{left:-8,right:8,top:11,bottom:-9,near:1,far:48});
  sun.shadow.normalBias = .035; sun.shadow.bias = -.00015;
  scene.add(sun.target);
  const assets = createAssets(T);
  const fill = new T.DirectionalLight(0xd5e9e5, 1.2); fill.position.set(9, 5, -10); scene.add(fill);
  const camera = new T.OrthographicCamera(-12, 12, 10, -10, .1, 150);
  const mats = {};
  function material(color) { return mats[color] ||= new T.MeshStandardMaterial({color, roughness:1, flatShading:true}); }
  function mesh(geometry, color, x, y, z, parent = scene) {
    const object = new T.Mesh(geometry, material(color)); object.position.set(x,y,z); parent.add(object); return object;
  }
  function box(w,h,d,c,x,y,z,p) { return mesh(new T.BoxGeometry(w,h,d),c,x,y,z,p); }
  function cone(r,h,c,x,y,z,p,vertices=5) { return mesh(new T.ConeGeometry(r,h,vertices),c,x,y,z,p); }
  const step = 6;
  const colors = [0x9cab82,0x8ea98b,0xaeb389,0x88a9a0,0xab9f8a,0x969db0,0x95a77d,0xb0a083,0x9bab8b,0x96a697,0xacad87].reverse();
  const islands = [];
  for (let i=0;i<games.length;i++) {
    const g = new T.Group(); g.position.set(0,i*step,0); scene.add(g); islands.push(g);
    const side = i%2 === 0 ? -1 : 1;
    const cx = side*2.1;
    assets.island(g,cx,i,colors[i]);
    // Each HTML board has an actual world transform, carried by its own island.
    const board = new CSS3DObject(cards[i]);
    board.position.set(cx+side*.65, i*step+3.2, .6);
    board.scale.setScalar(.0098);
    board.rotation.set(-.035, Math.atan2(9,13)-side*.16, -side*.045);
    boardScene.add(board); boards.push(board);
    for (const offset of [-.85,.85]) {
      box(.15,2.2,.16,0x806047,cx+side*.65+offset,1.1,.6-offset*.69,g);
      box(.24,.12,.26,0xa8895e,cx+side*.65+offset,.08,.6-offset*.69,g);
    }
    // Ladders remain aligned so the fox can climb continuously in either direction.
    if(i<games.length-1) assets.ladder(g,step);
    assets.lantern(g,.85,1.1);
  }
  const foxRig = assets.fox(scene);
  const foxMotion = createFoxMotion(T, foxRig, reduced);
  const coinTrail = createCoinTrail(T, scene, games.length, step, reduced);
  $('coin-replay').addEventListener('click', () => {
    coinTrail.restart();
    select(0);
    $('up').focus();
  });
  // CSS3D boards and WebGL do not share a depth buffer. Composite the fox
  // above the boards using the same camera, while retaining its ground shadow.
  foxRig.root.traverse(object => object.layers.enable(1));
  scene.traverse(object => { if(object.isLight) object.layers.enable(1); });
  const foxRenderer = new T.WebGLRenderer({ antialias:true, alpha:true });
  foxRenderer.setPixelRatio(renderer.getPixelRatio());
  foxRenderer.outputColorSpace = renderer.outputColorSpace;
  foxRenderer.toneMapping = renderer.toneMapping;
  foxRenderer.toneMappingExposure = renderer.toneMappingExposure;
  foxRenderer.setClearColor(0x000000,0);
  const foxLayer = document.createElement('div');
  foxLayer.id='fox-foreground';
  foxLayer.setAttribute('aria-hidden','true');
  foxLayer.append(foxRenderer.domElement);
  host.parentElement.append(foxLayer);
  // Quiet drifting motes give the paper-colored atmosphere a little depth.
  const points=[];for(let i=0;i<100;i++)points.push(Math.sin(i*37)*8,Math.sin(i*13)*5,Math.cos(i*19)*5);
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(points,3));
  const motes=new T.Points(geometry,new T.PointsMaterial({color:0xc0a776,size:.045,transparent:true,opacity:.5}));scene.add(motes);
  let currentY=0, lastTime=0;
  moveScene=index=>foxMotion.setTarget(index*step);
  moveScene(selected);
  function resize(){const w=host.clientWidth,h=Math.max(1,host.clientHeight);const compact=matchMedia('(max-width:700px), (max-height:500px) and (pointer:coarse)').matches;const span=compact?Math.max(7.8,7.4*h/w):13;camera.left=-span*w/h/2;camera.right=span*w/h/2;camera.top=span/2;camera.bottom=-span/2;camera.updateProjectionMatrix();renderer.setSize(w,h,false);foxRenderer.setSize(w,h,false);boardRenderer.setSize(w,h);}
  new ResizeObserver(resize).observe(host);resize();
  function frame(time){
    const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
    if(!document.hidden){
      const pose=foxMotion.update(dt,time);
      currentY=pose.height;
      coinTrail.update(currentY, dt, time);
      const moving=pose.moving;
      sun.intensity=environment.draw(currentY/step,time);
      sun.position.set(-6,currentY+11,9);sun.target.position.set(0,currentY,0);
      fill.position.set(8,currentY+5,-8);
      const mobile=innerWidth<700;
      const lookY=currentY+2;
      const centerX=mobile ? -1.2*Math.cos(currentY/step*Math.PI) : 0;
      camera.position.set(9+centerX,lookY+7,13);camera.lookAt(centerX,lookY,0);
      if(mobile)camera.setViewOffset(host.clientWidth,host.clientHeight,0,0,host.clientWidth,host.clientHeight);else camera.clearViewOffset();
      islands.forEach((island,i)=>{island.visible=Math.abs(i*step-currentY)<13;});
      motes.position.y=currentY;if(!reduced.matches)motes.rotation.y=time*.000018;
      renderer.render(scene,camera);
      boards.forEach((board,i)=>{
        const visible = Math.abs(i*step-currentY)<8;
        board.visible=visible;
        cards[i].style.visibility=visible?'visible':'hidden';
        cards[i].inert=i!==selected || moving;
      });
      boardRenderer.render(boardScene,camera);
      camera.layers.set(1);
      foxRenderer.render(scene,camera);
      camera.layers.set(0);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}


