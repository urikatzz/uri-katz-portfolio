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
  const {root,body,head,tail,paws,eyes=[],ears=[],setBlink,setSit,sitDrop=0}=rig;
  let height=0,target=0,speed=0,engage=0,arrival=1;
  const eyeY=eyes.map(e=>e.scale.y);
  let blinkIn=2,blink=0,flickIn=4,flick=1,flickEar=0,lookIn=3,lookTarget=0,look=0;
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
        // A new request the other way is obeyed at once: brake and turn around hard instead of drifting on at the old speed.
        const reversing=desired!==0&&speed!==0&&Math.sign(desired)!==Math.sign(speed);
        const limit=dt*(reversing?60:8);
        const accel=clamp(desired-speed,-limit,limit);speed+=accel;
        const delta=speed*dt;
        if(Math.abs(gap)>0&&Math.abs(delta)>=Math.abs(gap)&&Math.sign(delta)===Math.sign(gap)){height=target;speed=0;arrival=0;}else height+=delta;
        if(!wanted)arrival=Math.min(1,arrival+dt*3);
      }
      if(!reduced.matches){
        blinkIn-=dt;if(blinkIn<0){blinkIn=2.2+Math.random()*3.5;blink=1e-4;}
        if(blink>0){blink+=dt/.14;if(blink>=1)blink=0;}
        flickIn-=dt;if(flickIn<0){flickIn=3+Math.random()*5;flick=0;flickEar=Math.random()<.5?0:1;}
        if(flick<1)flick=Math.min(1,flick+dt/.45);
        // Now and then glance to one side, then look back.
        lookIn-=dt;if(lookIn<0){lookIn=3.5+Math.random()*5;lookTarget=lookTarget===0?(Math.random()<.5?-1:1)*(.3+Math.random()*.2):0;}
        look+=(lookTarget-look)*Math.min(1,dt*2.2);
      }
      const closed=blink>0?Math.min(1,Math.sin(blink*Math.PI)*1.3):0;
      if(setBlink)setBlink(closed);else eyes.forEach((e,i)=>{e.scale.y=eyeY[i]*(1-.93*closed);});
      ears.forEach((e,i)=>{const kick=i===flickEar?Math.sin(flick*Math.PI*3)*.28*(1-flick):0;e.ear.rotation.z=e.earZ+kick;});
      const grip=smooth(engage),stride=height/(6/14)*Math.PI;
      const energy=Math.min(1,Math.abs(speed)/1.2);
      // Land inside the alternating island footprint, not beside the ladder.
      const islandSide=Math.round(height/6)%2===0?-1:1;
      const transfer=Math.sin(grip*Math.PI);
      root.position.set(islandSide*1.3*(1-grip)+Math.sin(stride)*.025*energy,height+.12*grip+transfer*.07,1.28+.22*grip);
      if(setSit)setSit(1-grip,root.position);
      // Idle weight shift: the body drifts over one leg and the hips tilt (loaded hip rises), then back the other way.
      const sway=reduced.matches?0:Math.sin(seconds*.55)*(1-grip);
      body.rotation.set(0,Math.PI*grip,Math.sin(stride)*.045*energy+sway*.03+.012*(1-grip));
      body.position.x=sway*.03;
      // Idle body offset raises the hips into the standing pose and eases back to the ladder stance.
      body.position.y=(reduced.matches?0:Math.sin(seconds*2)*.018*(1-grip)-Math.sin(Math.PI*arrival)*.05)-sitDrop*(1-grip);
      body.position.z=-.018*Math.cos(stride*2)*energy;
      head.rotation.set(-Math.sign(speed)*.12*grip,Math.sin(stride)*.06*energy+look*(1-grip),(reduced.matches?0:Math.sin(seconds*1.5)*.04*(1-grip))+look*.12*(1-grip));
      tail.rotation.x=reduced.matches?0:Math.sin(seconds*2.8-stride*.3)*(.1+.12*energy)+Math.sin(seconds*16)*.16*(1-arrival)*(1-grip);
      tail.rotation.z=-.85+Math.sin(stride-.6)*.1*energy+(reduced.matches?0:(Math.sin(seconds*1.3)*.07+Math.sin(seconds*.37)*.05)*(1-grip));
      root.updateMatrixWorld(true);
      paws.forEach(limb=>{
        const parity=(limb.side<0?0:1)^(limb.upper?0:1);
        const contact=rungContact(height,limb.upper?1.37:.55,parity);
        // The hand/foot stays planted in world space while the torso rises. The wrist sits just below the rung so the
        // palm wraps it; the ankle sits above it so the ball of the foot lands on it.
        local.set(-limb.side*(limb.upper?.28:.21),contact.y+(limb.upper?-.08:.13),(limb.upper?1.04:1.1)+contact.lift*.17);
        body.worldToLocal(local);
        stance.copy(limb.rest);
        if(limb.upper){
          // Hands hang from the body and swing gently in opposition.
          stance.y-=body.position.y;
          if(!reduced.matches)stance.z+=Math.sin(seconds*1.1+(limb.side<0?0:Math.PI))*.02*(1-grip);
        }else{
          // Feet stay planted while the body sways and bobs: undo the body's shift and hip tilt.
          stance.x-=body.position.x;stance.y-=body.position.y;
          const c=Math.cos(body.rotation.z),s=Math.sin(body.rotation.z),x=stance.x*c+stance.y*s,y=-stance.x*s+stance.y*c;
          stance.x=x;stance.y=y+Math.max(0,Math.sin(engage*Math.PI*4+(limb.side<0?0:Math.PI)))*.09*transfer;
        }
        local.lerp(stance,1-grip);
        limb.pose(local,grip);
      });
      return {height,moving:Math.abs(target-height)>.002||engage>.001};
    }
  };
}

