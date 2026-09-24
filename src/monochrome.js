/* Concrete / Water edition. Scenery is real geometry; all assets are generated offline. */
Object.assign(P,{white:'#d7d7d7',blue:'#737373',dark:'#242424',yellow:'#ededed',teal:'#f5f5f5',coral:'#8a8a8a',pink:'#bcbcbc'});
const MONO_VERSION='CONCRETE / WATER · 2026.09';
const monoTextureCache=new Map();
let monoSkyMap=null,monoWater=[],monoSceneSeed=0;
camera.far=650;camera.fov=62;camera.updateProjectionMatrix();
function neutral(color){const c=new THREE.Color(color);const y=.2126*c.r+.7152*c.g+.0722*c.b;return new THREE.Color().setRGB(y,y,y)}
function finishMaterial(key,color,rough=.86,metal=0){const k='mono/'+key;if(!artMaterials.has(k))artMaterials.set(k,new THREE.MeshStandardMaterial({color:neutral(color),roughness:Math.max(.55,rough),metalness:Math.min(.25,metal)}));return artMaterials.get(k)}
function texture(kind){
 if(monoTextureCache.has(kind))return monoTextureCache.get(kind);
 const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');
 const stone=!['hedge','grass','wood','roof'].includes(kind),base=kind==='hedge'?88:kind==='grass'?138:kind==='wood'?83:kind==='roof'?169:203;
 g.fillStyle=`rgb(${base},${base},${base})`;g.fillRect(0,0,512,512);
 let seed=917;const rnd=()=>{seed=seed*16807%2147483647;return seed/2147483647};
 for(let i=0;i<24000;i++){const x=rnd()*512,y=rnd()*512,s=rnd()<.025?3:1;g.fillStyle=i%3?'#ffffff12':'#00000027';g.fillRect(x,y,s,s*(.5+rnd()));}
 for(let i=0;i<70;i++){const x=rnd()*512,y=rnd()*512,r=1+rnd()*2;g.fillStyle='#17171746';g.beginPath();g.ellipse(x,y,r,r*.62,0,0,Math.PI*2);g.fill();g.fillStyle='#ffffff40';g.fillRect(x-r,y+r*.7,r*2,.7)}
 if(stone){g.lineWidth=.65;g.strokeStyle='#35353526';for(let y=0;y<512;y+=128){g.beginPath();g.moveTo(0,y+.5);g.lineTo(512,y+.5);g.stroke();g.strokeStyle='#ffffff19';g.beginPath();g.moveTo(0,y+1.5);g.lineTo(512,y+1.5);g.stroke();g.strokeStyle='#35353526'}for(const x of [48,464])for(const y of [42,298]){g.fillStyle='#38383866';g.beginPath();g.arc(x,y,2.4,0,Math.PI*2);g.fill();g.strokeStyle='#ffffff44';g.stroke();}}
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;monoTextureCache.set(kind,t);return t;
}
function mat(color){
 if(!mats.has(color)){const textured=color[0]==='@';const m=new THREE.MeshStandardMaterial({color:textured?'#ffffff':neutral(color),roughness:.94,metalness:0});
 if(textured){m.map=texture(color.slice(1));m.bumpMap=m.map;m.bumpScale=color==='@hedge'?.023:.045;}
 else if(neutral(color).r>.12){m.map=texture('concrete');m.bumpMap=m.map;m.bumpScale=.025;}
 mats.set(color,m)}return mats.get(color);
}
function box(w,h,d,x,y,z,color=P.white,parent=world,solid=false){
 const geo=new THREE.BoxGeometry(w,h,d),uv=geo.attributes.uv,n=geo.attributes.normal;
 for(let i=0;i<uv.count;i++){const nx=Math.abs(n.getX(i)),ny=Math.abs(n.getY(i));uv.setXY(i,uv.getX(i)*(nx>.5?d:w)/2,uv.getY(i)*(ny>.5?d:h)/2)}
 const o=new THREE.Mesh(geo,mat(color));o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);if(solid)addSolid(o);return o;
}
function hashCloud(x,y){let v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)}
function cloudNoise(x,y){const ix=Math.floor(x),iy=Math.floor(y);let fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hashCloud(ix,iy),hashCloud(ix+1,iy),fx),THREE.MathUtils.lerp(hashCloud(ix,iy+1),hashCloud(ix+1,iy+1),fx),fy)}
function makeSky(){
 if(!monoSkyMap){const c=document.createElement('canvas');c.width=1024;c.height=512;const g=c.getContext('2d'),im=g.createImageData(1024,512);if(im?.data){
 for(let y=0;y<512;y++)for(let x=0;x<1024;x++){let f=0,amp=.55,freq=1;const u=x/65,v=y/60;for(let k=0;k<6;k++){f+=amp*cloudNoise(u*freq+7,v*freq+13);amp*=.5;freq*=2.03}const cloud=clamp((f-.36)*3.6,0,1),rim=clamp((f-.5)*10,0,1),haze=clamp((y/512-.47)*1.8,0,1);const light=clamp(95+cloud*112+rim*32+(Math.sin(x/1024*Math.PI*2)*9),0,250),shade=THREE.MathUtils.lerp(light,170,haze),i=(y*1024+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=shade;im.data[i+3]=255}g.putImageData(im,0,0)}else{g.fillStyle='#b2b2b2';g.fillRect(0,0,1024,512)}monoSkyMap=new THREE.CanvasTexture(c);monoSkyMap.colorSpace=THREE.SRGBColorSpace;monoSkyMap.wrapS=THREE.RepeatWrapping;}
 const m=new THREE.Mesh(new THREE.SphereGeometry(460,48,24),new THREE.MeshBasicMaterial({map:monoSkyMap,side:THREE.BackSide,depthWrite:false,fog:false}));m.userData.scenery='cloud-sky';m.renderOrder=-100;world.add(m);
}
function setupLight(theme='day',cx=0){
 monoWater=[];monoSceneSeed=level;scene.background=new THREE.Color('#aaaaaa');scene.fog=new THREE.Fog('#aaaaaa',70,220);makeSky();
 world.add(new THREE.HemisphereLight('#ffffff','#4d4d4d',.95));
 const sun=new THREE.DirectionalLight('#ffffff',4.1);sun.position.set(cx-28,34,23);sun.target.position.set(cx,0,-8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-38,right:38,top:42,bottom:-42,near:1,far:140});sun.shadow.camera.updateProjectionMatrix();sun.shadow.bias=-.00008;sun.shadow.normalBias=.025;sun.shadow.radius=2;world.add(sun,sun.target);
 const fill=new THREE.DirectionalLight('#eeeeee',.23);fill.position.set(cx+20,12,-35);world.add(fill);renderer.toneMappingExposure=.98;
}
function water(w,d,x,z,y=-.7){
 const target=new THREE.WebGLRenderTarget(640,400,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
 const material=new THREE.ShaderMaterial({uniforms:{reflection:{value:target.texture},matrix:{value:new THREE.Matrix4()},time:{value:0},ready:{value:0}},vertexShader:`uniform mat4 matrix; varying vec4 vr; varying vec3 wp; void main(){ vec4 p=modelMatrix*vec4(position,1.); wp=p.xyz; vr=matrix*p; gl_Position=projectionMatrix*viewMatrix*p; }`,fragmentShader:`uniform sampler2D reflection; uniform float time; uniform float ready; varying vec4 vr; varying vec3 wp; void main(){ vec2 q=vr.xy/vr.w; q+=vec2(sin(wp.z*2.2+time*.4),cos(wp.x*1.8+time*.25))*.001; vec3 r=texture2D(reflection,clamp(q,vec2(.001),vec2(.999))).rgb; float f=.3+.7*pow(1.-abs(normalize(cameraPosition-wp).y),2.); vec3 col=mix(vec3(.045),r*.62+.018,f*ready); gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),material);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);mesh.userData={scenery:'water',reflection:target,reflectionCamera:new THREE.PerspectiveCamera(62,1,.07,650)};world.add(mesh);monoWater.push(mesh);
 const lines=new THREE.Group();for(let i=0;i<45;i++){const line=new THREE.Mesh(new THREE.PlaneGeometry(w*(.16+.65*(i%7)/7),.015+i%3*.006),new THREE.MeshBasicMaterial({color:i%3?'#646464':'#a1a1a1',transparent:true,opacity:.15,depthWrite:false}));line.rotation.x=-Math.PI/2;line.position.set(x+Math.sin(i*2.4)*w*.25,y+.013,z-d/2+(i+.5)/45*d);lines.add(line)}lines.userData.scenery='water-lines';world.add(lines);
 return mesh;
}
function portalFrame(x,z,w=5,h=8,y=0,depth=.8,solid=false,parent=world){const g=new THREE.Group();parent.add(g);const t=.48;box(t,h,depth,x-w/2-t/2,y+h/2,z,'@concrete',g,solid);box(t,h,depth,x+w/2+t/2,y+h/2,z,'@concrete',g,solid);box(w+2*t,t,depth,x,y+h+t/2,z,'@concrete',g,solid);g.userData.scenery='freestanding-frame';return g}
function arch(x,z,y=0,radius=1.6,column=2.4,color=P.white,parent=world){
 const t=.52,outer=radius+t,shape=new THREE.Shape();shape.moveTo(-outer,0);shape.lineTo(outer,0);shape.lineTo(outer,column);shape.absarc(0,column,outer,0,Math.PI,false);shape.lineTo(-outer,0);
 const hole=new THREE.Path();hole.moveTo(-radius,0);hole.lineTo(-radius,column);hole.absarc(0,column,radius,Math.PI,0,true);hole.lineTo(radius,0);hole.lineTo(-radius,0);shape.holes.push(hole);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.58,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.017,bevelThickness:.017,curveSegments:32});geo.translate(x,y,z-.29);const g=new THREE.Group(),m=new THREE.Mesh(geo,mat('@concrete'));m.castShadow=true;m.receiveShadow=true;g.add(m);parent.add(g);g.userData.scenery='cast-arch';return g;
}
function stairFlight(x,z,width=3,steps=22,rise=.28,tread=.46,y=0,yaw=0,solid=false){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;world.add(g);for(let i=0;i<steps;i++){const s=box(width,(i+1)*rise,tread,0,(i+1)*rise/2,-(i+.5)*tread,'@concrete',g,solid);s.userData.scenery='stair-tread'}
 g.userData.scenery='cantilever-stair';return g;
}
function terrace(w,d,x,z,y=0){const o=floor(w,d,x,z,y,'@concrete');const seam=box(w,.018,.028,x,y+.014,z+d/2-.07,'#393939');seam.castShadow=false;return o}
function tieWall(w,h,d,x,z,y=0,solid=false){return box(w,h,d,x,y+h/2,z,'@concrete',world,solid)}
function cypress(x,z,h=9,r=.7,y=0){const g=new THREE.Group();g.position.set(x,y,z);world.add(g);cylinder(.065,.13,h*.28,0,h*.14,0,'#252525',g,10);const points=[];for(let i=0;i<=40;i++){const t=i/40,rr=r*Math.pow(Math.sin(Math.PI*t),.47)*(1-t*.48);points.push(new THREE.Vector2(Math.max(.009,rr),h*(.14+t*.86)))}const geo=new THREE.LatheGeometry(points,20),p=geo.attributes.position;for(let i=0;i<p.count;i++){const xx=p.getX(i),zz=p.getZ(i),yy=p.getY(i),theta=Math.atan2(zz,xx),k=1+.055*Math.sin(theta*7+yy*13)+.035*Math.sin(theta*13-yy*8);p.setXYZ(i,xx*k,yy,zz*k*.83)}geo.computeVertexNormals();const foliage=new THREE.Mesh(geo,mat('#303030'));foliage.castShadow=true;foliage.receiveShadow=true;g.add(foliage);g.userData.scenery='cypress';return g}
function cypressCluster(cx,z,count=6,span=8,y=0){box(span+2.2,3,4.5,cx,y-1.5,z,'@concrete');for(let i=0;i<count;i++)cypress(cx+(i/(Math.max(1,count-1))-.5)*span,z+(i%3-1)*1.4,6.5+i%4*1.2,.38+i%3*.14,y)}
function topiaryField(cx,cz,count=60,spread=30){cypressCluster(cx,cz,Math.min(count,9),spread)}
function houseModel(){const g=new THREE.Group();box(1,1,1,0,0,0,'@concrete',g);box(1.14,.09,1.13,0,.535,0,'@concrete',g);box(.9,.17,.75,0,.66,-.05,'@concrete',g);box(.34,.72,.035,0,-.14,.514,'#202020',g);box(.23,.6,.045,0,-.2,.54,'#4b4b4b',g);for(const x of [-.33,.33]){box(.18,.45,.035,x,.1,.518,'#2b2b2b',g);box(.016,.46,.055,x,.1,.54,'#bbbbbb',g)}for(const a of [-1,1])box(.026,.18,.63,a*.508,.24,0,'#242424',g);box(.53,.06,.3,0,-.485,.6,'@concrete',g);return bakeModel(g)}
function seat(x,z,y=0,rot=0){
 const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;g.userData={type:'seat',view:new V(x,y+1.3,z),yaw:rot,scenery:'observation-chair'};world.add(g);
 const black=finishMaterial('seat-black','#292929',.84,.05),steel=finishMaterial('seat-steel','#777777',.35,.2);
 sculpt(.82,.13,.77,0,.56,.08,black,g,.045);const back=sculpt(.82,.67,.105,0,.94,-.30,black,g,.04);back.rotation.x=-.08;
 for(const a of [-1,1]){pipe([[a*.38,.07,.36],[a*.38,.5,.36],[a*.38,.54,-.32],[a*.38,.07,-.35]],.021,steel,g);pipe([[a*.39,.51,.32],[a*.39,.77,.22],[a*.39,.77,-.27],[a*.39,.54,-.32]],.018,steel,g);for(const zz of [-.35,.36])cylinder(.027,.027,.05,a*.38,.04,zz,black,g,10)}
 pickups.push(g);return g;
}
function gate(x,z,y=0,id='exit',dir=-1){const g={x,z,y,id,dir,open:false,mesh:null};portalFrame(x,z,3.4,4.55,y,.62,true);g.mesh=box(3.4,4.2,.12,x,y+2.1,z,'#eeeeee',world,true);g.mesh.material=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.035,depthWrite:false});sign('EXIT / '+chapterNumber(level),x,y+5.2,z+.35*-dir,3.3,.45,'#343434',null,dir===1?Math.PI:0);g.status=ring(x,z+1.3*-dir,y,.4,'#999999');gates.push(g);return g}
function hedge(w,h,d,x,z,y=0,solid=true){const wall=box(w,h,d,x,y+h/2,z,'@concrete',world,solid),detail=new THREE.Group();world.add(detail);for(let xx=-w/2+.2;xx<w/2;xx+=2.4){const groove=box(.017,h,.008,x+xx,y+h/2,z+d/2+.006,'#787878',detail);groove.castShadow=false}wall.userData.foliage=detail;return wall}
function cutPanel(x,z,width=3.2,height=4.5,kind='hedge'){const m=kind==='hedge'?hedge(width,height,.5,x,z):box(width,height,.2,x,height/2,z,'@concrete',world,true);m.userData.cutId='cut'+cutWalls.length;m.userData.cuttable=true;m.userData.panelKind=kind;cutWalls.push(m);const mark=new THREE.Mesh(new THREE.TorusGeometry(.45,.035,8,48,Math.PI*1.2),new THREE.MeshBasicMaterial({color:'#fafafa'}));mark.position.set(x,2.3,z+.33);world.add(mark);m.userData.mark=mark;const plate=box(1.25,1.45,.03,x,2.3,z+.285,'#292929');if(!m.userData.foliage){m.userData.foliage=new THREE.Group();world.add(m.userData.foliage)}m.userData.foliage.add(plate);return m}
function photoModelBase(type,ghostly=false,card=null){const g=new THREE.Group();if(type==='stairs'){for(let i=0;i<10;i++){box(3,(i+1)*.24,1,0,(i+1)*.12,-i-.5,'@concrete',g).userData.structSolid=true;box(3,.013,.035,0,(i+1)*.24+.009,-i-.025,'#484848',g)}}else if(type==='bridge'){box(3,.22,12,0,-.11,-6,'@concrete',g).userData.structSolid=true;for(const x of [-1.47,1.47]){box(.055,.75,12,x,.375,-6,'#4e4e4e',g).userData.structSolid=true;for(let i=0;i<9;i++)box(.025,.012,.9,x, .77,-i*1.45,'#bcbcbc',g)}for(let i=1;i<4;i++)portalFrame(0,-i*3,3.12,3.2,0,.12,false,g);}else box(card?.size||1,card?.size||1,card?.size||1,0,(card?.size||1)/2,0,isLightKind(card?.kind)?'#ececec':P.yellow,g);
 if(ghostly)g.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({color:'#ededed',transparent:true,opacity:.38,depthWrite:false});o.castShadow=false}});return g;
}
function makeHouseWave(){const r=20,vertices=[],uv=[],indices=[];for(let i=0;i<=64;i++){const t=i/64*1.98;for(const z of [-28,20]){vertices.push(-9-r*Math.sin(t),r*(1-Math.cos(t))-.1,z);uv.push(t*7,z/2)}}for(let i=0;i<64;i++){let a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();const skin=new THREE.Mesh(geo,mat('@concrete'));skin.material.side=THREE.DoubleSide;skin.receiveShadow=true;world.add(skin);const model=houseModel(),count=40,batches=model.children.map(m=>new THREE.InstancedMesh(m.geometry,m.material,count)),o=new THREE.Object3D();for(let i=0;i<count;i++){const row=i%4,col=Math.floor(i/4),t=.08+row*.44,scale=1.85;o.position.set(-9-r*Math.sin(t),r*(1-Math.cos(t)),-25+col*4.5);o.rotation.set(0,0,-t);o.scale.setScalar(scale);o.translateY(.5*scale);o.updateMatrix();for(const b of batches)b.setMatrixAt(i,o.matrix)}for(const b of batches){b.castShadow=true;b.receiveShadow=true;world.add(b)}for(let i=0;i<6;i++){const t=.09+i*.32;const slab=box(.12,.07,48,-9-r*Math.sin(t),r*(1-Math.cos(t))+.02,-4,'#585858');slab.rotation.z=-t}}
function buildPractice(){
 setupLight();water(190,190,0,-15,-1.2);terrace(24,28,0,6);terrace(16,10,0,-23);
 tieWall(.65,13,28,-12,6,0,true);tieWall(.65,9,28,12,6,0,true);tieWall(24,7,.7,0,20,0,true);
 stairFlight(-8.9,11,3.7,24,.29,.52,0,0,true);terrace(4.1,4,-8.9,-3,6.96);stairFlight(-8.9,-3,3.7,18,.3,.5,6.96,Math.PI);
 box(19,.55,4,-2,11.8,-3,'@concrete');portalFrame(7,-2,4.4,9.6,0,1.1,true);arch(-7,-24,0,2.2,5.1);portalFrame(0,-20.5,4.5,7.4,0,.65);
 seat(-6.8,10,0,.22);cypressCluster(19,-20,5,9,-1.2);cypressCluster(-17,-23,4,6,-1.2);
 const original=cube(0,9,.6);pad(3,4,1.4,4.6,0,'大方块');ring(0,13,0,.8,P.teal);floorSign('01 / 从这里开始',0,13.8,0,3.2);ring(-3,4,0,1,P.teal);floorSign('照片的副本',-3,6,0,3.2);
 box(.05,1,.05,4.8,.5,4,P.dark);box(.5,.035,.05,4.8,1,4,P.white);sign('1 m',4.8,1.35,4,1,.4,'#3a3a3a');
 dock(0,-7.5,0,'DEVELOP');ring(0,-5.5,0,.65,P.teal);gate(0,-24);hasCamera=true;checkpoint.set(0,EYE,16);practice={stage:0,originalId:original.userData.id,lastStage:-1,seconds:0,bridgePickup:false};
}
function buildPool(){
 setupLight();water(220,230,0,-24,-.9);terrace(16,12,0,7);terrace(8,6,0,-10.75,2.4);terrace(14,8,0,-28.5,2.4);
 tieWall(3.4,23,6,-11,-6,-1);tieWall(.75,18,25,-13,-8,-1);stairFlight(-9.3,9,3.5,30,.3,.55,0,0,true);terrace(4,4,-9.3,-8,9);stairFlight(-8,-9.8,3,19,.3,.52,9,-Math.PI/2);
 box(12,.5,4,-10,15,-7,'@concrete');portalFrame(5.8,-3.8,4.8,9,0,.85);box(7,.8,5,5.8,-.42,-3.8,'@concrete');
 arch(12,-20,0,4.1,10);arch(-16,-36,0,3.3,7);portalFrame(0,-31.7,4.8,8.5,2.4,.85);stairFlight(13,-27,3,23,.32,.58,0,Math.PI/2);
 cypressCluster(-24,-31,7,10,-1);cypressCluster(21,-31,8,12,-1);seat(-5.8,7,0,.15);seat(6.1,11,0,-.6);
 pickup('stairs',4,8,0,'水面上的楼梯');dock(0,2);dock(0,-13,2.4,'SECOND EXPOSURE');makeAlignment(new V(0,4.05,-10),new V(0,4.05,-25),()=>{addCard('bridge','从轮廓里借来的桥');showToast('轮廓成为了一张桥照片。切换到它，把第二段路接起来。',6)});gate(0,-30,2.4).open=true;
}
function buildHouseWave(){
 setupLight();water(210,210,15,-12,-1.25);terrace(18,32,0,0);makeHouseWave();cypressCluster(16,-20,7,10,-1.25);portalFrame(0,-12,5.2,10,0,.95);arch(11,-7,0,3,7);stairFlight(12,12,3.3,24,.32,.55,0,0);
 homeToken=cube(0,3,.65,'house');cube(4,7,.55,'lamp');floorSign('F / 放大之后，进入',0,9,0,4);seat(-6,6,0,.25);
 terrace(14,25,38,-2);for(const x of [31,45]){tieWall(.85,9.5,25,x,-2,0,true);for(let z=7;z>-13;z-=6)arch(x,z,0,2.2,5.2)}
 stairFlight(33.3,3,2.4,20,.28,.55,0,0,true);box(11,.42,3.5,38,5.55,-9,'@concrete');portalFrame(38,-12.3,5.2,8.4);cypress(43.1,4,8,.47);cypress(32.8,-11,8.5,.46);
 const door=box(2.2,3.3,.18,38,1.65,8,'#444444');door.userData={type:'return'};pickups.push(door);portalFrame(38,8,2.3,3.5,0,.38);sign('E / 回到屋外',38,4.1,7.8,2.7,.42,'#353535',null,Math.PI);sensor(41,-6,1.4);gate(38,-12);flags.enteredHome=false;
}
function buildHedgeMemory(){
 setupLight();scene.fog=new THREE.Fog('#acacac',38,155);water(170,170,0,-15,-1.2);terrace(16,43,0,-5.5);hedge(.9,11,43,-8,-5.5);hedge(.9,11,43,8,-5.5);hedge(16,11,.9,0,16);barrier(1);barrier(-11);for(const x of [-2,2]){hedge(.7,6,8,x,7);hedge(.7,6,6,x,-7)}
 for(const x of [-5.8,5.8]){cypress(x,10.6,9.5,.48);cypress(x,-7,10.2,.52);cypress(x,-18,8.6,.5)}
 for(const z of [8,-5,-18])box(16,.3,.8,0,9.8,z,'@concrete');arch(0,-24.4,0,2.4,4.8);stairFlight(-14,8,3.6,32,.4,.7,0,0);portalFrame(14,-13,5,13);cypressCluster(16,-24,6,7,-1);
 deer=deerModel();deer.position.set(-4,0,6);deer.userData.path=[];addCard('cutout','鹿走过的留白');cube(.8,9,.95);pad(0,7,.24,.7,0,'地址锚点',true);gate(0,-24);flags.mazeStage=0;flags.mazeLoops=0;flags.deerStage=0;
}
function buildShadowField(){
 setupLight();scene.background.set('#8d8d8d');scene.fog=new THREE.Fog('#8d8d8d',60,190);water(220,200,0,-22,-1.4);terrace(24,14,0,8);terrace(18,15,0,-16.5);
 for(const x of [-12.8,12.8])for(let z=12;z>-27;z-=8){tieWall(.65,14,1.2,x,z,0);box(4.5,.5,1.2,x,14.2,z,'@concrete')}
 portalFrame(0,-25,5,11);stairFlight(-18,10,4,28,.35,.6);box(9,.5,4,-19,9.8,-9,'@concrete');arch(17,-22,0,3.6,9);cypressCluster(-20,-27,6,8,-1.4);cypressCluster(21,-34,5,8,-1.4);
 for(const x of [-8,8])for(const z of [12,4,-12,-20])lampPost(x,z,3.2,1);shadowLamp=new V(0,4,8.5);lampPost(0,8.5,4,1.5);const light=new THREE.PointLight('#ffffff',16,30,1.8);light.position.copy(shadowLamp);world.add(light);
 shadowCaster=cube(2,5,.8,'effigy');ring(0,2.5,0,1.2,'#fafafa');dock(0,2,0,'影子显影');shadowMesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:'#101010',transparent:true,opacity:.96,side:THREE.DoubleSide}));shadowMesh.rotation.x=-Math.PI/2;shadowMesh.position.y=.035;world.add(shadowMesh);gate(0,-21).open=true;flags.shadowAligned=false;seat(-8.5,9,0,.35);
}
function makeRoad(){
 for(let i=0;i<76;i++){const t=(i+.5)/76,x=42+3.3*Math.sin(t*Math.PI*2),z=6-t*29,y=t*2.4;const road=box(3.5,.42,.65,x,y-.21,z,'@concrete',world,true);road.rotation.y=Math.atan2(-3.3*Math.PI*2*Math.cos(t*Math.PI*2),29);refresh(road);for(const a of [-1,1]){const line=box(.055,.015,.65,a*1.65,.22,0,'#fafafa',road);line.castShadow=false;}if(i%4===0)for(const a of [-1,1])box(.07,.65,.07,x+a*1.9,y+.32,z,'#a0a0a0')}
 terrace(11,10,42,-27,2.4);
}
function palace(){
 for(let i=0;i<7;i++){const x=23+i*2.3,h=21-i*1.7;tieWall(2.3,h,5,x,-38,0);for(let y=2;y<h-1;y+=2.8)box(.4,1.35,.035,x,y,-35.475,'#2c2c2c')}
 stairFlight(31,-23,3.4,23,.37,.67,2.4);portalFrame(42,-33.5,5.8,12,2.4,1.15);arch(53,-35,2.4,4,10);cypressCluster(54,-35,7,10);cypressCluster(28,-34,5,8);
 const moon=new THREE.Mesh(new THREE.SphereGeometry(.73,40,32),new THREE.MeshStandardMaterial({color:'#e9e9e9',emissive:'#d0d0d0',emissiveIntensity:.42,roughness:1}));moon.position.set(42,8,-36.8);world.add(moon);
}
function buildMoonRoad(){
 setupLight('day',42);water(250,230,20,-22,-1.4);terrace(15,21,0,3);
 for(const x of [-9,9]){tieWall(2.5,12,8,x,-4,0);arch(x,-8,0,2.2,7.5)}stairFlight(-10.8,9,3.6,25,.36,.6);portalFrame(0,-6.8,6.3,7.4,0,.7);
 makeRoad();palace();teleportPair({x:0,z:-7},{x:42,z:6});const poster=cutPanel(0,-6.8,6,7,'screen');
 const pc=new THREE.PerspectiveCamera(55,6/7,.1,650);pc.position.set(42,7,15);pc.lookAt(42,.7,-12);renderer.render(scene,pc);const img=new Image(),tx=new THREE.Texture(img);tx.colorSpace=THREE.SRGBColorSpace;img.onload=()=>tx.needsUpdate=true;img.src=renderer.domElement.toDataURL('image/jpeg',.8);if(img.complete)tx.needsUpdate=true;poster.material=new THREE.MeshBasicMaterial({map:tx});
 addCard('cutout','给风景剪一个入口');sign('06 / WALK INTO THE FRAME',0,8.1,-6.7,7,.6,'#333333');seat(42,-23,2.4,0);seat(38,-28,2.4,.5);actorPad(38,-25,'留下一段回声','echo',2.4);sensor(46,-25,3.8);box(.8,1.2,.5,46,3,-25,P.dark);ring(46,-25,2.4,.8,P.teal);
 makeAlignment(new V(42,3.7,-23),new V(42,8,-36.8),()=>{renderer.render(scene,camera);addCard('copy','一小片月亮',{kind:'moon',size:.55,img:renderer.domElement.toDataURL('image/jpeg',.8)});flags.moonRemembered=true;showToast('月光被记进照片。留一段回声，再把月光显影在右侧接收器附近。',7)},2.4);gate(42,-29,2.4);flags.moonRemembered=false;flags.moonExit=false;choirCharge=0;
}
function enhanceScene(){
 world.userData.edition=MONO_VERSION;world.userData.chapter=chapterNumber(level);
 world.traverse(o=>{if(o.isLight){o.color.set('#ffffff');if(o.groundColor)o.groundColor.set('#555555')}const list=Array.isArray(o.material)?o.material:[o.material];for(const m of list){if(!m)continue;if(m.color)m.color.copy(neutral(m.color));if(m.emissive)m.emissive.copy(neutral(m.emissive))}});
 for(const c of cubes){if(c.userData.kind==='cube'){c.material=mat('#eeeeee');c.geometry=roundedGeometry(1,1,1,.025)}if(c.userData.light)c.userData.light.color.set('#ffffff')}
}
function updateMonochrome(now){
 for(const g of gates)if(g.status){g.status.material.color.set(g.open?'#ffffff':'#666666');g.status.scale.setScalar(g.open?1.06:1)}
 if(ghost)ghost.traverse(o=>{if(o.isMesh&&o.material.color){o.material.color.set(ghostValid?'#ffffff':'#777777');o.material.opacity=ghostValid?.43:.16}});
 if(photoMode){$('prompt').textContent=ghostValid?'✓ 可显影　F / 左键':'× 位置未就绪　调整落点或朝向';$('prompt').hidden=false;}
 renderWater(now);
}

function renderWater(now){
 if(!monoWater.length)return;const w=monoWater[0],u=w.material.uniforms;u.time.value=now/1000;
 if(frame%(highQuality?5:18)!==0&&u.ready.value)return;
 const c=w.userData.reflectionCamera,h=w.position.y,f=camera.getWorldDirection(new V()),t=camera.position.clone().add(f);
 c.copy(camera);c.position.copy(camera.position);c.position.y=2*h-c.position.y;t.y=2*h-t.y;c.up.set(0,-1,0);c.lookAt(t);c.updateMatrixWorld(true);
 u.matrix.value.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(c.projectionMatrix).multiply(c.matrixWorldInverse);
 const visibility=monoWater.map(m=>m.visible),portalsVisible=portals.map(p=>p.mesh.visible);for(const m of monoWater)m.visible=false;for(const p of portals)p.mesh.visible=false;
 renderer.setRenderTarget(w.userData.reflection);renderer.render(scene,c);renderer.setRenderTarget(null);monoWater.forEach((m,i)=>m.visible=visibility[i]);portals.forEach((p,i)=>p.mesh.visible=portalsVisible[i]);u.ready.value=1;
}
