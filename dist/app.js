const projects = [
  { title: 'Deep Rock Galactic — My Take', platform: 'PC / UNITY', image: 'marching-cubes.png', description: 'A Deep Rock Galactic-inspired mining game using the marching-cubes algorithm to generate underground terrain, dig through caves, and collect gold.' },
  { title: 'Helix Jump — My Take', platform: 'ANDROID / WEBGL', image: 'helix.jpg', description: 'My take on Helix Jump. Play in your browser or download the Android version.' },
  { title: 'AR Space Battle', platform: 'ANDROID', image: 'space.png', description: 'Fire lasers and missiles at spaceships and planets all around you in augmented reality.' },
  { title: 'The Village', platform: 'WINDOWS', image: 'village.jpg', description: 'A 3D action role-playing game.' },
  { title: 'FoxFox', platform: 'ANDROID', image: 'foxfox.jpg', description: 'Collect cherries and diamonds, avoid enemies, and chase a high score. Features Google Play leaderboards and achievements.' },
  { title: 'Bouncing Babies', platform: 'ANDROID / WEBGL', image: 'babies.png', description: 'Guide a two-person firefighting team to catch babies escaping a burning building and bounce them safely into an ambulance.' },
  { title: 'Knight', platform: 'ANDROID', image: 'knight.jpg', description: 'Battle giant monsters and collect diamonds as a knight. Built with Unity Ads integration.' },
  { title: 'Online Ping Pong', platform: 'ANDROID', image: 'pingpong.png', description: 'A multiplayer ping pong game for Android, built using UNet and HLAPI.' }
];
const artworks = [
 ['Bicycle','bicycle.jpg'],['Tank','tank.jpg'],['Teddy bear','bear.jpg'],['Concept car','car.jpg'],['Coffee study','coffee.jpg'],['Compact car','mini.jpeg'],['Character sculpture','sculpture.gif'],['Pod racer','racer.jpg','racer.mp4'],['Glass animation','glass.jpg','glass.mp4'],['Fox animation','fox-animation.jpg','fox-animation.mp4'],['Fox','fox.jpg'],['Stone material','stones.jpg']
];
document.querySelector('#projects').innerHTML = projects.map((p,i) => `<article class="project"><div class="project-picture"><img src="assets/${p.image}" alt="${p.title} gameplay" loading="lazy"></div><div class="project-meta"><h3>${p.title}</h3><span class="platform">${p.platform}</span></div><p>${p.description}</p>${p.links?.length ? `<div class="project-links">${p.links.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</div>` : ''}</article>`).join('');
const artSection = document.querySelector('#art');
const artToggle = document.querySelector('.art-toggle');
artToggle?.addEventListener('click', () => {
 artSection.classList.toggle('is-collapsed');
 const collapsed = artSection.classList.contains('is-collapsed');
 artToggle.setAttribute('aria-expanded', String(!collapsed));
 artToggle.querySelector('.art-toggle-label').textContent = collapsed ? 'Maximize gallery' : 'Minimize gallery';
 artToggle.querySelector('span:last-child').textContent = collapsed ? '⌄' : '⌃';
});

document.querySelector('#artworks').innerHTML = artworks.map(([title,image,video],i)=>`<button class="art-card" data-art="${i}" aria-label="${video?'Play':'View'} ${title}"><span class="art-picture"><img src="assets/${image}" alt="${title}, 3D artwork by Uri Katz" loading="lazy">${video?'<span class="play" aria-hidden="true">▶</span>':''}</span><span class="art-caption">${title}<span aria-hidden="true">${video?'PLAY ↗':'↗'}</span></span></button>`).join('');
const viewer = document.querySelector('#viewer');
document.querySelector('#artworks').addEventListener('click', event => {
 const card = event.target.closest('[data-art]'); if(!card) return;
 const [title,image,video] = artworks[Number(card.dataset.art)];
 const media = document.createElement(video?'video':'img');
 media.src = `assets/${video||image}`;
 if(video){media.controls=true;media.playsInline=true;media.poster=`assets/${image}`;}else{media.alt=`${title}, 3D artwork by Uri Katz`;}
 document.querySelector('#viewer-content').replaceChildren(media);
 document.querySelector('#viewer-caption').textContent=title;
 viewer.showModal();
});
document.querySelector('.close-viewer').addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',event=>{if(event.target===viewer){const r=viewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)viewer.close();}});
viewer.addEventListener('close',()=>document.querySelector('#viewer-content').replaceChildren());
document.querySelector('#year').textContent = new Date().getFullYear();
