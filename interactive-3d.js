import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.181.1/build/three.module.js';

const canvas=document.getElementById('avatarCanvas');
const stage=document.getElementById('stage');
const headReadout=document.getElementById('headReadout');
const eyeReadout=document.getElementById('eyeReadout');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0xeaf3f7,.018);
const camera=new THREE.PerspectiveCamera(33,1,.1,100);
camera.position.set(0,1.85,8.7);
camera.lookAt(0,1.55,0);

scene.add(new THREE.HemisphereLight(0xfafcff,0x8fa8b6,2.1));
const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(3.5,6,5);key.castShadow=true;scene.add(key);
const rim=new THREE.DirectionalLight(0x6ab9ff,2.0);rim.position.set(-5,3,-2);scene.add(rim);
const warm=new THREE.PointLight(0xffc98c,1.5,12);warm.position.set(3,2.4,1);scene.add(warm);

const floor=new THREE.Mesh(new THREE.CircleGeometry(5.8,64),new THREE.MeshStandardMaterial({color:0xe9f0f3,roughness:.95,metalness:0}));
floor.rotation.x=-Math.PI/2;floor.position.y=-1.45;floor.receiveShadow=true;scene.add(floor);

const avatar=new THREE.Group();avatar.position.y=.15;scene.add(avatar);
const torso=new THREE.Group();torso.position.y=-.35;avatar.add(torso);
const neck=new THREE.Group();neck.position.set(0,1.15,.05);torso.add(neck);
const head=new THREE.Group();head.position.set(0,.38,0);neck.add(head);

const mat={
 skin:new THREE.MeshStandardMaterial({color:0xb97855,roughness:.73}),
 skinLight:new THREE.MeshStandardMaterial({color:0xc98865,roughness:.72}),
 hair:new THREE.MeshStandardMaterial({color:0x17191d,roughness:.8}),
 beard:new THREE.MeshStandardMaterial({color:0x202126,roughness:.9}),
 blazer:new THREE.MeshStandardMaterial({color:0x172536,roughness:.62,metalness:.08}),
 shirt:new THREE.MeshStandardMaterial({color:0xf2f0e9,roughness:.92}),
 eye:new THREE.MeshStandardMaterial({color:0xf6f8f7,roughness:.45}),
 iris:new THREE.MeshStandardMaterial({color:0x403225,roughness:.4}),
 pupil:new THREE.MeshStandardMaterial({color:0x0a0c0f,roughness:.35}),
 desk:new THREE.MeshStandardMaterial({color:0x6e4a33,roughness:.76}),
 laptop:new THREE.MeshStandardMaterial({color:0xc8ced2,roughness:.35,metalness:.6}),
 screen:new THREE.MeshStandardMaterial({color:0x173b56,emissive:0x0a2941,emissiveIntensity:1.2})
};
function mesh(g,m,parent=avatar){const x=new THREE.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;parent.add(x);return x}

// Torso / blazer
const body=mesh(new THREE.CapsuleGeometry(.92,1.25,8,20),mat.blazer,torso);body.scale.set(1.12,1,.62);body.position.y=-.05;
const shirt=mesh(new THREE.CylinderGeometry(.34,.48,.9,32),mat.shirt,torso);shirt.position.set(0,.38,.52);shirt.scale.z=.45;
const neckMesh=mesh(new THREE.CylinderGeometry(.27,.31,.38,24),mat.skin,neck);neckMesh.position.y=.06;

// Head
const face=mesh(new THREE.SphereGeometry(.72,48,36),mat.skinLight,head);face.scale.set(.86,1.08,.92);face.position.y=.17;
const ears=[-1,1].map(s=>{const e=mesh(new THREE.SphereGeometry(.13,20,16),mat.skin,head);e.scale.set(.55,1,.45);e.position.set(s*.64,.19,.02);return e});
const nose=mesh(new THREE.ConeGeometry(.095,.34,20),mat.skin,head);nose.rotation.x=Math.PI/2;nose.position.set(0,.16,.69);

// Hair cap + tied hair impression
const hairCap=mesh(new THREE.SphereGeometry(.735,40,24,0,Math.PI*2,0,Math.PI*.48),mat.hair,head);hairCap.scale.set(.88,1.02,.94);hairCap.position.y=.25;
const hairBack=mesh(new THREE.SphereGeometry(.39,28,20),mat.hair,head);hairBack.position.set(0,.43,-.58);hairBack.scale.set(1.1,.88,.48);
const bun=mesh(new THREE.SphereGeometry(.22,24,18),mat.hair,head);bun.position.set(0,.48,-.88);bun.scale.set(1,.8,.7);

// Beard / moustache
const beard=mesh(new THREE.SphereGeometry(.66,36,22,0,Math.PI*2,Math.PI*.5,Math.PI*.47),mat.beard,head);beard.scale.set(.8,.88,.95);beard.position.set(0,.06,.055);
const moustacheL=mesh(new THREE.CapsuleGeometry(.045,.24,4,10),mat.beard,head);moustacheL.rotation.z=Math.PI/2+.18;moustacheL.rotation.x=Math.PI/2;moustacheL.position.set(-.13,.02,.665);
const moustacheR=moustacheL.clone();moustacheR.rotation.z=Math.PI/2-.18;moustacheR.position.x=.13;head.add(moustacheR);

// Eyes
const eyeGroups=[];
for(const s of [-1,1]){
  const eg=new THREE.Group();eg.position.set(s*.28,.31,.62);head.add(eg);
  const white=mesh(new THREE.SphereGeometry(.115,28,20),mat.eye,eg);white.scale.set(1.28,.72,.42);
  const iris=mesh(new THREE.SphereGeometry(.058,24,18),mat.iris,eg);iris.position.z=.092;iris.scale.z=.35;
  const pupil=mesh(new THREE.SphereGeometry(.027,20,16),mat.pupil,eg);pupil.position.z=.12;pupil.scale.z=.28;
  const shine=mesh(new THREE.SphereGeometry(.009,12,8),new THREE.MeshBasicMaterial({color:0xffffff}),eg);shine.position.set(-.012,.014,.137);
  eyeGroups.push({group:eg,white,iris,pupil,shine,baseX:s*.28});
}

// Brows
for(const s of [-1,1]){
 const brow=mesh(new THREE.CapsuleGeometry(.025,.19,4,10),mat.hair,head);brow.rotation.z=Math.PI/2+(s*.12);brow.rotation.x=Math.PI/2;brow.position.set(s*.28,.49,.69);
}

// Mouth line
const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(-.17,-.12,.68),new THREE.Vector3(0,-.19,.72),new THREE.Vector3(.17,-.12,.68));
const mouthGeo=new THREE.BufferGeometry().setFromPoints(curve.getPoints(24));
const mouth=new THREE.Line(mouthGeo,new THREE.LineBasicMaterial({color:0x6d2e2b}));head.add(mouth);

// Arms
function arm(side){
 const shoulder=new THREE.Group();shoulder.position.set(side*.88,.58,.02);torso.add(shoulder);
 const upper=mesh(new THREE.CapsuleGeometry(.17,.78,6,16),mat.blazer,shoulder);upper.position.y=-.38;upper.rotation.z=side*.08;
 const elbow=new THREE.Group();elbow.position.set(0,-.81,0);shoulder.add(elbow);
 const fore=mesh(new THREE.CapsuleGeometry(.145,.66,6,16),mat.blazer,elbow);fore.position.y=-.32;
 const hand=mesh(new THREE.SphereGeometry(.18,24,18),mat.skin,elbow);hand.position.set(0,-.76,0);hand.scale.set(.8,1.15,.72);
 return {shoulder,elbow,upper,fore,hand};
}
const leftArm=arm(-1),rightArm=arm(1);
leftArm.shoulder.rotation.z=.44;leftArm.elbow.rotation.z=-.35;
rightArm.shoulder.rotation.z=-.44;rightArm.elbow.rotation.z=.35;

// Desk and laptop
const desk=mesh(new THREE.BoxGeometry(5.2,.18,2),mat.desk,scene);desk.position.set(0,-1.18,.65);desk.castShadow=true;
const laptopBase=mesh(new THREE.BoxGeometry(1.7,.08,1.08),mat.laptop,scene);laptopBase.position.set(0,-1.02,.65);laptopBase.rotation.x=-.05;
const screenGroup=new THREE.Group();screenGroup.position.set(0,-.56,.14);screenGroup.rotation.x=-.12;scene.add(screenGroup);
const screenBack=mesh(new THREE.BoxGeometry(1.72,1.02,.08),mat.laptop,screenGroup);
const screen=mesh(new THREE.PlaneGeometry(1.56,.86),mat.screen,screenGroup);screen.position.z=.046;
const codeMat=new THREE.MeshBasicMaterial({color:0x6fd4ff});
for(let i=0;i<5;i++){const line=mesh(new THREE.BoxGeometry(.92-(i%2)*.22,.022,.01),codeMat,screenGroup);line.position.set(-.18,.25-i*.13,.052)}

// Ambient props
for(const [x,z,s] of [[-2.3,-.4,.24],[2.2,-.2,.22],[2.6,1.3,.18]]){
 const pot=mesh(new THREE.CylinderGeometry(s*.55,s*.7,s*.8,18),new THREE.MeshStandardMaterial({color:0xe5d8ca,roughness:.9}),scene);pot.position.set(x,-1.25,z);
 for(let i=0;i<5;i++){const leaf=mesh(new THREE.SphereGeometry(s*.75,16,10),new THREE.MeshStandardMaterial({color:0x47745b,roughness:.9}),scene);leaf.scale.set(.32,1,.24);leaf.rotation.z=(i-2)*.34;leaf.position.set(x+(i-2)*s*.17,-.82+Math.abs(i-2)*.03,z)}
}

let pointer={x:0,y:0},target={x:0,y:0},smooth={x:0,y:0};
let tracking=true,waveStart=0,blinking=false,nextBlink=performance.now()+1800+Math.random()*1800;
const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function resize(){
 const r=stage.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);resize();

function setPointer(clientX,clientY){
 const r=stage.getBoundingClientRect();pointer.x=((clientX-r.left)/r.width)*2-1;pointer.y=-(((clientY-r.top)/r.height)*2-1);
 target.x=THREE.MathUtils.clamp(pointer.x,-1,1);target.y=THREE.MathUtils.clamp(pointer.y,-1,1);
}
stage.addEventListener('pointermove',e=>{if(tracking)setPointer(e.clientX,e.clientY)});
stage.addEventListener('pointerleave',()=>{target.x=0;target.y=0});
stage.addEventListener('click',e=>{if(e.target===canvas)startWave()});
document.getElementById('focusBtn').addEventListener('click',()=>{tracking=!tracking;document.getElementById('focusBtn').textContent=tracking?'Look at cursor':'Tracking paused';if(!tracking){target.x=0;target.y=0}});
document.getElementById('waveBtn').addEventListener('click',startWave);
document.getElementById('resetBtn').addEventListener('click',()=>{target.x=target.y=0;tracking=true;document.getElementById('focusBtn').textContent='Look at cursor'});
function startWave(){waveStart=performance.now()}

function updateBlink(t){
 if(prefersReduced)return;
 if(!blinking&&t>nextBlink){blinking=true}
 if(blinking){
   const elapsed=t-nextBlink;
   const scale=elapsed<85?THREE.MathUtils.lerp(1,.06,elapsed/85):THREE.MathUtils.lerp(.06,1,Math.min(1,(elapsed-85)/100));
   eyeGroups.forEach(e=>e.group.scale.y=scale);
   if(elapsed>185){eyeGroups.forEach(e=>e.group.scale.y=1);blinking=false;nextBlink=t+2200+Math.random()*3400}
 }
}
function updateWave(t){
 const dt=t-waveStart;
 if(waveStart&&dt<2500&&!prefersReduced){
   const enter=Math.min(1,dt/380),leave=Math.max(0,(dt-2050)/450),w=enter*(1-leave);
   rightArm.shoulder.rotation.x=-.28*w;
   rightArm.shoulder.rotation.z=THREE.MathUtils.lerp(-.44,-1.18,w);
   rightArm.elbow.rotation.z=THREE.MathUtils.lerp(.35,-.28,w);
   rightArm.elbow.rotation.y=Math.sin(dt*.014)*.55*w;
 } else if(waveStart){
   waveStart=0;rightArm.shoulder.rotation.x=0;rightArm.shoulder.rotation.z=-.44;rightArm.elbow.rotation.z=.35;rightArm.elbow.rotation.y=0;
 }
}

const clock=new THREE.Clock();
function animate(t){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05);
 const ease=1-Math.pow(.001,dt);
 smooth.x=THREE.MathUtils.lerp(smooth.x,target.x,ease*.42);
 smooth.y=THREE.MathUtils.lerp(smooth.y,target.y,ease*.42);
 const headYaw=smooth.x*.22,headPitch=smooth.y*.12;
 neck.rotation.y=THREE.MathUtils.lerp(neck.rotation.y,headYaw*.42,.12);
 neck.rotation.x=THREE.MathUtils.lerp(neck.rotation.x,-headPitch*.26,.12);
 head.rotation.y=THREE.MathUtils.lerp(head.rotation.y,headYaw,.18);
 head.rotation.x=THREE.MathUtils.lerp(head.rotation.x,-headPitch,.18);
 torso.rotation.y=THREE.MathUtils.lerp(torso.rotation.y,headYaw*.12,.03);
 const eyeX=smooth.x*.085,eyeY=smooth.y*.055;
 eyeGroups.forEach(e=>{e.iris.position.x=eyeX;e.pupil.position.x=eyeX;e.shine.position.x=eyeX-.012;e.iris.position.y=eyeY;e.pupil.position.y=eyeY;e.shine.position.y=eyeY+.014});
 if(!prefersReduced){const breathe=Math.sin(t*.0018)*.018;torso.position.y=-.35+breathe;avatar.rotation.z=Math.sin(t*.00055)*.006}
 updateBlink(t);updateWave(t);
 headReadout.textContent=(THREE.MathUtils.radToDeg(head.rotation.y)).toFixed(1)+'°, '+(THREE.MathUtils.radToDeg(head.rotation.x)).toFixed(1)+'°';
 eyeReadout.textContent=eyeX.toFixed(2)+', '+eyeY.toFixed(2);
 renderer.render(scene,camera);
 window.__SATISH3D__={ready:true,headYaw:head.rotation.y,headPitch:head.rotation.x,eyeX,eyeY,tracking,waving:!!waveStart};
}
requestAnimationFrame(animate);
canvas.dataset.ready='true';
