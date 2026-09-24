/* Chromatic architecture: real apertures, layered courtyards and connected stairs. */
const ARCHITECTURE_VERSION='CHROMATIC COURTYARDS · 2026.09';
const PALETTES={
 11:{name:'珊瑚回廊',mass:'#e7aaa4',support:'#719da1',ivory:'#fff0d6',accent:'#ce655f',ink:'#324a59',leaf:'#639c84',skyTop:'#bbd7dd',sky:'#d9e5df',horizon:'#f0e3cb',water:'#82bcbc',shadow:'#9faccb',fill:'#c9e5ff'},
 2:{name:'青碧天井',mass:'#8ac4c8',support:'#579ba8',ivory:'#f8ead6',accent:'#e58b77',ink:'#305166',leaf:'#568d83',skyTop:'#b0cbd7',sky:'#cadfe1',horizon:'#e8e0d3',water:'#5397a7',shadow:'#8695bc',fill:'#cfdeff'},
 6:{name:'紫藤折城',mass:'#b3acd2',support:'#7a94b7',ivory:'#faebda',accent:'#df927e',ink:'#414462',leaf:'#719e94',skyTop:'#b8c6dd',sky:'#d9dbea',horizon:'#edd9d4',water:'#8bafc0',shadow:'#aaa0ce',fill:'#d6e6ff'},
 7:{name:'薄荷迷庭',mass:'#a6c6b4',support:'#6da59e',ivory:'#f7e9cb',accent:'#d39878',ink:'#35565a',leaf:'#4f8d7c',skyTop:'#c4d8c9',sky:'#e0e4d2',horizon:'#efe6cc',water:'#80b3a2',shadow:'#96acac',fill:'#d0e7e5'},
 9:{name:'日落长廊',mass:'#dfad8b',support:'#b58b9e',ivory:'#fff0d3',accent:'#bf6973',ink:'#52455d',leaf:'#859583',skyTop:'#c4bfdc',sky:'#e3ccdb',horizon:'#f4d8bb',water:'#b095b0',shadow:'#9998bb',fill:'#d2d4fb'},
 10:{name:'蓝调月庭',mass:'#9fa5d0',support:'#7485b2',ivory:'#f0e6d4',accent:'#e3af8f',ink:'#343d63',leaf:'#708ba5',skyTop:'#7185b2',sky:'#a9bad4',horizon:'#d1c4d5',water:'#758ead',shadow:'#7c83b0',fill:'#a9c5f5'}
};
let palette=PALETTES[11],reflectingWater=[];const plasterTextures=new Map(),skyMaps=new Map();
camera.far=650;camera.fov=62;camera.updateProjectionMatrix();
function finishMaterial(key,color,rough=.88,metal=0){const k='color/'+level+'/'+key;if(!artMaterials.has(k))artMaterials.set(k,new THREE.MeshStandardMaterial({color,roughness:Math.max(.58,rough),metalness:Math.min(.25,metal)}));return artMaterials.get(k)}
function texture(kind){if(plasterTextures.has(kind))return plasterTextures.get(kind);const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle='#f7f5ef';g.fillRect(0,0,256,256);let seed=917;for(let i=0;i<8000;i++){seed=seed*16807%2147483647;const x=seed%256;seed=seed*16807%2147483647;g.fillStyle=i%2?'#ffffff10':'#6b607007';g.fillRect(x,seed%256,1,1)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;plasterTextures.set(kind,t);return t}
function mat(color){const key=level+'/'+color;if(!mats.has(key)){const textured=typeof color==='string'&&color[0]==='@';const m=new THREE.MeshStandardMaterial({color:textured?(color==='@hedge'?palette.mass:palette.ivory):color,roughness:.9});if(textured){m.map=texture('plaster');m.bumpMap=m.map;m.bumpScale=.006}mats.set(key,m)}return mats.get(key)}
function box(w,h,d,x,y,z,color=P.white,parent=world,solid=false){
 const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,n=geo.attributes.normal;
 for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/2,uv.getY(i)*(ny>.5?d:h)/2)}
 const o=new THREE.Mesh(geo,mat(color));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(solid)addSolid(o);return o;
}
function makeSky(){
 const key=palette.name;if(!skyMaps.has(key)){const c=document.createElement('canvas');c.width=16;c.height=256;const g=c.getContext('2d'),grad=g.createLinearGradient(0,0,0,256);if(grad?.addColorStop){grad.addColorStop(0,palette.skyTop);grad.addColorStop(.5,palette.sky);grad.addColorStop(1,palette.horizon);g.fillStyle=grad}else g.fillStyle=palette.sky;g.fillRect(0,0,16,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;skyMaps.set(key,t)}
 const m=new THREE.Mesh(new THREE.SphereGeometry(460,32,20),new THREE.MeshBasicMaterial({map:skyMaps.get(key),side:THREE.BackSide,depthWrite:false,fog:false}));m.userData.scenery='cloud-sky';m.renderOrder=-100;world.add(m);
}
function setupLight(theme='day',cx=0){
 palette=PALETTES[level]||PALETTES[11];reflectingWater=[];Object.assign(P,{white:palette.ivory,blue:palette.support,dark:palette.ink,yellow:'#f1c75b',teal:'#5dc5b0',coral:palette.accent,pink:palette.mass});
 scene.background=new THREE.Color(palette.sky);scene.fog=new THREE.Fog(palette.sky,85,235);makeSky();
 world.add(new THREE.HemisphereLight('#fff7eb',palette.shadow,1.3));
 const sun=new THREE.DirectionalLight('#fff5df',2.65);sun.position.set(cx-24,31,19);sun.target.position.set(cx,0,-8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-40,right:40,top:44,bottom:-44,near:1,far:145});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00008;sun.shadow.normalBias=.023;sun.shadow.radius=3;world.add(sun,sun.target);
 const fill=new THREE.DirectionalLight(palette.fill,.38);fill.position.set(cx+20,12,-35);world.add(fill);renderer.toneMappingExposure=.95;
}
function water(w,d,x,z,y=-.7){
 const target=new THREE.WebGLRenderTarget(640,400,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
 const material=new THREE.ShaderMaterial({uniforms:{reflection:{value:target.texture},matrix:{value:new THREE.Matrix4()},time:{value:0},ready:{value:0},waterColor:{value:new THREE.Color(palette.water)}},vertexShader:`uniform mat4 matrix; varying vec4 vr; varying vec3 wp; void main(){ vec4 p=modelMatrix*vec4(position,1.); wp=p.xyz; vr=matrix*p; gl_Position=projectionMatrix*viewMatrix*p; }`,fragmentShader:`uniform sampler2D reflection; uniform vec3 waterColor; uniform float time; uniform float ready; varying vec4 vr; varying vec3 wp; void main(){ vec2 q=vr.xy/vr.w; q+=vec2(sin(wp.z*2.2+time*.4),cos(wp.x*1.8+time*.25))*.001; vec3 r=texture2D(reflection,clamp(q,vec2(.001),vec2(.999))).rgb; float f=.3+.7*pow(1.-abs(normalize(cameraPosition-wp).y),2.); vec3 col=mix(waterColor,r*.78+waterColor*.14,f*.62*ready); gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.userData={scenery:'water',reflection:target,reflectionCamera:new THREE.PerspectiveCamera(62,1,.07,650)};world.add(mesh);reflectingWater.push(mesh);
 const lines=new THREE.Group();for(let i=0;i<45;i++){const line=new THREE.Mesh(new THREE.PlaneGeometry(w*(.16+.65*(i%7)/7),.015+i%3*.006),new THREE.MeshBasicMaterial({color:palette.ivory,transparent:true,opacity:.055,depthWrite:false}));line.rotation.x=-Math.PI/2;line.position.set(x+Math.sin(i*2.4)*w*.25,y+.013,z-d/2+(i+.5)/45*d);lines.add(line)}lines.userData.scenery='water-lines';world.add(lines);
 return mesh;
}
function portalFrame(x,z,w=5,h=8,y=0,depth=.8,solid=false,parent=world){const g=new THREE.Group();parent.add(g);const t=.45;box(t,h,depth,x-w/2-t/2,y+h/2,z,palette.mass,g,solid);box(t,h,depth,x+w/2+t/2,y+h/2,z,palette.mass,g,solid);box(w+2*t,t,depth,x,y+h+t/2,z,palette.mass,g,solid);for(const a of [-1,1])box(.06,h,.055,x+a*w/2,y+h/2,z+depth/2+.015,palette.ivory,g);g.userData.scenery='freestanding-frame';return g}
// A rectangular wall with a real arched aperture, not a ring pasted onto a solid box.
function archPanel(w,h,d,r,spring,color=palette.mass,parent=world,x=0,y=0,z=0){
 const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.lineTo(-w/2,0);
 const hole=new THREE.Path();hole.moveTo(-r,0);hole.lineTo(-r,spring);hole.absarc(0,spring,r,Math.PI,0,true);hole.lineTo(r,0);hole.lineTo(-r,0);shape.holes.push(hole);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,curveSegments:24});geo.translate(x,y,z-d/2);const m=new THREE.Mesh(geo,mat(color));m.castShadow=true;m.receiveShadow=true;parent.add(m);m.userData.scenery='arch-aperture';return m;
}
function arch(x,z,y=0,radius=1.6,column=2.4,color=palette.mass,parent=world){
 const g=new THREE.Group();parent.add(g);archPanel(radius*2+.95,column+radius+.48,.7,radius,column,color,g,x,y,z);g.userData.scenery='cast-arch';return g;
}
function stairFlight(x,z,width=3,steps=22,rise=.24,tread=.46,y=0,yaw=0,solid=false,color=palette.ivory,parapet=true){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;world.add(g);for(let i=0;i<steps;i++){
 const o=box(width,(i+1)*rise,tread,0,(i+1)*rise/2,-(i+.5)*tread,color,g,solid);o.userData.scenery='stair-tread';
 if(parapet)for(const a of [-1,1])box(.18,.58,tread,a*(width/2+.09),(i+1)*rise+.29,-(i+.5)*tread,palette.mass,g,solid);
 }g.userData.scenery='switchback-stair';return g;
}
function terrace(w,d,x,z,y=0,color=palette.ivory){const o=floor(w,d,x,z,y,color);box(w,.10,.10,x,y-.11,z+d/2+.02,palette.support).castShadow=false;return o}
function tieWall(w,h,d,x,z,y=0,solid=false,color=palette.mass){return box(w,h,d,x,y+h/2,z,color,world,solid)}
// Merge decorative parts by material in local space; physical stairs and puzzle objects stay separate.
function batchScenery(g){const pos=g.position.clone(),rot=g.rotation.clone(),scale=g.scale.clone();g.position.set(0,0,0);g.rotation.set(0,0,0);g.scale.set(1,1,1);bakeModel(g);g.position.copy(pos);g.rotation.copy(rot);g.scale.copy(scale);return g}
function rail(w,x,y,z,parent=world,color=palette.ink){box(w,.035,.035,x,y+.8,z,color,parent);for(let t=-w/2;t<=w/2+.01;t+=.48)box(.025,.8,.025,x+t,y+.4,z,color,parent)}
function arcade(x,z,bays=3,stories=2,y=0,yaw=0,color=palette.mass){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;world.add(g);const pitch=3.5,height=4.5;
 for(let j=0;j<stories;j++){for(let i=0;i<bays;i++){const xx=(i-(bays-1)/2)*pitch;archPanel(pitch,height,.7,1.1,2.45,color,g,xx,j*height,0);box(.16,height,.82,xx-pitch/2+.08,j*height+height/2,0,palette.ivory,g);if(j)rail(2.2,xx,j*height,.49,g,palette.support)}box(bays*pitch+.36,.22,2.3,0,(j+1)*height,-.65,palette.ivory,g);box(bays*pitch+.4,.13,.12,0,(j+1)*height-.22,.43,palette.support,g)}
 g.userData.scenery='layered-arcade';return batchScenery(g);
}
function pavilion(x,z,w=5,d=4,h=6,y=0,color=palette.mass){
 const g=new THREE.Group();g.position.set(x,y,z);world.add(g);archPanel(w,h,.55,Math.min(1.25,w*.23),h*.45,color,g,0,0,d/2);box(.5,h,d,-w/2+.25,h/2,0,color,g);box(.5,h,d,w/2-.25,h/2,0,color,g);box(w+.4,.22,d+.3,0,h+.1,0,palette.ivory,g);box(w,.18,d,0,0,0,palette.support,g);g.userData.scenery='courtyard-volume';return batchScenery(g);
}
function switchback(x,z,base=0,color=palette.ivory){
 stairFlight(x,z,2.5,18,.25,.44,base,0,true,color);terrace(5.8,2.4,x+1.5,z-9.2,base+4.5);stairFlight(x+3,z-8.1,2.5,18,.25,.44,base+4.5,Math.PI,true,color);terrace(5.8,2.2,x+1.5,z+.8,base+9);return {top:base+9};
}
function palm(x,z,y=0,h=5){const g=new THREE.Group();g.position.set(x,y,z);world.add(g);cylinder(.07,.15,h,0,h/2,0,palette.support,g,10);for(let i=0;i<9;i++){const a=i*Math.PI*2/9;const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat(i%2?palette.leaf:palette.support));leaf.scale.set(.21,.09,1.65);leaf.position.set(Math.sin(a)*.95,h-.15+Math.sin(i)*.15,Math.cos(a)*.95);leaf.rotation.set(.32,a,0);leaf.castShadow=true;g.add(leaf)}cylinder(.8,.65,.55,0,.275,0,palette.ivory,g,24);return g}
function bridgeGallery(x,z,w,y,color=palette.mass){const count=Math.max(1,Math.round(w/3.6)),pitch=w/count;for(let i=0;i<count;i++)archPanel(pitch,3.8,1,pitch*.32,2.1,color,world,x+(i-(count-1)/2)*pitch,y,z);box(w+.3,.22,2.5,x,y+3.9,z,palette.ivory);rail(w,x,y+4,z+1.1);return y+4;}

function cypress(x,z,h=9,r=.7,y=0){const g=new THREE.Group();g.position.set(x,y,z);world.add(g);cylinder(.065,.13,h*.28,0,h*.14,0,palette.support,g,10);const points=[];for(let i=0;i<=40;i++){const t=i/40,rr=r*Math.pow(Math.sin(Math.PI*t),.47)*(1-t*.48);points.push(new THREE.Vector2(Math.max(.009,rr),h*(.14+t*.86)))}const geo=new THREE.LatheGeometry(points,20),p=geo.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i),zz=p.getZ(i),yy=p.getY(i),theta=Math.atan2(zz,xx),k=1+.055*Math.sin(theta*7+yy*13)+.035*Math.sin(theta*13-yy*8);p.setXYZ(i,xx*k,yy,zz*k*.83)}geo.computeVertexNormals();const foliage=new THREE.Mesh(geo,mat(palette.leaf));foliage.castShadow=true;foliage.receiveShadow=true;g.add(foliage);g.userData.scenery='cypress';return g}
function cypressCluster(cx,z,count=6,span=8,y=0){box(span+2.2,3,4.5,cx,y-1.5,z,'@concrete');for(let i=0;i<count;i++)cypress(cx+(i/(Math.max(1,count-1))-.5)*span,z+(i%3-1)*1.4,6.5+i%4*1.2,.38+i%3*.14,y)}
function topiaryField(cx,cz,count=60,spread=30){cypressCluster(cx,cz,Math.min(count,9),spread)}
function houseModel(){const g=new THREE.Group();box(1,1,1,0,0,0,'@concrete',g);box(1.14,.09,1.13,0,.535,0,'@concrete',g);box(.9,.17,.75,0,.66,-.05,palette.support,g);box(.34,.72,.035,0,-.14,.514,palette.ink,g);box(.23,.6,.045,0,-.2,.54,palette.accent,g);for(const x of [-.33,.33]){box(.18,.45,.035,x,.1,.518,palette.support,g);box(.016,.46,.055,x,.1,.54,palette.ivory,g)}for(const a of [-1,1])box(.026,.18,.63,a*.508,.24,0,palette.support,g);box(.53,.06,.3,0,-.485,.6,'@concrete',g);return bakeModel(g)}
function seat(x,z,y=0,rot=0){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;g.userData={type:'seat',view:new V(x,y+1.3,z),yaw:rot,scenery:'observation-chair'};world.add(g);
 const black=finishMaterial('seat-coral',palette.accent,.84,.05),steel=finishMaterial('seat-steel',palette.ink,.35,.2);
 sculpt(.82,.13,.77,0,.56,.08,black,g,.045);const back=sculpt(.82,.67,.105,0,.94,-.30,black,g,.04);back.rotation.x=-.08;
 for(const a of [-1,1]){pipe([[a*.38,.07,.36],[a*.38,.5,.36],[a*.38,.54,-.32],[a*.38,.07,-.35]],.021,steel,g);pipe([[a*.39,.51,.32],[a*.39,.77,.22],[a*.39,.77,-.27],[a*.39,.54,-.32]],.018,steel,g);for(const zz of [-.35,.36])cylinder(.027,.027,.05,a*.38,.04,zz,black,g,10)}
 pickups.push(g);return g;
}
function gate(x,z,y=0,id='exit',dir=-1){const g={x,z,y,id,dir,open:false,mesh:null};portalFrame(x,z,3.4,4.55,y,.62,true);g.mesh=box(3.4,4.2,.12,x,y+2.1,z,palette.ivory,world,true);g.mesh.material=new THREE.MeshBasicMaterial({color:palette.support,transparent:true,opacity:.035,depthWrite:false});sign('EXIT / '+chapterNumber(level),x,y+5.2,z+.35*-dir,3.3,.45,palette.ink,null,dir===1?Math.PI:0);g.status=ring(x,z+1.3*-dir,y,.4,palette.accent);gates.push(g);return g}
function hedge(w,h,d,x,z,y=0,solid=true){const wall=box(w,h,d,x,y+h/2,z,palette.mass,world,solid),detail=new THREE.Group();world.add(detail);box(w+.06,.12,d+.08,x,y+h,z,palette.ivory,detail);box(w,.17,.04,x,y+.22,z+d/2+.025,palette.support,detail);wall.userData.foliage=detail;return wall}
function cutPanel(x,z,width=3.2,height=4.5,kind='hedge'){const m=kind==='hedge'?hedge(width,height,.5,x,z):box(width,height,.2,x,height/2,z,'@concrete',world,true);m.userData.cutId='cut'+cutWalls.length;m.userData.cuttable=true;m.userData.panelKind=kind;cutWalls.push(m);const mark=new THREE.Mesh(new THREE.TorusGeometry(.45,.035,8,48,Math.PI*1.2),new THREE.MeshBasicMaterial({color:'#fafafa'}));mark.position.set(x,2.3,z+.33);world.add(mark);m.userData.mark=mark;const plate=box(1.25,1.45,.03,x,2.3,z+.285,palette.support);if(!m.userData.foliage){m.userData.foliage=new THREE.Group();world.add(m.userData.foliage)}m.userData.foliage.add(plate);return m}
function photoModelBase(type,ghostly=false,card=null){const g=new THREE.Group();if(type==='stairs'){for(let i=0;i<10;i++){box(3,(i+1)*.24,1,0,(i+1)*.12,-i-.5,'@concrete',g).userData.structSolid=true;box(3,.013,.035,0,(i+1)*.24+.009,-i-.025,palette.accent,g)}}else if(type==='bridge'){box(3,.22,12,0,-.11,-6,'@concrete',g).userData.structSolid=true;for(const x of [-1.47,1.47]){box(.055,.75,12,x,.375,-6,palette.support,g).userData.structSolid=true;for(let i=0;i<9;i++)box(.025,.012,.9,x, .77,-i*1.45,palette.ivory,g)}for(let i=1;i<4;i++)portalFrame(0,-i*3,3.12,3.2,0,.12,false,g);}else box(card?.size||1,card?.size||1,card?.size||1,0,(card?.size||1)/2,0,isLightKind(card?.kind)?'#ececec':P.yellow,g);
 if(ghostly)g.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({color:'#ededed',transparent:true,opacity:.38,depthWrite:false});o.castShadow=false}});return g;
}
function makeHouseWave(){const r=20,vertices=[],uv=[],indices=[];for(let i=0;i<=64;i++){const t=i/64*2.4;for(const z of [-28,20]){vertices.push(-9-r*Math.sin(t),r*(1-Math.cos(t))-.1,z);uv.push(t*7,z/2)}}for(let i=0;i<64;i++){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const skin=new THREE.Mesh(geo,mat('@concrete'));skin.material.side=THREE.DoubleSide;skin.receiveShadow=true;world.add(skin);const model=houseModel(),count=48,batches=model.children.map(m=>new THREE.InstancedMesh(m.geometry,m.material,count)),o=new THREE.Object3D();for(let i=0;i<count;i++){const row=i%6,col=Math.floor(i/6),t=.08+row*.38,scale=1.85;o.position.set(-9-r*Math.sin(t),r*(1-Math.cos(t)),-25+col*4.5);o.rotation.set(0,0,-t);o.scale.setScalar(scale);o.translateY(.5*scale);o.updateMatrix();for(const b of batches)b.setMatrixAt(i,o.matrix)}for(const b of batches){b.castShadow=true;b.receiveShadow=true;world.add(b)}for(let i=0;i<8;i++){const t=.09+i*.30;const slab=box(.12,.07,48,-9-r*Math.sin(t),r*(1-Math.cos(t))+.02,-4,'#585858');slab.rotation.z=-t}}
function buildPractice(){
 setupLight();water(190,190,0,-15,-1.2);terrace(24,28,0,6);terrace(16,10,0,-23);
 // A double staircase threads through two scales of arch; the central teaching floor remains legible.
 tieWall(.6,9,28,-12,6,0,true);tieWall(.6,5,18,12,7,0,true);arcade(-11.65,-.8,5,2,0,Math.PI/2);arcade(9.8,-4,2,2,0,-Math.PI/2,palette.support);
 switchback(-9.3,11);pavilion(-8,-6,5,4,6,9);bridgeGallery(-.7,-4,15,8.3);arch(0,-20.2,0,2.9,4.2,palette.accent);arcade(0,-27,4,2,0,0,palette.support);
 terrace(7,4,8,-3,4.5);stairFlight(8,9,2.8,18,.25,.55,0,0,true);pavilion(8,-5,5,4,5,4.5,palette.mass);
 seat(-6.8,10,0,.22);palm(8.7,13,0,5);cypressCluster(19,-20,4,7,-1.2);cypressCluster(-17,-23,3,5,-1.2);
 const original=cube(0,9,.6);pad(3,4,1.4,4.6,0,'大方块');ring(0,13,0,.8,P.teal);floorSign('01 / 从这里开始',0,13.8,0,3.2);ring(-3,4,0,1,P.teal);floorSign('照片的副本',-3,6,0,3.2);
 box(.05,1,.05,4.8,.5,4,P.dark);box(.5,.035,.05,4.8,1,4,P.white);sign('1 m',4.8,1.35,4,1,.4,'#3a3a3a');
 dock(0,-7.5,0,'DEVELOP');ring(0,-5.5,0,.65,P.teal);gate(0,-24);hasCamera=true;checkpoint.set(0,EYE,16);practice={stage:0,originalId:original.userData.id,lastStage:-1,seconds:0,bridgePickup:false};
}
function buildPool(){
 setupLight();water(220,230,0,-24,-.9);terrace(16,12,0,7);terrace(8,6,0,-10.75,2.4);terrace(14,8,0,-28.5,2.4);
 // Stacked opposing staircases form a visible central void. The missing links are supplied by the photographs.
 terrace(5,28,-10,-3);arcade(-13,-9,7,3,0,Math.PI/2,palette.mass);switchback(-11.1,9);
 arcade(11,-15,6,3,0,-Math.PI/2,palette.support);stairFlight(9.3,8,2.8,24,.25,.52,0,0,false,palette.ivory);stairFlight(12.3,-5,2.8,24,.25,.52,6,Math.PI,false,palette.mass);
 bridgeGallery(0,-16,24,10.5,palette.mass);pavilion(0,-32,8,4,9,2.4,palette.support);
 for(const x of [-18,18]){pavilion(x,-28,5,6,18,-1,palette.mass);arch(x,-30,18,1.65,3,palette.accent)}
 palm(-5.8,5,0,5);seat(6.1,11,0,-.6);cypressCluster(-23,-36,5,8,-1);cypressCluster(23,-36,5,8,-1);
 pickup('stairs',4,8,0,'水面上的楼梯');dock(0,2);dock(0,-13,2.4,'SECOND EXPOSURE');makeAlignment(new V(0,4.05,-10),new V(0,4.05,-25),()=>{addCard('bridge','从轮廓里借来的桥');showToast('轮廓成为了一张桥照片。切换到它，把第二段路接起来。',6)});gate(0,-30,2.4).open=true;
}
function buildHouseWave(){
 setupLight();water(210,210,15,-12,-1.25);terrace(18,32,0,0);makeHouseWave();
 arcade(0,-14,4,2,0,0,palette.support);pavilion(10,-6,5,7,9);stairFlight(10.5,11,3,22,.25,.52);palm(6.5,-8,0,5.6);cypressCluster(17,-19,4,7,-1.25);
 homeToken=cube(0,3,.65,'house');cube(4,7,.55,'lamp');floorSign('F / 放大之后，进入',0,9,0,4);seat(-6,6,0,.25);
 terrace(14,25,38,-2);tieWall(.55,10,25,31,-2,0,true);tieWall(.55,10,25,45,-2,0,true);arcade(31.4,-2,6,3,0,Math.PI/2,palette.mass);arcade(44.6,-2,6,3,0,-Math.PI/2,palette.support);
 stairFlight(33.1,5,2.3,18,.25,.55,0,0,true);terrace(4,4,33.5,-6,4.5);bridgeGallery(38,-8.5,11,7.5,palette.mass);arcade(38,-14.3,4,3,0,0,palette.mass);palm(43,3,0,6.5);
 const door=box(2.2,3.3,.18,38,1.65,8,'#444444');door.userData={type:'return'};pickups.push(door);portalFrame(38,8,2.3,3.5,0,.38);sign('E / 回到屋外',38,4.1,7.8,2.7,.42,'#353535',null,Math.PI);sensor(41,-6,1.4);gate(38,-12);flags.enteredHome=false;
}
function buildHedgeMemory(){
 setupLight();water(170,170,0,-15,-1.2);terrace(16,43,0,-5.5);hedge(.9,8.5,43,-8,-5.5);hedge(.9,8.5,43,8,-5.5);hedge(16,8.5,.9,0,16);barrier(1);barrier(-11);for(const x of [-2,2]){hedge(.7,5.5,8,x,7);hedge(.7,5.5,6,x,-7)}
 // The repeated upper courtyards advertise the loop; alternating balconies point across the lower route.
 arcade(-7.55,-4,7,2,6,Math.PI/2,palette.support);arcade(7.55,-4,7,2,6,-Math.PI/2,palette.mass);
 for(const z of [1,-11]){bridgeGallery(0,z,16,7.8,palette.ivory);for(const x of [-4,0,4])arch(x,z+.15,0,1.62,2.55,palette.ivory)}
 stairFlight(-12,11,3,24,.3,.6);stairFlight(12,-13,3,24,.3,.6,7.2,Math.PI);palm(-5.8,11,0,7);palm(5.8,-7,0,7);palm(-5.8,-19,0,7);arcade(0,-25.5,4,2,0,0,palette.support);
 deer=deerModel();deer.position.set(-4,0,6);deer.userData.path=[];addCard('cutout','鹿走过的留白');cube(.8,9,.95);pad(0,7,.24,.7,0,'地址锚点',true);gate(0,-24);flags.mazeStage=0;flags.mazeLoops=0;flags.deerStage=0;
}
function buildShadowField(){
 setupLight();water(220,200,0,-22,-1.4);terrace(24,14,0,8);terrace(18,15,0,-16.5);
 // Long ivory arcades and diagonal roof stairs frame the deliberately empty shadow stage.
 arcade(-13.5,-4,9,2,0,Math.PI/2,palette.mass);arcade(13.5,-4,9,2,0,-Math.PI/2,palette.support);
 stairFlight(-16,13,3.3,30,.27,.55);stairFlight(16,-20,3.3,30,.27,.55,8.1,Math.PI);bridgeGallery(0,-26,24,8.7,palette.mass);
 pavilion(-7,-27,6,5,12,0,palette.support);pavilion(7,-27,6,5,9,0,palette.mass);palm(-9,13,0,5.5);palm(9,-20,0,6);cypressCluster(-23,-28,4,7,-1.4);
 for(const x of [-8,8])for(const z of [12,4,-12,-20])lampPost(x,z,3.2,1);shadowLamp=new V(0,4,8.5);lampPost(0,8.5,4,1.5);const light=new THREE.PointLight('#ffdb94',16,30,1.8);light.position.copy(shadowLamp);world.add(light);
 shadowCaster=cube(2,5,.8,'effigy');ring(0,2.5,0,1.2,'#fafafa');dock(0,2,0,'影子显影');shadowMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#101010',transparent:true,opacity:.96,side:THREE.DoubleSide}));shadowMesh.rotation.x=-Math.PI/2;shadowMesh.position.y=.035;world.add(shadowMesh);gate(0,-21).open=true;flags.shadowAligned=false;seat(-8.5,9,0,.35);
}
function makeRoad(){
 for(let i=0;i<76;i++){const t=(i+.5)/76,x=42+3.3*Math.sin(t*Math.PI*2),z=6-t*29,y=t*2.4;const road=box(3.5,.42,.65,x,y-.21,z,'@concrete',world,true);road.rotation.y=Math.atan2(-3.3*Math.PI*2*Math.cos(t*Math.PI*2),29);refresh(road);for(const a of [-1,1]){const line=box(.055,.015,.65,a*1.65,.22,0,'#fafafa',road);line.castShadow=false;}if(i%4===0)for(const a of [-1,1])box(.07,.65,.07,x+a*1.9,y+.32,z,'#a0a0a0')}
 terrace(11,10,42,-27,2.4);
}
function palace(){
 // Three galleries at different heights interlock around the framed moon, with a side stair ascending across them.
 arcade(25,-34,3,3,2.4,0,palette.support);arcade(33,-38,3,4,2.4,0,palette.mass);arcade(53,-36,3,3,2.4,0,palette.mass);
 stairFlight(31,-20,3.3,28,.3,.58,2.4,0,false,palette.ivory);stairFlight(53,-35,3.2,22,.3,.55,11.4,Math.PI/2,false,palette.mass);
 arch(42,-34.2,2.4,3.4,7.2,palette.ivory);bridgeGallery(42,-37,26,17,palette.support);palm(50,-29,2.4,7);cypressCluster(56,-33,4,6);cypressCluster(27,-30,3,5);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(.73,40,32),new THREE.MeshStandardMaterial({color:'#fff0c9',emissive:'#ffe3b0',emissiveIntensity:.45,roughness:1}));moon.position.set(42,8,-36.8);world.add(moon);
}
function buildMoonRoad(){
 setupLight('day',42);water(250,230,20,-22,-1.4);terrace(15,21,0,3);
 arcade(-9,-1,4,3,0,Math.PI/2,palette.mass);arcade(9,-1,4,3,0,-Math.PI/2,palette.support);stairFlight(-10.8,9,3.2,24,.28,.55);arch(0,-6.8,0,3.3,4.9,palette.mass);bridgeGallery(0,-7,18,12,palette.support);palm(5.5,6,0,5.5);
 makeRoad();palace();teleportPair({x:0,z:-7},{x:42,z:6});const poster=cutPanel(0,-6.8,6,7,'screen');
 const pc=new THREE.PerspectiveCamera(55,6/7,.1,650);pc.position.set(42,7,15);pc.lookAt(42,.7,-12);renderer.render(scene,pc);const img=new Image(),tx=new THREE.Texture(img);tx.colorSpace=THREE.SRGBColorSpace;img.onload=()=>tx.needsUpdate=true;img.src=renderer.domElement.toDataURL('image/jpeg',.8);if(img.complete)tx.needsUpdate=true;poster.material=new THREE.MeshBasicMaterial({map:tx});
 addCard('cutout','给风景剪一个入口');sign('06 / WALK INTO THE FRAME',0,8.1,-6.7,7,.6,'#333333');seat(42,-23,2.4,0);seat(38,-28,2.4,.5);actorPad(38,-25,'留下一段回声','echo',2.4);sensor(46,-25,3.8);box(.8,1.2,.5,46,3,-25,P.dark);ring(46,-25,2.4,.8,P.teal);
 makeAlignment(new V(42,3.7,-23),new V(42,8,-36.8),()=>{renderer.render(scene,camera);addCard('copy','一小片月亮',{kind:'moon',size:.55,img:renderer.domElement.toDataURL('image/jpeg',.8)});flags.moonRemembered=true;showToast('月光被记进照片。留一段回声，再把月光显影在右侧接收器附近。',7)},2.4);gate(42,-29,2.4);flags.moonRemembered=false;flags.moonExit=false;choirCharge=0;
}
function enhanceScene(){
 world.userData.edition=ARCHITECTURE_VERSION;world.userData.chapter=chapterNumber(level);world.userData.palette=palette.name;
 for(const c of cubes){if(c.userData.kind==='cube'){c.material=mat('#f3c960');c.geometry=roundedGeometry(1,1,1,.035)}if(c.userData.light)c.userData.light.color.set(c.userData.kind==='moon'?'#c5d4ff':'#ffe3a8')}
}
function updateArchitecture(now){
 for(const g of gates)if(g.status){g.status.material.color.set(g.open?'#67dabd':'#d6a66c');g.status.scale.setScalar(g.open?1.06:1)}
 if(ghost)ghost.traverse(o=>{if(o.isMesh&&o.material.color){o.material.color.set(ghostValid?'#84e0ce':'#e4a4a1');o.material.opacity=ghostValid?.43:.16}});
 if(photoMode){$('prompt').textContent=ghostValid?'✓ 可显影　F / 左键':'× 位置未就绪　调整落点或朝向';$('prompt').hidden=false;}
 renderWater(now);
}

function renderWater(now){
 if(!reflectingWater.length)return;const w=reflectingWater[0],u=w.material.uniforms;u.time.value=now/1000;
 if(frame%(highQuality?5:18)!==0&&u.ready.value)return;
 const c=w.userData.reflectionCamera,h=w.position.y,f=camera.getWorldDirection(new V()),t=camera.position.clone().add(f);
 c.copy(camera);c.position.copy(camera.position);c.position.y=2*h-c.position.y;t.y=2*h-t.y;c.up.set(0,-1,0);c.lookAt(t);c.updateMatrixWorld(true);
 u.matrix.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
 const visibility=reflectingWater.map(m=>m.visible),portalsVisible=portals.map(p=>p.mesh.visible);for(const m of reflectingWater)m.visible=false;for(const p of portals)p.mesh.visible=false;
 renderer.setRenderTarget(w.userData.reflection);renderer.render(scene,c);renderer.setRenderTarget(null);reflectingWater.forEach((m,i)=>m.visible=visibility[i]);portals.forEach((p,i)=>p.mesh.visible=portalsVisible[i]);u.ready.value=1;
}
