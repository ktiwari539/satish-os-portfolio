(()=>{
'use strict';

const params=new URLSearchParams(location.search);
if(params.get('character')!=='3d') return;

const host=document.querySelector('.hero-visual');
const fallback=document.getElementById('heroIdle');
if(!host||!fallback) return;

const canvas=document.createElement('canvas');
canvas.id='heroCharacter3D';
canvas.className='hero-character-3d';
canvas.setAttribute('aria-label','Interactive 3D character');
canvas.hidden=true;
host.insertBefore(canvas,host.querySelector('.video-cover'));

const debug=params.get('debug')==='1';
let badge=null;
if(debug){
  badge=document.createElement('div');
  badge.className='character-3d-status';
  badge.textContent='3D · loading';
  host.appendChild(badge);
}
const setStatus=(text,state='')=>{
  if(!badge)return;
  badge.textContent=text;
  badge.dataset.state=state;
};

const defaultModel='assets/character/satish-avatar.glb?v=20260928';
const modelUrl=params.get('model')||defaultModel;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

const aliases={
  head:['head','head_end','headjoint','head_joint','cc_base_head'],
  neck:['neck','neck1','neck_01','cc_base_necktwist01','cc_base_necktwist02'],
  eyeL:['eye_l','eyel','left_eye','lefteye','cc_base_l_eye'],
  eyeR:['eye_r','eyer','right_eye','righteye','cc_base_r_eye'],
  upperArmR:['upperarm_r','rightarm','right_arm','arm_r','cc_base_r_upperarm'],
  foreArmR:['lowerarm_r','forearm_r','rightforearm','right_forearm','cc_base_r_forearm']
};

const normalize=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const findNode=(root,names)=>{
  const wanted=names.map(normalize);
  let exact=null,partial=null;
  root.traverse(o=>{
    if(exact||!o.name)return;
    const n=normalize(o.name);
    if(wanted.includes(n)) exact=o;
    else if(!partial&&wanted.some(w=>n.includes(w)||w.includes(n))) partial=o;
  });
  return exact||partial;
};
const cloneEuler=o=>({x:o.rotation.x,y:o.rotation.y,z:o.rotation.z});

async function start(){
  try{
    setStatus('3D · loading engine');
    const THREE=await import('https://esm.sh/three@0.181.1');
    const {GLTFLoader}=await import('https://esm.sh/three@0.181.1/examples/jsm/loaders/GLTFLoader.js');

    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.05;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(32,1,.01,100);
    camera.position.set(0,1.55,4.4);

    scene.add(new THREE.HemisphereLight(0xffffff,0x71859a,2.35));
    const key=new THREE.DirectionalLight(0xffffff,3.3);key.position.set(3.2,5.2,4.5);scene.add(key);
    const rim=new THREE.DirectionalLight(0x76baff,1.8);rim.position.set(-3.5,2.8,-2);scene.add(rim);
    const warm=new THREE.PointLight(0xffd3a1,1.25,10);warm.position.set(2.8,1.5,2.6);scene.add(warm);

    setStatus('3D · loading avatar');
    const loader=new GLTFLoader();
    const gltf=await loader.loadAsync(modelUrl);
    const model=gltf.scene;
    scene.add(model);

    // Fit model to the hero frame without assuming a particular avatar generator.
    const box=new THREE.Box3().setFromObject(model);
    const size=box.getSize(new THREE.Vector3());
    const center=box.getCenter(new THREE.Vector3());
    if(!Number.isFinite(size.y)||size.y<=0) throw new Error('Avatar bounds are invalid');
    const targetHeight=3.15;
    const scale=targetHeight/size.y;
    model.scale.setScalar(scale);
    const fitted=new THREE.Box3().setFromObject(model);
    const fittedCenter=fitted.getCenter(new THREE.Vector3());
    const fittedSize=fitted.getSize(new THREE.Vector3());
    model.position.x-=fittedCenter.x;
    model.position.y-=fitted.min.y;
    model.position.z-=fittedCenter.z;
    camera.position.set(0,fittedSize.y*.52,Math.max(3.2,fittedSize.y*1.25));
    camera.lookAt(0,fittedSize.y*.48,0);

    const head=findNode(model,aliases.head);
    const neck=findNode(model,aliases.neck);
    const eyeL=findNode(model,aliases.eyeL);
    const eyeR=findNode(model,aliases.eyeR);
    const upperArmR=findNode(model,aliases.upperArmR);
    const foreArmR=findNode(model,aliases.foreArmR);

    const base={
      head:head?cloneEuler(head):null,
      neck:neck?cloneEuler(neck):null,
      eyeL:eyeL?cloneEuler(eyeL):null,
      eyeR:eyeR?cloneEuler(eyeR):null,
      upperArmR:upperArmR?cloneEuler(upperArmR):null,
      foreArmR:foreArmR?cloneEuler(foreArmR):null
    };

    const blinkTargets=[];
    model.traverse(o=>{
      if(!o.morphTargetDictionary||!o.morphTargetInfluences)return;
      for(const [name,index] of Object.entries(o.morphTargetDictionary)){
        const n=normalize(name);
        if(n.includes('blink')||n.includes('eyeblink')) blinkTargets.push({mesh:o,index});
      }
    });

    let target={x:0,y:0},headAim={x:0,y:0},eyeAim={x:0,y:0};
    let waveStart=0,blinkStart=0,nextBlink=performance.now()+1800+Math.random()*2200;

    const resize=()=>{
      const r=host.getBoundingClientRect();
      renderer.setSize(Math.max(1,r.width),Math.max(1,r.height),false);
      camera.aspect=Math.max(.1,r.width/Math.max(1,r.height));
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(host);resize();

    host.addEventListener('pointermove',e=>{
      const r=host.getBoundingClientRect();
      target.x=THREE.MathUtils.clamp(((e.clientX-r.left)/r.width)*2-1,-1,1);
      target.y=THREE.MathUtils.clamp(-(((e.clientY-r.top)/r.height)*2-1),-1,1);
    });
    host.addEventListener('pointerleave',()=>{target.x=0;target.y=0});
    canvas.addEventListener('click',()=>{if(!reduced)waveStart=performance.now()});

    const clock=new THREE.Clock();
    let firstFrame=false;
    function animate(now){
      requestAnimationFrame(animate);
      const dt=Math.min(clock.getDelta(),.05);
      const hEase=1-Math.pow(.001,dt*.42);
      const eEase=1-Math.pow(.001,dt*1.55);
      headAim.x=THREE.MathUtils.lerp(headAim.x,target.x,hEase);
      headAim.y=THREE.MathUtils.lerp(headAim.y,target.y,hEase);
      eyeAim.x=THREE.MathUtils.lerp(eyeAim.x,target.x,eEase);
      eyeAim.y=THREE.MathUtils.lerp(eyeAim.y,target.y,eEase);

      if(head&&base.head){
        head.rotation.y=base.head.y+headAim.x*.22;
        head.rotation.x=base.head.x-headAim.y*.11;
      }
      if(neck&&base.neck){
        neck.rotation.y=base.neck.y+headAim.x*.085;
        neck.rotation.x=base.neck.x-headAim.y*.035;
      }
      for(const [eye,b] of [[eyeL,base.eyeL],[eyeR,base.eyeR]]){
        if(eye&&b){
          eye.rotation.y=b.y+eyeAim.x*.15;
          eye.rotation.x=b.x-eyeAim.y*.1;
        }
      }

      if(!reduced&&blinkTargets.length){
        if(!blinkStart&&now>nextBlink)blinkStart=now;
        if(blinkStart){
          const elapsed=now-blinkStart;
          const t=elapsed<85?elapsed/85:Math.max(0,1-(elapsed-85)/110);
          blinkTargets.forEach(x=>x.mesh.morphTargetInfluences[x.index]=THREE.MathUtils.clamp(t,0,1));
          if(elapsed>195){
            blinkTargets.forEach(x=>x.mesh.morphTargetInfluences[x.index]=0);
            blinkStart=0;nextBlink=now+2200+Math.random()*3200;
          }
        }
      }

      if(!reduced&&waveStart&&upperArmR&&base.upperArmR){
        const elapsed=now-waveStart;
        if(elapsed<2200){
          const enter=Math.min(1,elapsed/350);
          const leave=Math.max(0,(elapsed-1800)/400);
          const w=enter*(1-leave);
          upperArmR.rotation.z=base.upperArmR.z-1.05*w;
          upperArmR.rotation.x=base.upperArmR.x-.28*w;
          if(foreArmR&&base.foreArmR){
            foreArmR.rotation.z=base.foreArmR.z-.55*w;
            foreArmR.rotation.y=base.foreArmR.y+Math.sin(elapsed*.015)*.32*w;
          }
        }else{
          upperArmR.rotation.set(base.upperArmR.x,base.upperArmR.y,base.upperArmR.z);
          if(foreArmR&&base.foreArmR)foreArmR.rotation.set(base.foreArmR.x,base.foreArmR.y,base.foreArmR.z);
          waveStart=0;
        }
      }

      if(!reduced)model.position.y+=Math.sin(now*.0017)*.00008;
      renderer.render(scene,camera);

      if(!firstFrame){
        firstFrame=true;
        canvas.hidden=false;
        requestAnimationFrame(()=>{
          host.classList.add('character-3d-ready');
          fallback.pause();
          setStatus('3D · ready','ready');
        });
      }
      window.__SATISH3D__={
        ready:true,
        modelUrl,
        bones:{head:!!head,neck:!!neck,eyeL:!!eyeL,eyeR:!!eyeR,upperArmR:!!upperArmR,foreArmR:!!foreArmR},
        blinkMorphs:blinkTargets.length,
        target:{...target}
      };
    }
    requestAnimationFrame(animate);
  }catch(error){
    console.warn('[Satish3D] Falling back to cinematic video:',error);
    canvas.remove();
    fallback.play().catch(()=>{});
    setStatus('3D · video fallback','fallback');
    window.__SATISH3D__={ready:false,fallback:true,error:String(error?.message||error),modelUrl};
  }
}
start();
})();
