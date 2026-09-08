/* A separate, optional hands-on lesson. The eleven story chapters keep their indices. */
const PRACTICE_LEVEL=11;
let practice=null,practiceFinished=false,practiceDestination=6,practiceLegend='';
try{practiceFinished=localStorage.getItem('borrowed-distance-practice-v1')==='done'}catch(e){}
const practiceLessons=[
 ['先走到地上的圆圈','按 W 向前走。把自己移动到前方的浅蓝圆圈里；不用跳，也没有时间限制。','WASD 移动','这里通过移动、观察和改变物体解谜，没有战斗。',0,13,.15],
 ['用准星选中方块，再拿起来','移动鼠标，让屏幕中心的小圆点落在黄色方块上，再按 E。若鼠标不转动，按住右键拖动或用方向键。','准星对准方块 → E','能互动时，准星会变大，并显示“E 拿起”。',0,9,.5],
 ['让方块真的变大','拿着方块，抬到平视前方。按 + 或向上滚动滚轮，把尺寸从 0.60 m 增大到至少 1.40 m。','+ / 滚轮向上 推远','拿住时，方块在画面中看起来差不多大；把它推到更远处，实际尺寸就会变大。',null,null,null],
 ['把变大的方块放在圆环上','保持方块至少 1.40 m。转向右侧黄色圆环，低头调整落点，E 放下。走近或侧移可以调整位置。','E 放下','放下后，尺寸会保留下来。只有落在圆环中心、大小合适并松手，圆环才会亮。',3,4,.2],
 ['给方块拍一张照片','空手看向刚才放好的方块，按 P。右下角会出现一张记录了尺寸的照片，原方块仍在原地。','准星对准方块 → P','P 是拍照：保存这个可操作物体此刻的大小与种类，不会把原件拿走。',3,4,1],
 ['把照片举到眼前','按 C 举起刚拍的照片。半透明形状是放置预览，现在还不是实体。','C 举起照片','举照片和拍照片是两个动作：P 保存，C 查看放在哪里。',-3,4,.2],
 ['让照片里的方块落进现实','转向左侧空地。滚轮调整预览的远近；变绿后按 F。若仍是橙色，移开自己或避开原方块。','绿色预览 → F','F 把照片里的东西放进世界，这叫“显影”。成功后，原件和副本会同时存在。',-3,4,.2],
 ['试着收回刚才的副本','现在有两个方块。按 X，刚才从照片生成的副本会消失；原件和照片都还在。','X 收回最近显影','可以放心尝试：X 收回照片产生的东西，Z 撤销物体操作，R 重置整间练习室。',null,null,null],
 ['领取一张道路照片','向前走近照片架，准星对准它，按 E。照片除了记录小物体，也能装下一段可行走的桥。','靠近照片架 → E','接下来把同一套 C → F 操作用在桥上，走过去验证它是真的。',0,-3,1.8],
 ['把桥的两端搭在岸上','走到断崖前的蓝色脚印处，面朝对岸。C 举桥照片，滚轮调整到绿色，F 放下；照片会变成一座桥。','C 预览 → 绿色时 F','桥的起点和终点都要落在平台上。橙色表示两端还没接好，此时不能放置。',0,-5.5,.15],
 ['亲自走过照片变成的桥','沿刚出现的桥向前走。它已经可以承受你的重量；万一掉下去，会回到安全位置。','W 向前走过桥','规则可以组合：改变尺寸、保存一个副本，再把照片变成下一段路。',0,-20,1],
 ['你已经亲手验证了两条规则','走进前方出口，开始园林第 07 章。以后遇到留白、回声和月光，还会看到对应的白话解释。','W 走进出口','推远会变大；照片能变成实体。关卡要你用这些规则找路，不需要了解任何原作。',0,-24,1.6]
];
function buildPractice(){
  setupLight();scene.background.set('#356c87');floor(24,28,0,6,0,'@tile');floor(16,10,0,-23,0,'@tile');wallRoom(0,6,24,28,8,P.white);
  for(const x of [-10,10])for(const z of [17,5,-6])box(.2,5,.2,x,2.5,z,P.teal);
  const original=cube(0,9,.6);pad(3,4,1.4,4.6,0,'大方块');ring(0,13,0,.8,P.teal);floorSign('先走到这里',0,13.8,0,3);
  ring(-3,4,0,1,P.teal);floorSign('给副本留一块空地',-3,6,0,4);
  box(.05,1,.05,4.8,.5,4,P.dark);box(.5,.035,.05,4.8,1,4,P.yellow);sign('1 m',4.8,1.35,4,1,.4);
  sign('试一试，规则会自己变得清楚',0,5,-7.8,11,.8);sign('照片可以成为你脚下的路',0,5,-26,10,.8);
  dock(0,-7.5,0,'让桥的两端落在地面');ring(0,-5.5,0,.65,P.teal);
  gate(0,-24);hasCamera=true;checkpoint.set(0,EYE,16);practice={stage:0,originalId:original.userData.id,lastStage:-1,seconds:0,bridgePickup:false};
}
function practiceOriginal(){return cubes.find(c=>c.userData.id===practice?.originalId)}
function practiceSetStage(stage){if(!practice||practice.stage===stage)return;practice.stage=stage;practice.seconds=0;showToast(['','','拿到了。下一步试试让它变大。','尺寸已经变了！放到圆环上验证。','圆环亮了：这个方块真的更大了。','拍到了。原件仍然在场景里。','现在看到的是预览，按 F 才会变成实体。','成功：现在有了两个独立方块。','副本已收回，照片还可以再用。','试着把同样的规则用在桥上。','这张照片已经成为可走的桥。','你已经学会基础规则。'][stage]||'继续试一试。',5)}
function tickPractice(dt){
  if(level!==PRACTICE_LEVEL||!practice)return;practice.seconds+=dt;const s=practice.stage,o=practiceOriginal();
  if(s===0&&Math.hypot(player.pos.x,player.pos.z-13)<1)practiceSetStage(1);
  if(s===1&&held?.obj===o)practiceSetStage(2);
  if(s===2&&held?.obj===o&&o.userData.size>=1.4)practiceSetStage(3);
  if(s===3&&pads[0].on)practiceSetStage(4);
  if(s===4&&guideCopy('cube'))practiceSetStage(5);
  if(s===5&&photoMode&&cards[selected]?.type==='copy')practiceSetStage(6);
  if((s===5||s===6)&&placed.some(p=>p.type==='copy'))practiceSetStage(7);
  if(s===7&&!placed.some(p=>p.type==='copy'))practiceSetStage(8);
  if(practice.stage>=8&&!practice.bridgePickup){pickup('bridge',0,-3,0,'一座可以走的桥');practice.bridgePickup=true;world.updateMatrixWorld(true);}
  if(s===8&&cards.some(c=>c.type==='bridge'))practiceSetStage(9);
  if(s===9&&placed.some(p=>p.type==='bridge'))practiceSetStage(10);
  if(s===10&&player.pos.z<-18&&player.pos.y>EYE-.2){practiceSetStage(11);checkpoint.set(0,EYE,-20);}
  gates[0].open=practice.stage===11;
  $('objective').textContent='练习 '+(practice.stage+1)+' / '+practiceLessons.length+' · '+practiceLessons[practice.stage][0];
  renderPracticeFacts();
}
function practiceGuide(){
  const l=practiceLessons[practice?.stage||0],s=practice?.stage||0,o=practiceOriginal();let body=l[1],target=l[4]===null?null:new V(l[4],l[6],l[5]);
  if([1,2,4].includes(s)&&o)target=o.position.clone();
  if(s===2&&!held)body='方块放下了也没关系。先重新对准黄色方块按 E 拿起，再平视按 + 推远放大。';
  if(s===3&&o&&o.userData.size<1.4)body='刚才又缩小了。E 拿起、抬到平视，按 + 放大到至少 1.40 m，再放到右侧圆环上。';
  if(s===4&&!held&&!aimTarget())body='走近黄色方块，把准星放在它的表面，再按 P。这里只拍可操作物体，不拍整间房。';
  if(s===6&&!photoMode)body='照片收起来了。按 C 再举起，转向左侧空地，等预览变绿后按 F。';
  if(s===10&&!placed.some(p=>p.type==='bridge'))body='桥被收回了。Tab 切到桥照片，回到岸边蓝色脚印处，再用 C → F 把桥放回来。';
  if(s===9&&cards[selected]?.type!=='bridge')body='先按 Tab 切换到右下角的“桥”照片，再去蓝色脚印处，朝对岸用 C → F 放桥。';
  if(practice?.seconds>35)body+=' 卡住时按 H 慢慢看；也可以 Esc 暂停后跳过练习。';
  return guideStep('practice-'+s,l[0],body,target,s<4?'练习目标':s<8?'原件 / 副本':s===8?'桥照片':s===9?'显影站位':s===10?'对岸':'练习出口',s+1,practiceLessons.length);
}
function renderPracticeFacts(){
  const isPractice=level===PRACTICE_LEVEL&&!!practice;$('practiceFacts').hidden=!isPractice||!guideEnabled;
  if(!isPractice)return;
  const o=practiceOriginal(),s=practice.stage,l=practiceLessons[s];
  $('practiceRule').textContent=l[3];$('practiceAction').textContent=l[2];
  $('practiceMeasure').textContent=s<4?'原来 0.60 m → 现在 '+(o?.userData.size||.6).toFixed(2)+' m':s<8?'原件 '+(o?'1':'0')+' 个 · 照片副本 '+placed.filter(p=>p.type==='copy').length+' 个':placed.some(p=>p.type==='bridge')?'桥已成为实体，可以行走':'照片里的桥，尚未成为实体';
  $('keyLegend').textContent=l[2]+'　·　H 详细说明　Esc 暂停 / 跳过　G 指引开关';
}
function resetPracticeUI(){if(level!==PRACTICE_LEVEL)practice=null;$('practiceFacts').hidden=true;$('skipPracticeBtn').hidden=level!==PRACTICE_LEVEL;if(level!==PRACTICE_LEVEL&&practiceLegend)$('keyLegend').innerHTML=practiceLegend;}
function finishPractice(){practiceFinished=true;try{localStorage.setItem('borrowed-distance-practice-v1','done')}catch(e){}startGame(practiceDestination);showToast('练习完成。试着把“缩放 + 照片”的规则用在这间小房子上。',7)}
function beginPractice(destination=6){practiceDestination=destination;startGame(PRACTICE_LEVEL)}
function initPractice(){practiceLegend=$('keyLegend').innerHTML;$('practiceBtn').onclick=()=>beginPractice(6);$('skipPracticeBtn').onclick=()=>startGame(practiceDestination);$('startBtn').onclick=()=>{if(guideEnabled&&!practiceFinished)beginPractice(6);else startGame(6)};}
function mechanicPrinciple(){
  if(level===PRACTICE_LEVEL)return practiceLessons[practice?.stage||0][3];
  return [
    '拿住物体推远，实际尺寸就变大；放下后尺寸保留。照片显影后会成为能踩上去的楼梯。',
    '走廊会把你送回原处。把合适的小物体留在锚点上，可以让循环出现新的出口。',
    '分散的线条只会在特定位置看起来重合。站位和看向哪里同样重要；不需要按拍照键。',
    'P 保存物体此刻的大小；C 看放置预览，F 生成另一件实物。原件和副本可以分别缩放。',
    '青色门连接远处空间，直接走过即可。灯越大照得越远；这里的桥只在你转身时出现。',
    '一件东西可以有多个用途。留下原件稳定起点，再让照片的副本去完成远处的机关。',
    '拿住房子推远会变大，放下后可按 F 进入。P 拍灯、C / F 复制，就能把屋外的光带进去。',
    '留白负片是一张“洞”的照片。对准白弧标记按 C / F，墙就会出现通道；X 收回后墙会恢复。',
    '回声是你路线的重放。V 开始，V 结束；它会停在终点替你占位，不会替你搬物体。',
    '人偶越大，影子越长。把准星对准地上的影子按 P，再 C / F，影子的照片就变成能走的路。',
    '先用留白剪开幕布，再走进去。坐上红椅才能对齐月亮；获得月光后，用回声与照片同时接通两处机关。'
  ][level]||'';
}
function photoFailureReason(){
  const c=cards[selected];if(!c||!ghost)return 'C 举起照片后，先调整半透明预览的位置。';
  if(c.type==='cutout')return '把准星放在白弧标记上，并走近到十米以内；普通墙不能剪开。';
  if(c.type==='copy'){
    const p=ghost.position;if(!Number.isFinite(groundAt(p.x,p.z,player.pos.y+.3)))return '预览下方没有地面。转向岸上空地，再试一次。';
    if(Math.hypot(p.x-player.pos.x,p.z-player.pos.z)<=c.size/2+R+.15)return '副本离自己太近。向后退一步，或用滚轮把预览推远。';
    if(cubes.length>=8)return '场景里的物体已达到上限。先按 X 收回一件照片副本。';
    return '落点与原件或墙壁重叠。横移，或把预览转向空地。';
  }
  return '桥 / 楼梯的两端还没同时搭住地面。先站在标记处朝出口，再用滚轮微调；Q / E 可转 90°。';
}
chapters.push({title:'先借一个不可能',sub:'00 / TRY THE RULES WITH YOUR OWN HANDS',goal:'一间可以随时重来的练习室。每次只试一个动作。',intro:'不用了解任何原作。先在这里亲手验证两条规则。',hints:['先移动到蓝圈，再对准黄色方块按 E。拿住后抬到平视，+ 或滚轮向上推远，实际尺寸会增加。','放大到至少 1.40 m，把方块放在右侧黄色圆环。接近圆环，低头调落点，E 松手，亮起即成功。','空手 P 拍方块，C 举照片，转向左侧空地，绿色时 F。随后按 X 收回副本，原件和照片保留。','领取桥照片后，站在断崖前蓝圈，朝对岸用 C / F。走过真的桥，再进入出口。Esc 菜单可以随时跳过练习。']});
