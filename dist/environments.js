// Painted scenery stays behind the islands; weather never intercepts input.
export const environments = [
  { name:'SUNLIT MEADOW', sky:['#c4e5e2','#f7edcc'], hills:'#8ead94', sun:'#ffedab', type:'sun', light:3.1 },
  { name:'NEON NIGHT', sky:['#141f3b','#514365'], hills:'#252b49', moon:true, type:'stars', dark:true, light:1.4 },
  { name:'TROPICAL SUNSET', sky:['#d9969f','#f8d498'], hills:'#a87d89', sun:'#ffe3a3', type:'ocean', light:2.6 },
  { name:'OCEAN MORNING', sky:['#95cdd8','#e4f0de'], hills:'#639da4', sun:'#f4f2d0', type:'ocean', light:2.8 },
  { name:'ABOVE THE CLOUDS', sky:['#98badb','#f4dfe6'], hills:'#a0afca', sun:'#fff2dc', type:'clouds', light:3 },
  { name:'DEEP SPACE', sky:['#10172c','#303359'], hills:'#252c47', moon:true, type:'space', dark:true, light:1.2 },
  { name:'MISTY MOUNTAINS', sky:['#acbbc0','#dce0d2'], hills:'#748d88', type:'mountains', light:1.9 },
  { name:'AUTUMN WOODS', sky:['#e3c59d','#f7e3ba'], hills:'#a38d63', sun:'#fff0c1', type:'leaves', light:2.6 },
  { name:'RAINY AFTERNOON', sky:['#344957','#637b83'], hills:'#4d7377', type:'rain', dark:true, light:1.6 },
  { name:'SNOWY SUMMIT', sky:['#abc5d8','#e9eff0'], hills:'#8fa7b6', type:'snow', light:2.5 },
  { name:'CONSTELLATION SKY', sky:['#172d3e','#385863'], hills:'#233f4d', moon:true, type:'stars', dark:true, light:1.5 }
].reverse();

export function createEnvironment(host, reduced) {
  const canvas = document.createElement('canvas'); canvas.className='environment'; canvas.setAttribute('aria-hidden','true'); host.prepend(canvas);
  const ctx=canvas.getContext('2d');
  let width=0,height=0,cache=[],active=-1;
  const random = n => {const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
  function paint(theme,index) {
    const layer=document.createElement('canvas'); layer.width=canvas.width;layer.height=canvas.height;
    const c=layer.getContext('2d'); c.scale(canvas.width/width,canvas.height/height);
    const sky=c.createLinearGradient(0,0,0,height);sky.addColorStop(0,theme.sky[0]);sky.addColorStop(1,theme.sky[1]);c.fillStyle=sky;c.fillRect(0,0,width,height);
    if(theme.type==='stars'||theme.type==='space') {
      for(let i=0;i<150;i++){const x=random(i+index*10)*width,y=random(i+700)*height*.85;c.globalAlpha=.3+random(i+80)*.65;c.fillStyle='#e3efff';c.beginPath();c.arc(x,y,i%9===0?1.8:.8,0,Math.PI*2);c.fill();}
      c.globalAlpha=.2;c.strokeStyle='#b4d5ef';c.lineWidth=1;c.beginPath();[[.05,.14],[.12,.19],[.17,.1],[.24,.16],[.29,.08]].forEach(([x,y],i)=>i?c.lineTo(x*width,y*height):c.moveTo(x*width,y*height));c.stroke();c.globalAlpha=1;
    }
    const sx=width*.83,sy=height*.19,r=Math.min(width,height)*.065;
    if(theme.sun||theme.moon){
      const glow=c.createRadialGradient(sx,sy,r*.3,sx,sy,r*3.3);glow.addColorStop(0,theme.moon?'#b8d7ee30':'#fff0ba90');glow.addColorStop(1,'#ffffff00');c.fillStyle=glow;c.fillRect(sx-r*4,sy-r*4,r*8,r*8);
      c.fillStyle=theme.sun||'#d6e6eb';c.beginPath();c.arc(sx,sy,r,0,Math.PI*2);c.fill();
      if(theme.moon){c.fillStyle=theme.sky[0];c.beginPath();c.arc(sx+r*.4,sy-r*.23,r*.87,0,Math.PI*2);c.fill();}
    }
    if(theme.type==='space'){
      c.save();c.translate(width*.2,height*.65);c.rotate(-.35);c.strokeStyle='#c0a4c866';c.lineWidth=9;c.beginPath();c.ellipse(0,0,80,22,0,0,Math.PI*2);c.stroke();c.fillStyle='#8a819e';c.beginPath();c.arc(0,0,37,0,Math.PI*2);c.fill();c.restore();
    }
    if(theme.type!=='space')for(let level=0;level<3;level++){
      const base=height*(.66+level*.1);c.globalAlpha=.18+level*.12;c.fillStyle=theme.hills;c.beginPath();c.moveTo(0,height);
      for(let j=0;j<=12;j++){const x=width*j/12;const peak=base-random(j+level*42+index)*height*(theme.type==='mountains'||theme.type==='snow'?.3:.14);c.lineTo(x,peak);}
      c.lineTo(width,height);c.closePath();c.fill();
      if(theme.type==='snow'){c.globalAlpha=.6;c.strokeStyle='#f3f6f4';c.lineWidth=3;c.stroke();}
    }
    c.globalAlpha=1;
    if(theme.type==='ocean'){c.fillStyle='#699fa744';c.fillRect(0,height*.76,width,height*.24);c.strokeStyle='#fff4cf66';for(let i=0;i<25;i++){const x=random(i)*width,y=height*(.78+random(i+45)*.21);c.beginPath();c.moveTo(x,y);c.lineTo(x+20+random(i+2)*90,y);c.stroke();}}
    return layer;
  }
  function resize(){if(!host.clientWidth||!host.clientHeight)return;width=host.clientWidth;height=host.clientHeight;const ratio=Math.min(devicePixelRatio,1.5);canvas.width=width*ratio;canvas.height=height*ratio;cache=environments.map(paint);}
  new ResizeObserver(resize).observe(host);resize();
  function weather(theme, time, weight) {
    if(weight<.001)return;
    ctx.save();ctx.scale(canvas.width/width,canvas.height/height);ctx.globalAlpha=weight;
    const t=reduced.matches?0:time*.001;
    if(['rain','snow','leaves'].includes(theme.type))for(let i=0;i<(theme.type==='rain'?100:38);i++){
      const speed=theme.type==='rain'?230:theme.type==='snow'?23:33;
      const x=(random(i+3)*width+t*(theme.type==='rain'?-55:10)+width*100)%width,y=(random(i+72)*height+t*speed)%height;
      ctx.strokeStyle='#d0e4e97a';ctx.fillStyle=theme.type==='leaves'?['#aa663a','#c58c41','#9d713f'][i%3]:'#ffffffbb';
      if(theme.type==='rain'){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+18);ctx.stroke();}else{ctx.beginPath();ctx.ellipse(x+Math.sin(t+i)*9,y,theme.type==='leaves'?4:2,2,t+i,0,Math.PI*2);ctx.fill();}
    }
    if(!theme.dark&&theme.type!=='snow'){
      ctx.fillStyle=theme.type==='rain'?'#b5c4cb':'#ffffff';ctx.globalAlpha=weight*.18;
      for(let i=0;i<6;i++){const x=(random(i+500)*width+t*5+width*.3)%(width*1.3)-width*.15,y=height*(.13+random(i+320)*.4);ctx.beginPath();ctx.ellipse(x,y,90+random(i)*80,12+random(i+4)*14,0,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
  return {
    draw(position,time){
      const p=Math.max(0,Math.min(environments.length-1,position));const low=Math.floor(p),high=Math.min(low+1,environments.length-1);const blend=p-low;
      ctx.globalAlpha=1;ctx.drawImage(cache[low],0,0);if(blend){ctx.globalAlpha=blend;ctx.drawImage(cache[high],0,0);}ctx.globalAlpha=1;
      weather(environments[low],time,1-blend);if(blend)weather(environments[high],time,blend);
      const nearest=Math.round(p);
      if(active!==nearest){active=nearest;const theme=environments[nearest];document.body.classList.toggle('night-world',!!theme.dark);document.getElementById('environment-name').textContent=theme.name;canvas.dataset.environment=theme.name;}
      return environments[low].light*(1-blend)+environments[high].light*blend;
    }
  };
}

