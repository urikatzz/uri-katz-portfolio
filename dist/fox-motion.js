const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};

// Pauses on a real rung before reaching the next one. The same curve runs
// backwards on descent, so contacts remain stable when direction changes.
export function rungContact(height, nominal, parity, spacing=6/14) {
  const cycle=(height+nominal)/(2*spacing)-parity*.5;
  const phase=cycle-Math.floor(cycle);
  const swing=smooth((phase-.56)/.44);
  return {y:(Math.floor(cycle)+swing)*2*spacing+parity*spacing,lift:Math.sin(swing*Math.PI)};
}

export function createFoxMotion(T, rig, reduced) {
  const {root,body,head,tail,paws,ribbon}=rig;
  let height=0,target=0,speed=0,engage=0,arrival=1;
  const local=new T.Vector3(),stance=new T.Vector3();
  return {
    setTarget(y){target=y;},
    update(dt,time){
      const seconds=time*.001;
      if(reduced.matches){height=target;speed=0;engage=0;arrival=1;}
      else {
        const gap=target-height,wanted=Math.abs(gap)>.002;
        // Approach and turn before pulling up. Settle back only after stopping.
        engage=clamp(engage+(wanted?dt*3.5:-dt*2.6));
        const desired=engage<.98?0:Math.sign(gap)*Math.min(2.7,Math.sqrt(2*7.1*Math.abs(gap)));
        const accel=clamp(desired-speed,-dt*8,dt*8);speed+=accel;
        const delta=speed*dt;
        if(Math.abs(gap)>0&&Math.abs(delta)>=Math.abs(gap)&&Math.sign(delta)===Math.sign(gap)){height=target;speed=0;arrival=0;}else height+=delta;
        if(!wanted)arrival=Math.min(1,arrival+dt*3);
      }
      const grip=smooth(engage),stride=height/(6/14)*Math.PI;
      const energy=Math.min(1,Math.abs(speed)/1.2);
      // Land inside the alternating island footprint, not beside the ladder.
      const islandSide=Math.round(height/6)%2===0?-1:1;
      const transfer=Math.sin(grip*Math.PI);
      root.position.set(islandSide*1.3*(1-grip)+Math.sin(stride)*.025*energy,height+.12*grip+transfer*.07,1.28+.22*grip);
      body.rotation.set(0,Math.PI*grip,Math.sin(stride)*.045*energy);
      body.position.y=reduced.matches?0:Math.sin(seconds*2)*.018*(1-grip)-Math.sin(Math.PI*arrival)*.05;
      body.position.z=-.018*Math.cos(stride*2)*energy;
      head.rotation.set(-Math.sign(speed)*.12*grip,Math.sin(stride)*.06*energy,reduced.matches?0:Math.sin(seconds*1.5)*.04*(1-grip));
      tail.rotation.x=reduced.matches?0:Math.sin(seconds*2.8-stride*.3)*(.1+.12*energy);
      tail.rotation.z=-.85+Math.sin(stride-.6)*.1*energy;
      ribbon.rotation.x=Math.sin(stride-.8)*.2*energy;
      root.updateMatrixWorld(true);
      paws.forEach(limb=>{
        const parity=(limb.side<0?0:1)^(limb.upper?0:1);
        const contact=rungContact(height,limb.upper?1.37:.55,parity);
        // The paw tip stays planted in world space while the torso rises.
        local.set(-limb.side*(limb.upper?.28:.21),contact.y,1.09+contact.lift*.17);
        body.worldToLocal(local);
        stance.copy(limb.rest);
        if(!limb.upper){
          // Counter torso breathing/settling so resting feet stay on the turf.
          stance.y-=body.position.y;
          stance.y+=Math.max(0,Math.sin(engage*Math.PI*4+(limb.side<0?0:Math.PI)))*.09*transfer;
        }
        local.lerp(stance,1-grip);
        limb.pose(local,grip);
      });
      return {height,moving:Math.abs(target-height)>.002||engage>.001};
    }
  };
}

