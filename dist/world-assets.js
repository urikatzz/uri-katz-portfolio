// Original procedural models: a miniature, hand-crafted woodland diorama.
export function createAssets(T) {
  const materials = new Map(), geometries = new Map();
  const mat = (color, smooth=false) => {
    const key=`${color}/${smooth}`;
    if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.82,flatShading:!smooth}));
    return materials.get(key);
  };
  function shape(geometry,color,p,x=0,y=0,z=0,smooth=false){const m=new T.Mesh(geometry,mat(color,smooth));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;}
  const ico = new T.IcosahedronGeometry(1,1);
  function pebble(p,color,x,y,z,sx,sy,sz){const m=shape(ico,color,p,x,y,z,true);m.scale.set(sx,sy,sz);return m;}
  function beam(p,color,x,y,z,w,h,d,r=.04){
    const key=[w,h,d,r].join('/');
    if(!geometries.has(key)){
      const s=new T.Shape(),a=-w/2,b=-h/2;
      s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
      const g=new T.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r*.45,bevelSegments:2,steps:1,curveSegments:3});g.translate(0,0,-d/2+r);g.computeVertexNormals();geometries.set(key,g);
    }
    return shape(geometries.get(key),color,p,x,y,z,true);
  }
  function rod(p,color,a,b,r=.05){const dir=new T.Vector3(...b).sub(new T.Vector3(...a));const m=shape(new T.CylinderGeometry(r*.8,r,dir.length(),7),color,p);m.position.copy(new T.Vector3(...a).addScaledVector(dir,.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize());return m;}
  const random=n=>{const v=Math.sin(n*93.27+13.4)*43758.54;return v-Math.floor(v);};
  function pine(p,x,z,size,snow=false){
    const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(size);p.add(g);
    rod(g,0x70543b,[0,0,0],[.08,2.8,0],.13);
    for(let i=0;i<5;i++){
      const canopy=shape(new T.ConeGeometry(.83-i*.13,1.15,9),[0x315b4e,0x3d6d57,0x4f8062,0x64916a,0x7ba277][i],g,.035*i,.9+i*.43,0);
      canopy.rotation.y=i*.65;
      if(snow){const cap=shape(new T.ConeGeometry((.83-i*.13)*.8,.75,9),0xe5eef0,g,.035*i,1.13+i*.43,0);cap.rotation.y=i*.65;}
    }
    for(let i=0;i<4;i++)rod(g,0x76563b,[0,.1,0],[Math.cos(i*1.57)*.3,.03,Math.sin(i*1.57)*.3],.07);
  }
  function broadleaf(p,x,z,size,autumn=false){
    const g=new T.Group();g.position.set(x,0,z);g.scale.setScalar(size);p.add(g);
    rod(g,0x75513c,[0,0,0],[.12,1.7,0],.14);
    for(let i=0;i<5;i++){
      const a=i*2.4,dx=Math.cos(a)*.55,dz=Math.sin(a)*.5;
      rod(g,0x75513c,[.05,.8,0],[dx,1.7,dz],.06);
      pebble(g,(autumn?[0xb56b38,0xcc8744,0xe4a856]:[0x497455,0x638a58,0x86a66a])[i%3],dx,1.8+random(i)*.6,dz,.66,.75,.62);
    }
  }
  function island(p,cx,index,color){
    const snowy=index===1,autumn=index===3,space=index===5;
    const n=18, positions=[],colors=[];
    const ring=(radius,y)=>Array.from({length:n},(_,j)=>{const a=j/n*Math.PI*2,r=radius*(.88+random(j+index*19)*.2);return [cx+Math.cos(a)*r,y,Math.sin(a)*r*.78];});
    const rings=[ring(2.45,-.06),ring(2.5,-.28),ring(2.04,-.78),ring(1.6,-1.3),ring(.6,-1.9)];
    const layers=[snowy?0xdce8e8:color,0x79654e,0x68736b,0x505e59];
    function triangle(a,b,c,color){const col=new T.Color(color);positions.push(...a,...b,...c);for(let k=0;k<3;k++)colors.push(col.r,col.g,col.b);}
    for(let j=0;j<n;j++)triangle([cx,-.04,0],rings[0][(j+1)%n],rings[0][j],snowy?0xe6eded:color);
    for(let layer=0;layer<4;layer++)for(let j=0;j<n;j++){
      const c=new T.Color(layers[layer]).multiplyScalar(.82+random(j+layer*31)*.3);
      const k=(j+1)%n;triangle(rings[layer][j],rings[layer][k],rings[layer+1][j],c);triangle(rings[layer][k],rings[layer+1][k],rings[layer+1][j],c);
    }
    for(let j=0;j<n;j++)triangle(rings[4][j],rings[4][(j+1)%n],[cx+.25,-2.35,0],0x4a5754);
    const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();
    const terrain=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true,side:T.DoubleSide}));terrain.castShadow=true;terrain.receiveShadow=true;p.add(terrain);
    const side=Math.sign(cx);
    if(autumn)broadleaf(p,cx+side*1.7,-.8,.85,true);else pine(p,cx+side*1.7,-.8,.9,snowy);
    pine(p,cx-side*.5,-1,.48,snowy);
    for(let j=0;j<6;j++){const stone=beam(p,snowy?0xbecdd0:0xc2bba0,side*(.38+j*.32),.035,.95,.37,.08,.63,.035);stone.rotation.y=Math.sin(j)*.12;}
    for(let j=0;j<25;j++){
      const angle=j*2.399,r=1.3+random(j+index)*.65,x=cx+Math.cos(angle)*r,z=Math.sin(angle)*r*.72;
      if(z>.65&&Math.abs(x)<2.5)continue;
      if(j%5===0){pebble(p,snowy?0xb9cbd0:0x899387,x,.04,z,.2,.14,.17);continue;}
      if(!snowy)for(let k=0;k<3;k++){const blade=shape(new T.ConeGeometry(.035,.18+random(j+k)*.15,3),autumn?0xa89656:0x62845a,p,x+k*.045,.1,z);blade.rotation.z=(k-1)*.3;blade.castShadow=false;}
      if(j%4===0&&!snowy){rod(p,0xe3d6b8,[x,.03,z],[x,.22,z],.033);const cap=shape(new T.SphereGeometry(.11,8,5,0,Math.PI*2,0,Math.PI/2),autumn?0xc77a49:0xc9916c,p,x,.23,z);cap.scale.y=.55;}
    }
    // Clinging moss, hanging roots, and small mineral outcrops break up the silhouette.
    for(let j=0;j<6;j++){
      const a=j*.93,x=cx+Math.cos(a)*2.13,z=Math.sin(a)*1.66;
      if(!snowy){const curve=new T.CatmullRomCurve3([new T.Vector3(x,-.18,z),new T.Vector3(x*.98,-.55,z),new T.Vector3(x+.12,-1-random(j)*.35,z-.1)]);shape(new T.TubeGeometry(curve,8,.025,4,false),0x626949,p);for(let k=0;k<3;k++)pebble(p,0x708462,x+.05,-.28-k*.2,z,.1,.055,.12);}
      if(j%2===0){const crystal=shape(new T.ConeGeometry(.12,.5,5),space?0x93b7d9:0x9ba999,p,cx+Math.cos(a)*1.7,.2,Math.sin(a)*1.1);crystal.rotation.z=.25;}
    }
  }
  function ladder(p,height){
    for(const x of [-.4,.4]){
      beam(p,0x98734e,x,height/2,.91,.14,height,.16,.025);
      for(let y=.5;y<height;y+=1.2){beam(p,0x5e5746,x,y,.91,.17,.09,.19,.02);rod(p,0xb89969,[x-.03,y-.1,1.005],[x+.025,y+.12,1.005],.013);}
    }
    for(let j=1;j<=14;j++){
      const y=j*height/14;beam(p,0xc3a075,0,y,.96,.94,.115,.2,.035);
      for(const x of [-.4,.4])pebble(p,0x544936,x,y,1.077,.024,.024,.012);
    }
  }
  function lantern(p,x,z){
    rod(p,0x62543e,[x,0,z],[x,1.18,z],.048);rod(p,0x62543e,[x,1.18,z],[x-.2,1.18,z],.04);
    const bulb=beam(p,0xffcc77,x-.2,.86,z,.24,.32,.24,.025);bulb.material=new T.MeshStandardMaterial({color:0xffdc9d,emissive:0xffa63e,emissiveIntensity:1.4,roughness:.4});
    for(const dx of [-.13,.13])for(const dz of [-.13,.13])rod(p,0x514b3b,[x-.2+dx,.66,z+dz],[x-.2+dx,1.05,z+dz],.02);
    shape(new T.ConeGeometry(.24,.17,4),0x546054,p,x-.2,1.1,z).rotation.y=Math.PI/4;
    beam(p,0x514b3b,x-.2,.66,z,.32,.055,.32,.02);
  }
  function fox(parent){
    // A chubby, toy-like fox in the spirit of a designer vinyl figure: a wide round head whose muzzle is part of the
    // skull, small glossy dot eyes, rounded ears (dark rims, orange faces), a cream lower face and bib, flat-soled dark
    // boots and a fat tapered tail with a cream tip. At rest it stands on two feet with relaxed arms; the rig reaches for the ladder to climb.
    // Shading is blended across every join (shoulders, hips, tail base, neck, ears) so the body reads as one surface.
    const DETAIL=3,SMOOTH=11,IDLE_LIFT=.12,GROUND=-.05;
    const C={orange:0xe8761f,cream:0xf8e6c2,dark:0x3b2a22};
    const furMat=new T.MeshStandardMaterial({vertexColors:true,roughness:.85,emissive:0x3a1c0c,emissiveIntensity:.14});
    const tint=new T.Color(),blendA=new T.Color(),blendB=new T.Color();
    const ss=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
    const step=(a,b,x)=>ss((x-a)/(b-a));
    const mix=(a,b,t)=>blendA.set(a).lerp(blendB.set(b),Math.max(0,Math.min(1,t)));
    // Average normals across shared positions so the figure shades softly.
    function smoothNormals(g){
      const p=g.attributes.position,n=g.attributes.normal,sum=new Map();
      const key=i=>`${Math.round(p.getX(i)*1e4)},${Math.round(p.getY(i)*1e4)},${Math.round(p.getZ(i)*1e4)}`;
      for(let i=0;i<p.count;i++){const k=key(i),a=sum.get(k)||[0,0,0];a[0]+=n.getX(i);a[1]+=n.getY(i);a[2]+=n.getZ(i);sum.set(k,a);}
      for(let i=0;i<p.count;i++){const a=sum.get(key(i)),l=Math.hypot(a[0],a[1],a[2])||1;n.setXYZ(i,a[0]/l,a[1]/l,a[2]/l);}
    }
    // Colour a geometry per vertex from a function of position (so markings blend cleanly), then soften normals.
    function figure(source,colorAt){
      const g=source.index?source.toNonIndexed():source,p=g.attributes.position,colors=new Float32Array(p.count*3);
      for(let i=0;i<p.count;i++){tint.set(colorAt(p.getX(i),p.getY(i),p.getZ(i)));colors.set([tint.r,tint.g,tint.b],i*3);}
      g.setAttribute('color',new T.BufferAttribute(colors,3));g.computeVertexNormals();smoothNormals(g);
      return g;
    }
    const ball=d=>new T.IcosahedronGeometry(1,d);
    const deform=(g,fn)=>{const p=g.attributes.position;for(let i=0;i<p.count;i++){const v=fn(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,v[0],v[1],v[2]);}return g;};
    const part=(p,g,x=0,y=0,z=0)=>{const m=new T.Mesh(g,furMat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;p.add(m);return m;};

    // --- Join blending: a nearest-vertex probe of a finished surface lets neighbouring parts borrow its normals
    // near where they meet, so the shading is continuous across the join instead of showing a crease.
    const CELL=.1,cellKey=(ix,iy,iz)=>(ix+512)*1048576+(iy+512)*1024+(iz+512);
    function makeProbe(geometry,matrix){
      const p=geometry.attributes.position,n=geometry.attributes.normal,count=p.count;
      const pos=new Float32Array(count*3),nor=new Float32Array(count*3),cells=new Map(),seen=new Set();
      const v=new T.Vector3(),m=new T.Vector3(),rot=new T.Matrix3().getNormalMatrix(matrix);
      let unique=0;
      for(let i=0;i<count;i++){
        v.fromBufferAttribute(p,i).applyMatrix4(matrix);
        // Non-indexed meshes repeat each position for every triangle that uses it; keep one copy.
        const id=`${Math.round(v.x*1e4)},${Math.round(v.y*1e4)},${Math.round(v.z*1e4)}`;
        if(seen.has(id))continue;seen.add(id);
        m.fromBufferAttribute(n,i).applyMatrix3(rot).normalize();
        pos[unique*3]=v.x;pos[unique*3+1]=v.y;pos[unique*3+2]=v.z;nor[unique*3]=m.x;nor[unique*3+1]=m.y;nor[unique*3+2]=m.z;
        const k=cellKey(Math.floor(v.x/CELL),Math.floor(v.y/CELL),Math.floor(v.z/CELL));
        const list=cells.get(k);if(list)list.push(unique);else cells.set(k,[unique]);
        unique++;
      }
      // Smoothed lookup: distance to the surface (mean of the nearest few vertices, Infinity if none is close) and their
      // inverse-distance-weighted normal, written to `out`. Averaging keeps the blend weight steady between vertices.
      const K=4,bd=new Float64Array(K),bi=new Int32Array(K);
      return (x,y,z,out)=>{
        // Check the 8 cells around the query point: that covers everything within CELL/2 (5cm) of it.
        const fx=x/CELL,fy=y/CELL,fz=z/CELL,ix=Math.floor(fx),iy=Math.floor(fy),iz=Math.floor(fz);
        const ox=fx-ix<.5?-1:1,oy=fy-iy<.5?-1:1,oz=fz-iz<.5?-1:1;bd.fill(Infinity);bi.fill(-1);
        for(let a=0;a<8;a++){
          const list=cells.get(cellKey(ix+(a&1?ox:0),iy+(a&2?oy:0),iz+(a&4?oz:0)));if(!list)continue;
          for(let k=0;k<list.length;k++){
            const i=list[k],ex=pos[i*3]-x,ey=pos[i*3+1]-y,ez=pos[i*3+2]-z,d=ex*ex+ey*ey+ez*ez;
            if(d>=bd[K-1])continue;
            let slot=K-1;while(slot>0&&bd[slot-1]>d){bd[slot]=bd[slot-1];bi[slot]=bi[slot-1];slot--;}
            bd[slot]=d;bi[slot]=i;
          }
        }
        if(bi[0]<0)return Infinity;
        let nx=0,ny=0,nz=0,dist=0,used=0;
        for(let k=0;k<K;k++){
          if(bi[k]<0)break;const d=Math.sqrt(bd[k]),w=1/(d*d+1e-5);
          nx+=nor[bi[k]*3]*w;ny+=nor[bi[k]*3+1]*w;nz+=nor[bi[k]*3+2]*w;dist+=d;used++;
        }
        out.set(nx,ny,nz).normalize();return dist/used;
      };
    }
    const NEAR=.015,FAR=.05; // blend band; the 8-cell lookup is exact out to CELL/2 = FAR
    // Pull `geometry`'s normals (its local space -> body space via `matrix`) toward the probed surface near the join.
    // mode 'avg' averages the two surfaces (use on both sides of a static join); 'take' adopts the probed normal.
    function blendNormals(geometry,matrix,probe,mode){
      const p=geometry.attributes.position,n=geometry.attributes.normal;
      const rot=new T.Matrix3().getNormalMatrix(matrix),inv=rot.clone().transpose();
      const v=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3();
      for(let i=0;i<p.count;i++){
        v.fromBufferAttribute(p,i).applyMatrix4(matrix);
        const d=probe(v.x,v.y,v.z,b);if(d>=FAR)continue;
        a.fromBufferAttribute(n,i).applyMatrix3(rot).normalize();
        if(mode==='avg')b.add(a).normalize();
        a.lerp(b,1-step(NEAR,FAR,d)).normalize().applyMatrix3(inv).normalize();
        n.setXYZ(i,a.x,a.y,a.z);
      }
      n.needsUpdate=true;
    }
    // Blend two static surfaces toward each other where they meet (both sides adopt the averaged normal).
    function weld(geoA,matA,geoB,matB){
      const probeA=makeProbe(geoA,matA),probeB=makeProbe(geoB,matB);
      blendNormals(geoA,matA,probeB,'avg');blendNormals(geoB,matB,probeA,'avg');
    }
    const placed=(obj,parentMatrix)=>{obj.updateMatrix();return parentMatrix?parentMatrix.clone().multiply(obj.matrix):obj.matrix.clone();};

    const eyes=[],ears=[];
    const root=new T.Group();parent.add(root);root.scale.setScalar(1.17);
    const body=new T.Group();root.add(body);

    // Torso: a plump pear. Round haunches and a soft belly are part of the same surface, so there are no hip seams.
    const torsoShape=(x,y,z)=>{
      let X=x*.335*(1+.16*Math.max(0,-y)-.1*Math.max(0,y)),Y=y*.38,Z=z*.27*(1+.08*Math.max(0,-y)-.06*Math.max(0,y));
      for(const s of [-1,1]){
        const g=Math.exp(-(((X-s*.27)**2)+((Y+.28)**2)+((Z+.06)**2))/(2*.16*.16));
        X+=x*.13*g;Y+=y*.07*g;Z+=z*.13*g;
      }
      const belly=Math.exp(-((X**2)+((Y+.24)**2)+((Z-.1)**2))/(2*.17*.17));
      return [X,Y,Z+.06*belly*Math.max(0,z)];
    };
    const torsoGeo=figure(deform(ball(SMOOTH),torsoShape),(x,y,z)=>{
      const r=Math.hypot(x/.19,(y+.03)/.3);
      return mix(C.orange,C.cream,(1-step(.86,1.14,r))*step(0,.07,z));
    });
    const torso=part(body,torsoGeo,0,.58,0);

    // Head: wide and low. The muzzle is a forward swell of the skull (tapering toward the nose), not a separate bump.
    const head=new T.Group();head.position.set(0,1.06,.03);head.scale.setScalar(.94);body.add(head);
    const skullScale=(X,Y)=>{const yu=Y/.33;return [.44*(1+.1*Math.max(0,-yu)-.05*Math.max(0,yu)),1-.06*Math.max(0,yu)];};
    const muzzleSwell=(X,Y)=>Math.exp(-(((X/.15)**2)+(((Y+.12)/.095)**2))/2);
    const headShape=(x,y,z)=>{
      const [wx,wz]=skullScale(0,y*.33);
      let X=x*wx,Y=y*.33,Z=z*.37*wz;
      if(Z>0){const g=muzzleSwell(X,Y),k=Math.min(1,Z/.15);Z+=.14*g*k;X*=1-.22*g*Math.min(1,Math.max(0,Z-.24)/.2);}
      return [X,Y,Z];
    };
    // Height of the head surface at (X,Y) on the front, for placing the eyes, nose and mouth exactly on it.
    const faceZ=(X,Y)=>{
      const [wx,wz]=skullScale(X,Y),yu=Y/.33,q=1-(X/wx)**2-yu*yu;
      const z0=.37*wz*Math.sqrt(Math.max(0,q));
      return z0+.14*muzzleSwell(X,Y)*Math.min(1,z0/.15);
    };
    const maskLine=x=>-.115+.78*x*x;
    const headGeo=figure(deform(ball(SMOOTH),headShape),(x,y,z)=>{
      const line=maskLine(x);
      return mix(C.orange,C.cream,(1-step(line-.026,line+.026,y))*step(-.12,.0,z));
    });
    part(head,headGeo);
    part(head,figure(deform(ball(DETAIL),(x,y,z)=>[x*.056,y*.041,z*.042]).translate(0,-.098,faceZ(0,-.098)+.004),()=>C.dark));
    for(const s of [-1,1]){
      const pts=[[0,-.132],[0,-.156],[s*.042,-.172],[s*.09,-.163]].map(([x,y])=>new T.Vector3(x,y,faceZ(x,y)+.003));
      part(head,figure(new T.TubeGeometry(new T.CatmullRomCurve3(pts),14,.0065,6),()=>C.dark));
    }
    // Small glossy dot eyes, set wide, each with a couple of highlights. Blinking squashes the eye.
    const eyeMat=new T.MeshStandardMaterial({color:0x1a1210,roughness:.2}),glint=new T.MeshBasicMaterial({color:0xffffff,toneMapped:false});
    const eyeBall=new T.SphereGeometry(1,24,16);
    const eyePart=(eye,material,x,y,z,sx,sy,sz)=>{const m=new T.Mesh(eyeBall,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);eye.add(m);return m;};
    // Rounded ears: a slim dark rim around an orange face. The dark fades to orange at the base so the ear grows out of the head.
    const earProfile=[[0,0],[.21,0],[.206,.06],[.19,.15],[.16,.25],[.12,.34],[.075,.41],[.038,.447],[0,.462]];
    const earGeo=(k,w=1)=>new T.LatheGeometry(earProfile.map(([r,y])=>new T.Vector2(r*k*w,y*k)),28).scale(1,1,.45);
    const earRim=earGeo(1,1.08),earFace=earGeo(.8,1.08);
    const earParts=[];
    for(const s of [-1,1]){
      const eye=new T.Group();eye.position.set(s*.215,-.02,faceZ(s*.215,-.02)-.012);eye.rotation.set(.07,s*.4,0);head.add(eye);
      eyePart(eye,eyeMat,0,0,0,.058,.075,.034);
      eyePart(eye,glint,-.015*s,.03,.032,.019,.022,.008);
      eyePart(eye,glint,.019*s,-.025,.03,.009,.01,.006);
      eyes.push(eye);
      const ear=new T.Group();ear.position.set(s*.29,.18,-.02);ear.rotation.set(.1,0,-s*.3);head.add(ear);
      const rim=figure(earRim.clone(),(x,y)=>mix(C.orange,C.dark,step(.02,.1,y)));
      const face=figure(earFace.clone(),()=>C.orange);
      part(ear,rim);part(ear,face,0,.03,.05);
      earParts.push({ear,rim,face});
      ears.push({ear,earZ:ear.rotation.z});
    }
    const setBlink=closed=>{for(const eye of eyes)eye.scale.y=Math.max(.08,1-.92*closed);};

    // Limbs, in simple cartoon anatomy. An arm runs shoulder -> upper arm -> elbow -> forearm -> wrist -> mitten hand
    // (rounded fingers plus a thumb); a leg runs hip -> thigh -> knee -> lower leg -> ankle -> foot (heel, arch, toes).
    // Each limb's skin is one smooth tube rebuilt whenever the IK moves it: fuller at the elbow/knee, slim at the
    // wrist/ankle, starting with a rounded cap and borrowing the torso's normals where it leaves the body, so there
    // are no joint balls or seams. Resting arms stay compact beside the waist and extend to reach ladder rungs.
    torso.updateMatrix();
    const torsoMatrix=torso.matrix.clone(),torsoProbe=makeProbe(torsoGeo,torsoMatrix);
    const RINGS=18,CAP=3,SIDES=18,ringCount=RINGS+1+CAP;
    const limbNormal=new T.Vector3(),probeNormal=new T.Vector3();
    function limbMesh(rs,rj,rw,bulge){
      const count=ringCount*SIDES,geo=new T.BufferGeometry(),colors=new Float32Array(count*3),index=[];
      tint.set(C.orange);for(let i=0;i<count;i++)colors.set([tint.r,tint.g,tint.b],i*3);
      geo.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3));
      geo.setAttribute('normal',new T.BufferAttribute(new Float32Array(count*3),3));
      geo.setAttribute('color',new T.BufferAttribute(colors,3));
      for(let i=0;i<ringCount-1;i++)for(let j=0;j<SIDES;j++){
        const a=i*SIDES+j,b=i*SIDES+(j+1)%SIDES,c=(i+1)*SIDES+j,d=(i+1)*SIDES+(j+1)%SIDES;
        index.push(a,b,c,b,d,c);
      }
      geo.setIndex(index);
      const mesh=new T.Mesh(geo,furMat);mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;body.add(mesh);
      const point=new T.Vector3(),tangent=new T.Vector3(),n=new T.Vector3(),b=new T.Vector3(),ringAt=new T.Vector3();
      const u1=new T.Vector3(),u2=new T.Vector3(),p1=new T.Vector3(),p2=new T.Vector3(),d1=new T.Vector3(),d2=new T.Vector3();
      const last=new Float32Array(12);
      return function update(start,elbow,end,ref){
        const now=[start.x,start.y,start.z,elbow.x,elbow.y,elbow.z,end.x,end.y,end.z,ref.x,ref.y,ref.z];
        if(now.every((v,k)=>Math.abs(v-last[k])<1e-5))return;
        last.set(now);
        u1.copy(elbow).sub(start);const l1=Math.max(1e-4,u1.length());u1.divideScalar(l1);
        u2.copy(end).sub(elbow);const l2=Math.max(1e-4,u2.length());u2.divideScalar(l2);
        const total=l1+l2,rc=Math.min(.1,.4*Math.min(l1,l2)),te=l1/total;
        const pos=geo.attributes.position;
        const put=(i,center,tan,r)=>{
          n.crossVectors(tan,ref).normalize();b.crossVectors(tan,n);
          for(let j=0;j<SIDES;j++){
            const a=j/SIDES*Math.PI*2,cs=Math.cos(a)*r,sn=Math.sin(a)*r;
            pos.setXYZ(i*SIDES+j,center.x+n.x*cs+b.x*sn,center.y+n.y*cs+b.y*sn,center.z+n.z*cs+b.z*sn);
          }
        };
        for(let c=0;c<CAP;c++){const phi=Math.PI/2*(c/CAP);put(c,ringAt.copy(start).addScaledVector(u1,-rs*Math.cos(phi)),u1,rs*Math.sin(phi));}
        for(let i=0;i<=RINGS;i++){
          const s=i/RINGS*total;
          if(s<=l1-rc){point.copy(start).addScaledVector(u1,s);tangent.copy(u1);}
          else if(s>=l1+rc){point.copy(elbow).addScaledVector(u2,s-l1);tangent.copy(u2);}
          else{
            // Round the corner with a short arc so the elbow/knee is a smooth bend, not a kink.
            const tau=(s-(l1-rc))/(2*rc),k=1-tau;
            p1.copy(elbow).addScaledVector(u1,-rc);p2.copy(elbow).addScaledVector(u2,rc);
            point.set(0,0,0).addScaledVector(p1,k*k).addScaledVector(elbow,2*k*tau).addScaledVector(p2,tau*tau);
            tangent.set(0,0,0).addScaledVector(d1.copy(elbow).sub(p1),2*k).addScaledVector(d2.copy(p2).sub(elbow),2*tau).normalize();
          }
          const t=i/RINGS,base=t<te?rs+(rj-rs)*ss(t/te):rj+(rw-rj)*ss((t-te)/(1-te));
          put(CAP+i,point,tangent,base*(1+bulge*Math.exp(-(((s-l1)/.08)**2))));
        }
        pos.needsUpdate=true;geo.computeVertexNormals();
        const nrm=geo.attributes.normal;
        for(let k=0;k<count;k++){
          const x=pos.getX(k),y=pos.getY(k),z=pos.getZ(k);
          // Only vertices near the torso can be near a join.
          if(x<-.55||x>.55||y<.1||y>1.05||z<-.4||z>.45)continue;
          const d=torsoProbe(x,y,z,probeNormal);if(d>=FAR)continue;
          limbNormal.fromBufferAttribute(nrm,k).lerp(probeNormal,1-step(NEAR,FAR,d)).normalize();
          nrm.setXYZ(k,limbNormal.x,limbNormal.y,limbNormal.z);
        }
        nrm.needsUpdate=true;
      };
    }
    // Mitten hand (origin at the wrist, rounded fingers along +y, thumb toward +x) and a smooth rounded foot
    // (origin at the ankle, toes along +z, sole flat at -0.065).
    const mittenGeo=figure(deform(ball(DETAIL+1),(x,y,z)=>[x*.085*(1-.1*Math.max(0,y)),y*.09,z*.062*(1-.08*Math.max(0,y))]).translate(0,.06,0),()=>C.dark);
    const thumbGeo=figure(deform(ball(DETAIL),(x,y,z)=>[x*.036,y*.06,z*.04]),()=>C.dark);
    const footGeo=figure(deform(ball(DETAIL+2),(x,y,z)=>[x*(.10+.01*Math.max(0,z)),y<0?y*.045:y*.07,z*.135]).translate(0,-.02,.055),()=>C.dark);
    function makeHand(){const g=new T.Group();body.add(g);part(g,mittenGeo);part(g,thumbGeo,.078,.05,.004).rotation.z=-.5;return g;}
    function makeFoot(){const g=new T.Group();body.add(g);part(g,footGeo);return g;}

    const paws=[],basis=new T.Matrix4();
    const vec=(x,y,z)=>new T.Vector3(x,y,z);
    const FOOT_SCALE=1.3,HAND_SCALE=1.2;
    for(const side of [-1,1])for(const upper of [false,true]){
      const root0=upper?vec(side*.315,.68,.02):vec(side*.25,.3,-.02);                    // shoulder / hip
      const length=upper?.3:.22;                                                        // short chubby legs (upper arm = forearm, thigh = lower leg)
      // Fat thigh tapering to a slim ankle, a visible knee; a thick upper arm tapering to a slim wrist.
      const skin=upper?limbMesh(.11,.092,.065,.05):limbMesh(.165,.115,.075,.08);
      const end=upper?makeHand():makeFoot();end.scale.setScalar(upper?HAND_SCALE:FOOT_SCALE);
      // Standing with the weight on one leg: the right foot is a little forward, the left a little back and turned out.
      // Hands hang relaxed, held slightly away from the body.
      const rest=upper?vec(side*.43,.55,.11):vec(side*(side>0?.2:.22),GROUND+.065*FOOT_SCALE+.003,side>0?.08:-.03);
      const restBend=upper?vec(side*.25,0,-.8):vec(0,0,1);                            // elbows back; knees forward
      const climbBend=upper?vec(side*.5,-.8,-.3):vec(side*.5,0,.9);                      // elbows down and out; knees forward
      const inner=vec(-side,0,0),forward=vec(0,0,1),restFingers=vec(side*.08,-1,.18).normalize(),forearm=vec(0,0,0),thumbSide=vec(0,0,0),palm=vec(0,0,0);
      function pose(target,grip=0){
        const reach=upper?length-.13*(1-grip):length;
        const direction=target.clone().sub(root0),distance=Math.min(direction.length(),2*reach-.001);direction.normalize();
        const endpoint=root0.clone().addScaledVector(direction,distance);
        const bend=restBend.clone().lerp(climbBend,grip);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
        const elbow=root0.clone().addScaledVector(direction,distance*.5).addScaledVector(bend,Math.sqrt(Math.max(0,reach*reach-distance*distance*.25)));
        if(upper){
          forearm.copy(endpoint).sub(elbow).normalize();
          skin(root0,elbow,endpoint.clone().addScaledVector(forearm,.04),bend);           // the skin ends inside the mitten
          // Relaxed fingers point down beside the waist; gripping hands follow the forearm.
          palm.copy(restFingers).lerp(forearm,grip).normalize();
          // The thumb points forward on a relaxed hand and turns toward the body to wrap a rung.
          thumbSide.copy(forward).multiplyScalar(1-grip).addScaledVector(inner,grip);thumbSide.addScaledVector(palm,-thumbSide.dot(palm)).normalize();
          basis.makeBasis(thumbSide,palm,new T.Vector3().crossVectors(thumbSide,palm));
          end.quaternion.setFromRotationMatrix(basis);
        }else{
          skin(root0,elbow,endpoint,bend);
          end.rotation.set(grip*.4,side*.3*(1-grip),0);                                   // toes turn out when standing; ball of foot tips onto the rung climbing
        }
        end.position.copy(endpoint);
      }
      pose(rest);paws.push({side,upper,rest,pose,tip:end});
    }

    // One continuous radius profile avoids shoulders in the cream tip. Rings follow the curve
    // so the tail keeps an even cross-section through the bend and narrows to a single point.
    const tail=new T.Group();tail.position.set(.1,.2,-.19);tail.scale.setScalar(.92);body.add(tail);tail.rotation.z=-.85;
    const curve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.05,.28,-.13),new T.Vector3(.03,.62,-.2),new T.Vector3(-.1,.98,-.12)]);
    const tailRadius=t=>(1-t)*(.11+.8*t);
    const rings=44,around=24,grid=[],frames=curve.computeFrenetFrames(rings,false);
    for(let i=0;i<=rings;i++){
      const t=i/rings,c=curve.getPoint(t),r=tailRadius(t);grid.push([]);
      for(let j=0;j<around;j++){
        const a=j/around*Math.PI*2,edge=t+.014*Math.sin(a*3+1.3)+.008*Math.sin(a*5+.4);
        const point=c.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r);
        grid[i].push({p:point.toArray(),color:mix(C.orange,C.cream,step(.65,.70,edge)).getHex()});
      }
    }
    const verts=[],cols=[];
    const tri=(a,b,c)=>{for(const v of [a,b,c]){verts.push(...v.p);tint.setHex(v.color);cols.push(tint.r,tint.g,tint.b);}};
    for(let i=0;i<rings;i++)for(let j=0;j<around;j++){
      const a=grid[i][j],b=grid[i][(j+1)%around],c=grid[i+1][j],d=grid[i+1][(j+1)%around];
      tri(a,b,c);tri(b,d,c);
    }
    const tailGeo=new T.BufferGeometry();tailGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));tailGeo.setAttribute('color',new T.Float32BufferAttribute(cols,3));tailGeo.computeVertexNormals();smoothNormals(tailGeo);
    part(tail,tailGeo);

    // Blend shading across the static joins: neck (head <-> torso), ear bases (-> head) and tail base (-> torso).
    const headMatrix=placed(head);
    weld(torsoGeo,torsoMatrix,headGeo,headMatrix);
    const headProbe=makeProbe(headGeo,headMatrix);
    for(const {ear,rim,face} of earParts){
      const m=placed(ear,headMatrix);
      blendNormals(rim,m,headProbe,'take');
      const faceMatrix=m.clone().multiply(new T.Matrix4().makeTranslation(0,.03,.05));
      blendNormals(face,faceMatrix,headProbe,'take');
    }
    blendNormals(tailGeo,placed(tail),torsoProbe,'take');

    // A soft contact shadow under the idle fox (fades as it starts climbing). Browser only.
    let setSit=()=>{};
    if(typeof document!=='undefined'){
      const blob=document.createElement('canvas');blob.width=blob.height=128;
      const bctx=blob.getContext('2d'),grad=bctx.createRadialGradient(64,64,4,64,64,62);grad.addColorStop(0,'rgba(28,22,12,.55)');grad.addColorStop(1,'rgba(28,22,12,0)');
      bctx.fillStyle=grad;bctx.fillRect(0,0,128,128);
      const shadow=new T.Mesh(new T.PlaneGeometry(1.7,1.5).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:new T.CanvasTexture(blob),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
      shadow.renderOrder=-1;parent.add(shadow);
      setSit=(sit,at)=>{shadow.visible=sit>.02;shadow.material.opacity=sit;shadow.position.set(at.x,at.y+GROUND+.012,at.z+.06);};
    }
    return {root,body,head,tail,paws,eyes,ears,setBlink,setSit,sitDrop:-IDLE_LIFT};
  }
  return {island,ladder,lantern,fox};
}
