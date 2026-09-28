(()=>{
'use strict';

const params=new URLSearchParams(location.search);
const enabled=params.get('character')==='3d'||location.pathname.includes('/polish3d/');
if(!enabled)return;

const host=document.querySelector('.hero-visual');
const fallback=document.getElementById('heroIdle');
if(!host||!fallback)return;

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

const defaultModel='assets/character/satish-avatar.glb?v=20260928-avaturn1';
const modelUrl=params.get('model')||defaultModel;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

const aliases={
  head:['head','head_end','headjoint','head_joint','cc_base_head'],
  neck:['neck','neck1','neck_01','cc_base_necktwist01','cc_base_necktwist02'],
  eyeL:['eye_l','eyel','left_eye','lefteye','cc_base_l_eye'],
  eyeR:['eye_r','eyer','right_eye','righteye','cc_base_r_eye'],
  upperArmR:['rightarm','upperarm_r','right_arm','arm_r','cc_base_r_upperarm'],
  foreArmR:['rightforearm','lowerarm_r','forearm_r','right_forearm','cc_base_r_forearm']
};

const normalize=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const findNode=(root,names)=>{
  const wanted=names.map(normalize);
  let exact=null,partial=null;
  root.traverse(o=>{
    if(exact||!o.name)return;
    const n=normalize(o.name);
    if(wanted.includes(n))exact=o;
    else if(!partial&&wanted.some(w=>n.includes(w)||w.includes(n)))partial=o;
  });
  return exact||partial;
};
const copyRotation=o=>({x:o.rotation.x,y:o.rotation.y,z:o.rotation.z});
const applyRotation=(o,b,dx=0,dy=0,dz=0)=>{
  if(!o||!b)return;
  o.rotation.set(b.x+dx,b.y+dy,b.z+dz);
};

async function start(){
  try{
    setStatus('3D · loading engine');
    const THREE=await import('https://esm.sh/three@0.181.1');
    const {GLTFLoader}=await import('https://esm.sh/three@0.181.1/examples/jsm/loaders/GLTFLoader.js');

    const renderer=new THREE.WebGLRenderer({
      canvas,
      antialias:true,
      alpha:true,
      powerPreference:'high-performance'
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.08;
    renderer.shadowMap.enabled=true;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(31,1,.01,100);

    scene.add(new THREE.HemisphereLight(0xffffff,0x7891a2,2.4));
    const key=new THREE.DirectionalLight(0xffffff,3.15);
    key.position.set(3.2,5.4,4.6);
    key.castShadow=true;
    scene.add(key);
    const rim=new THREE.DirectionalLight(0x77bfff,1.7);
    rim.position.set(-4,3,-2.5);
    scene.add(rim);
    const warm=new THREE.PointLight(0xffd3a1,1.15,12);
    warm.position.set(3.3,2.3,2.8);
    scene.add(warm);

    setStatus('3D · loading avatar');
    const loader=new GLTFLoader();
    const gltf=await loader.loadAsync(modelUrl);
    const model=gltf.scene;
    scene.add(model);

    model.traverse(o=>{
      if(o.isMesh){
        o.castShadow=true;
        o.receiveShadow=true;
        if(o.material){
          const materials=Array.isArray(o.material)?o.material:[o.material];
          materials.forEach(m=>{
            if('envMapIntensity'in m)m.envMapIntensity=.65;
            m.needsUpdate=true;
          });
        }
      }
    });

    const initialBox=new THREE.Box3().setFromObject(model);
    const initialSize=initialBox.getSize(new THREE.Vector3());
    if(!Number.isFinite(initialSize.y)||initialSize.y<=0)throw new Error('Avatar bounds are invalid');

    const targetHeight=3.2;
    const scale=targetHeight/initialSize.y;
    model.scale.setScalar(scale);

    let fitted=new THREE.Box3().setFromObject(model);
    let fittedCenter=fitted.getCenter(new THREE.Vector3());
    let fittedSize=fitted.getSize(new THREE.Vector3());
    model.position.set(-fittedCenter.x,-fitted.min.y,-fittedCenter.z);

    // Re-measure after centering. The Avaturn model is full-body, so the camera
    // intentionally keeps feet and hair inside frame rather than cropping them.
    fitted=new THREE.Box3().setFromObject(model);
    fittedCenter=fitted.getCenter(new THREE.Vector3());
    fittedSize=fitted.getSize(new THREE.Vector3());
    const baseModelY=model.position.y;

    const head=findNode(model,aliases.head);
    const neck=findNode(model,aliases.neck);
    const eyeL=findNode(model,aliases.eyeL);
    const eyeR=findNode(model,aliases.eyeR);
    const upperArmR=findNode(model,aliases.upperArmR);
    const foreArmR=findNode(model,aliases.foreArmR);

    const rest={
      head:head?copyRotation(head):null,
      neck:neck?copyRotation(neck):null,
      eyeL:eyeL?copyRotation(eyeL):null,
      eyeR:eyeR?copyRotation(eyeR):null,
      upperArmR:upperArmR?copyRotation(upperArmR):null,
      foreArmR:foreArmR?copyRotation(foreArmR):null
    };

    const blinkTargets=[];
    model.traverse(o=>{
      if(!o.morphTargetDictionary||!o.morphTargetInfluences)return;
      for(const [name,index] of Object.entries(o.morphTargetDictionary)){
        const n=normalize(name);
        if(n.includes('blink')||n.includes('eyeblink'))blinkTargets.push({mesh:o,index});
      }
    });

    // Avaturn exports an idle clip. Keep it alive and add cursor/wave offsets
    // after the mixer updates each frame.
    let mixer=null;
    let activeAnimation='';
    if(gltf.animations?.length){
      mixer=new THREE.AnimationMixer(model);
      const preferred=gltf.animations.find(a=>/idle/i.test(a.name||''))||gltf.animations[0];
      const action=mixer.clipAction(preferred);
      action.reset().fadeIn(.25).play();
      activeAnimation=preferred.name||'animation';
    }

    const currentPose=()=>{
      const source=mixer?{
        head:head?copyRotation(head):null,
        neck:neck?copyRotation(neck):null,
        eyeL:eyeL?copyRotation(eyeL):null,
        eyeR:eyeR?copyRotation(eyeR):null,
        upperArmR:upperArmR?copyRotation(upperArmR):null,
        foreArmR:foreArmR?copyRotation(foreArmR):null
      }:rest;
      return source;
    };

    let target={x:0,y:0};
    let headAim={x:0,y:0};
    let eyeAim={x:0,y:0};
    let waveStart=0;
    let blinkStart=0;
    let nextBlink=performance.now()+1800+Math.random()*2200;

    const frameCamera=()=>{
      const r=host.getBoundingClientRect();
      const width=Math.max(1,r.width);
      const height=Math.max(1,r.height);
      renderer.setSize(width,height,false);
      camera.aspect=Math.max(.1,width/height);
      camera.updateProjectionMatrix();

      const vFov=THREE.MathUtils.degToRad(camera.fov);
      const hFov=2*Math.atan(Math.tan(vFov/2)*camera.aspect);
      const distanceY=(fittedSize.y/2)/Math.tan(vFov/2);
      const distanceX=(fittedSize.x/2)/Math.tan(Math.max(.08,hFov/2));
      const distance=Math.max(distanceY,distanceX)*1.13;

      const focusY=fitted.min.y+fittedSize.y*.51;
      camera.position.set(0,focusY,distance);
      camera.lookAt(0,focusY,0);
    };
    new ResizeObserver(frameCamera).observe(host);
    frameCamera();

    host.addEventListener('pointermove',e=>{
      const r=host.getBoundingClientRect();
      target.x=THREE.MathUtils.clamp(((e.clientX-r.left)/r.width)*2-1,-1,1);
      target.y=THREE.MathUtils.clamp(-(((e.clientY-r.top)/r.height)*2-1),-1,1);
    });
    host.addEventListener('pointerleave',()=>{target.x=0;target.y=0});
    canvas.addEventListener('click',()=>{if(!reduced&&upperArmR)waveStart=performance.now()});

    const clock=new THREE.Clock();
    let firstFrame=false;

    function animate(now){
      requestAnimationFrame(animate);
      const dt=Math.min(clock.getDelta(),.05);

      if(mixer)mixer.update(dt);
      const pose=currentPose();

      const hEase=1-Math.pow(.001,dt*.42);
      const eEase=1-Math.pow(.001,dt*1.55);
      headAim.x=THREE.MathUtils.lerp(headAim.x,target.x,hEase);
      headAim.y=THREE.MathUtils.lerp(headAim.y,target.y,hEase);
      eyeAim.x=THREE.MathUtils.lerp(eyeAim.x,target.x,eEase);
      eyeAim.y=THREE.MathUtils.lerp(eyeAim.y,target.y,eEase);

      // This uploaded Avaturn export has Head/Neck but no separate eye bones.
      // Eye offsets activate automatically if a later avatar export includes them.
      if(head&&pose.head)applyRotation(head,pose.head,-headAim.y*.095,headAim.x*.19,0);
      if(neck&&pose.neck)applyRotation(neck,pose.neck,-headAim.y*.03,headAim.x*.07,0);
      if(eyeL&&pose.eyeL)applyRotation(eyeL,pose.eyeL,-eyeAim.y*.095,eyeAim.x*.14,0);
      if(eyeR&&pose.eyeR)applyRotation(eyeR,pose.eyeR,-eyeAim.y*.095,eyeAim.x*.14,0);

      if(!reduced&&blinkTargets.length){
        if(!blinkStart&&now>nextBlink)blinkStart=now;
        if(blinkStart){
          const elapsed=now-blinkStart;
          const value=elapsed<85?elapsed/85:Math.max(0,1-(elapsed-85)/110);
          blinkTargets.forEach(x=>x.mesh.morphTargetInfluences[x.index]=THREE.MathUtils.clamp(value,0,1));
          if(elapsed>195){
            blinkTargets.forEach(x=>x.mesh.morphTargetInfluences[x.index]=0);
            blinkStart=0;
            nextBlink=now+2200+Math.random()*3200;
          }
        }
      }

      if(!reduced&&waveStart&&upperArmR&&pose.upperArmR){
        const elapsed=now-waveStart;
        if(elapsed<2300){
          const enter=Math.min(1,elapsed/380);
          const leave=Math.max(0,(elapsed-1880)/420);
          const w=enter*(1-leave);
          applyRotation(
            upperArmR,
            pose.upperArmR,
            -.24*w,
            0,
            -1.02*w
          );
          if(foreArmR&&pose.foreArmR){
            applyRotation(
              foreArmR,
              pose.foreArmR,
              0,
              Math.sin(elapsed*.016)*.28*w,
              -.5*w
            );
          }
        }else waveStart=0;
      }

      if(!reduced&&!mixer)model.position.y=baseModelY+Math.sin(now*.0017)*.012;

      renderer.render(scene,camera);

      if(!firstFrame){
        firstFrame=true;
        canvas.hidden=false;
        requestAnimationFrame(()=>{
          host.classList.add('character-3d-ready');
          fallback.pause();
          setStatus(
            eyeL&&eyeR?'3D · eyes + head ready':'3D · head tracking ready',
            'ready'
          );
        });
      }

      window.__SATISH3D__={
        ready:true,
        modelUrl,
        source:'rigged-glb',
        activeAnimation,
        bones:{
          head:!!head,
          neck:!!neck,
          eyeL:!!eyeL,
          eyeR:!!eyeR,
          upperArmR:!!upperArmR,
          foreArmR:!!foreArmR
        },
        blinkMorphs:blinkTargets.length,
        capabilities:{
          headTracking:!!head,
          eyeTracking:!!eyeL&&!!eyeR,
          blinking:blinkTargets.length>0,
          wave:!!upperArmR,
          idle:!!activeAnimation
        },
        target:{...target}
      };
    }

    requestAnimationFrame(animate);
  }catch(error){
    console.warn('[Satish3D] Falling back to cinematic video:',error);
    canvas.remove();
    host.classList.remove('character-3d-ready');
    fallback.play().catch(()=>{});
    setStatus('3D · video fallback','fallback');
    window.__SATISH3D__={
      ready:false,
      fallback:true,
      error:String(error?.message||error),
      modelUrl
    };
  }
}

start();
})();
