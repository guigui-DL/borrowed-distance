/* Optional guidance. Reads puzzle state; never changes a puzzle condition. */
let guideEnabled=true,guideLearned=false,guideOrigin=null,guideYaw=0,guidePitch=0,guideMoved=false,guideLooked=false,guideHintOpen=false,guideHintResume=false,guideHintIndex=0;
try{guideEnabled=localStorage.getItem('borrowed-distance-guide')!=='off';guideLearned=localStorage.getItem('borrowed-distance-controls')==='learned'}catch(e){}
function guideStep(id,title,body,target=null,label='',index=1,total=1){return {id,title,body,target,label,index,total}}
function guidePoint(x,z,y=.3){return new V(x,y,z)}
function guideObject(kind){return cubes.find(c=>c.userData.kind===kind)}
function guideCopy(kind){return cards.find(c=>c.type==='copy'&&(!kind||c.kind===kind))}
function guideExit(index,total){const g=gates[0];return guideStep('exit','走进亮起的出口',level===10?'月光与回声已接通。走过出口门框，完成六章旅程。':'机关已接通。用 WASD 走过出口门框，就会进入下一章。',guidePoint(g.x,g.z,g.y+1.7),'本章出口',index,total)}
function chapterGuide(){
  if(level===11)return practiceGuide();
  const obj=kind=>guideObject(kind)?.position.clone(),ps=(i)=>guidePoint(pads[i].x,pads[i].z,pads[i].y+.15),ap=(i)=>guidePoint(actorPads[i].x,actorPads[i].z,actorPads[i].y+.15);
  const step=(id,title,body,target,label,index,total)=>guideStep(id,title,body,target,label,index,total);
  if(level===0){
    if(!cards.some(c=>c.type==='stairs')){
      if(player.pos.y>3.5&&player.pos.z<-3)return step('reception-photo','领取高台上的照片','走近接待台，准星对准照片，按 E 领取。照片进入右下角相册。',guidePoint(-5,-9.5,4),'楼梯照片',2,4);
      return step('reception-step','借一个够得着高台的台阶','对三点方块按 E 拿起。平视、按 + 推远放大至约 1.2 m，再低头放在左侧高台前。空格跳上方块，再跳上高台。',guidePoint(-5,-3.1,.8),'台阶落点',1,4);
    }
    if(!placed.some(p=>p.type==='stairs'))return step('reception-stairs','让照片连接两层地面','站到大厅尽头的 DEVELOP 标记前，面朝出口。C 举照片；滚轮调距离，预览显示“可显影”后 F 显影。',guidePoint(0,-8,.2),'站在这里朝前显影',3,4);
    return guideExit(4,4);
  }
  if(level===1){
    if(flags.seenDoor)return guideExit(3,3);
    if(!pads[0].on)return step('back-anchor','在重复中留下一件小东西','E 拿三点方块，按 − 拉近缩到 0.65 m 以下；放在左侧锚点中心，再松手。圆环亮起才算接通。',ps(0),'小尺寸锚点',1,3);
    return step('back-loop','再走一次，然后回头','让方块留在圈里，走到前方走廊尽头，经历循环后转身看向来时的方向。',guidePoint(0,-20,1),'循环尽头',2,3);
  }
  if(level===2){
    if(!cards.length)return step('pool-photo','收下水边的楼梯照片','走近右侧照片架，准星对准照片，按 E。',guidePoint(4,8,1.8),'照片架',1,5);
    if(!placed.some(p=>p.type==='stairs'))return step('pool-stairs','把楼梯接到中央高台','站在近岸标记前朝中央高台。C 举照片，滚轮调落点，显示“可显影”时 F。',guidePoint(0,4,.2),'显影站位',2,5);
    if(!align.done)return step('pool-align','登上高台，让三段弧线成为圆','走上楼梯，站在双线观察圈中心。移动视角对准远处圆弧，保持约 1.2 秒。',player.pos.distanceTo(align.pos)<1.3?align.target:align.pos,'观察位置 / 视线',3,5);
    if(!placed.some(p=>p.type==='bridge'))return step('pool-bridge','用第二张照片继续走','Tab 切换到桥照片，在高台后缘面朝出口，C 举起、F 显影。第一段楼梯会继续保留。',guidePoint(0,-11,2.6),'第二次显影',4,5);
    return guideExit(5,5);
  }
  if(level===3){
    if(!hasCamera)return step('archive-camera','先领取相机','靠近中间的相机架，准星对准相机，按 E。',guidePoint(0,9,1.8),'相机',1,5);
    if(cubes.length<2&&!guideCopy())return step('archive-capture','给唯一的方块留一份副本','把手里的东西放下，准星对准三点方块，按 P。照片记住此刻的尺寸。',obj('cube'),'拍摄原件',2,5);
    if(cubes.length<2)return step('archive-copy','将照片变成第二个方块','C 举起照片，朝旁边的空地放置。提示“可显影”表示能放下，按 F 得到独立副本。',guidePoint(-3,4,.2),'空地',3,5);
    if(!pads.every(p=>p.on))return step('archive-pads','一小一大，同时接通','E 搬动两个方块：左圈 ≤ 0.85 m，右圈 ≥ 1.8 m。滚轮 / − + 改变尺寸，放在圈中心后松手。',ps(pads[0].on?1:0),pads[0].on?'大尺寸接口':'小尺寸接口',4,5);
    return guideExit(5,5);
  }
  if(level===4){
    if(flags.bridgeBuilt)return guideExit(4,4);
    if(player.pos.x<25)return step('garden-door','带着光穿过门','对发光灯箱按 E 拿起，然后直接走过白色折叠门。',guidePoint(0,-8,1.6),'折叠门',1,4);
    if(!sensors[0].on)return step('garden-light','让光够到对岸','把灯箱放大到约 2.1 m，放在断崖前。灯箱越大，光能到达的距离越远。',guidePoint(36,2,1),'灯箱落点',2,4);
    return step('garden-away','给身后的路一点时间','接收器已亮起。转身背对断崖，停留约一秒，然后转回来查看道路。',guidePoint(36,10,1.6),'转身朝这里',3,4);
  }
  if(level===5){
    if(flags.finalDoor)return guideExit(7,7);
    if(!pads[0].on){if(!guideCopy('cube'))return step('final-copy','先保留三点方块的副本','准星对准三点方块，P 拍照。后面要让原件留在近岸，副本去对岸。',obj('cube'),'原件',1,7);return step('final-anchor','让原件守住近岸','E 拿方块，缩小到 ≤ 0.7 m，放在左侧锚点。这个圈必须一直亮着。',ps(0),'地址锚点',2,7)}
    if(!placed.some(p=>p.type==='bridge'))return step('final-bridge','接通前往对岸的桥','Tab 选桥照片，站在近岸标记前朝出口，C 举起、F 显影。',guidePoint(0,4,.2),'显影桥',3,7);
    if(!pads[1].on)return step('final-weight','把另一份重量送过去','Tab 选三点方块照片，C / F 得到副本。E 带过桥，放大到 ≥ 1.8 m 后放入右侧圆环。',ps(1),'对岸重量',4,7);
    if(!sensors[0].on)return step('final-light','把光也带到对岸','E 搬运灯箱，或 P 拍灯、C / F 复制。放大后放到对岸左侧接收器附近。',sensors[0].pos,'光接收器',5,7);
    return step('final-align','从最上方重新看见完整的圆','走上接通的楼梯，站在观察圈中央，朝远处的弧线看约 1.2 秒。',player.pos.distanceTo(align.pos)<1.3?align.target:align.pos,'观察点',6,7);
  }
  if(level===6){
    if(gates[0].open)return guideExit(5,5);
    if(player.pos.x>25){if(!guideCopy('lamp'))return step('house-return','回屋外，补拍一份光','先通过身后的门返回：准星对准门，按 E。屋外对灯箱按 P，再进入房子。',guidePoint(38,8,1.7),'回到屋外',1,5);return step('house-light','把照片里的光带进庭院','Tab 选灯箱照片。靠近右侧接收器，C 举起，显示“可显影”时 F 显影。照片里的灯会成为真实光源。',sensors[0].pos,'光接收器',4,5)}
    if(!guideCopy('lamp'))return step('house-photo','先拍下屋外的光','走近右边的发光灯箱。空手时把准星对准它，按 P；右下角会出现灯箱照片。',obj('lamp'),'屋外灯箱',1,5);
    if(!guideObject('house')||guideObject('house').userData.size<2.8||held?.obj===guideObject('house'))return step('house-scale','把小房子放大到能走进去','靠近房子，E 拿起；平视开阔处，滚轮向上 / + 推远至 ≥ 2.8 m。随后低头，让房子落在空地上，E 放下。',obj('house'),'可拿取的小房子',2,5);
    return step('house-enter','进入放大的房门','空手靠近房子，把准星对准房子正面的门，按 F。这里的 F 是进入；举照片时 F 才是显影。',obj('house'),'房门 · F 进入',3,5);
  }
  if(level===7){
    if(!pads[0].on)return step('hedge-anchor','先留一个不会漂移的地址','E 拿入口的三点方块，− 拉近缩小到 ≤ 0.70 m，放在入口的右侧实线圆环中心，再松手。锚点亮起后，鹿走过的路线才会被记住。',cubes[0].userData.size>.7?cubes[0].position.clone():ps(0),'方块 / 地址锚点',1,5);
    if(flags.mazeStage===2)return guideExit(5,5);
    if(placed.some(p=>p.type==='cutout')){const cut=placed.find(p=>p.type==='cutout');if(flags.mazeStage===1&&cut.pos[2]>-5)return step('hedge-recall','走出通道，再收回留白','确认整个人已离开墙面，再按 X。第一面墙复原，照片就能用于下一处白弧。',guidePoint(-4,-3,.2),'墙外安全位置',3,5);return step('hedge-cross','走过刚剪开的入口','WASD 穿过白色拱框。走到墙的另一侧后再收回；站在洞里时不能收回。',guidePoint(cut.pos[0],cut.pos[2]-3,1),'穿过入口',flags.mazeStage===0?2:4,5)}
    const second=flags.mazeStage===1;return step(second?'hedge-second':'hedge-first',second?'把同一片留白用在下一面墙':'沿着鹿的方向剪开影墙',second?'沿横向通道到右侧，C 举负片，对准第二面墙的白弧。预览显示“可显影”，F 剪开。':'先沿中间走到影墙尽头，在横向通道左转。C 举负片，对准白弧标记，预览显示“可显影”后 F 剪开墙面。',guidePoint(second?4:-4,second?-11:1,2.3),'白弧标记',second?4:2,5);
  }
  if(level===8){
    if(flags.chorusOpen)return guideExit(4,4);
    if(!actorPads[2].on||!actorPads[3].on)return step('choir-effigy','先把人偶放进正确的位置','从后方“IV 留空”圈拿走深色人偶，缩到 ≤ 1.05 m，放进右边“III 人偶”圈。IV 圈要保持空着。',ap(2),'III · 人偶',1,4);
    if(!actorPads[0].on)return step('choir-echo','留下一段回声',echoRecord?'正在录制：走进左侧 I 圈，再按 V 结束。回声会重走一次，并停在你结束录制的位置。':'走到左侧 I 圈，按 V 开始；停留片刻，再按 V 结束。回声会替你留在这里。',ap(0),'I · 回声',2,4);
    return step('choir-player','让自己成为最后一个来客','你站进中间 II 圈，保持约两秒。左侧回声、右侧小人偶、后方空位必须同时成立。',ap(1),'II · 来客',3,4);
  }
  if(level===9){
    if(placed.some(p=>p.type==='shadow'))return guideExit(5,5);
    const photo=cards.find(c=>c.type==='shadow');
    if(!photo||photo.length<11){if(!flags.shadowAligned||shadowLength<12)return step('shadow-size','让人偶的影子够到对岸','E 搬动深色人偶，放在断崖前圆环上。放大至约 2.8 m，放下后影长应达到约 14 m。',guidePoint(0,2.5,.2),'人偶落点',1,5);return step('shadow-capture','拍摄地上的影子','先放下人偶，侧移到一旁再低头。让准星落在地面的长影上，按 P；照片应显示“影子道路”。',guidePoint(0,-2,.035),'拍这里的长影',2,5)}
    if(flags.shadowAligned||held?.obj===shadowCaster)return step('shadow-clear','保留影长，移开人偶','照片已经记住 '+photo.length.toFixed(1)+' m 的长度。E 把人偶搬到侧面空地并放下，让圆环前的路口空出来。',guidePoint(5,5,.2),'把人偶放到侧边',3,5);
    return step('shadow-develop','让影子的照片成为路','Tab 选影子，站到断崖前面向对岸。C 举起，滚轮调落点，显示“可显影”时 F 显影；再走上黑色道路。',guidePoint(0,4,.2),'朝对岸显影',4,5);
  }
  if(level===10){
    if(flags.moonExit)return guideExit(7,7);
    if(player.pos.x<25)return step('moon-screen','剪开公路幕布，走进画面','C 举留白负片，对准前方幕布的白弧标记；显示“可显影”时 F 剪开，再用 WASD 穿过入口。',guidePoint(0,-6.8,2.3),'幕布入口',1,7);
    if(!flags.moonRemembered){if(seated)return step('moon-align','坐稳，让圆弧围住月亮','移动鼠标环顾，让三段弧线重合。对准后保持约 1.2 秒；进度条满时月光会自动进入相册。',align.target,'月亮与圆弧',3,7);return step('moon-seat','沿弯路上行，在中央观测椅坐下','沿 S 形道路走到高处庭院。靠近正中观测椅，把准星对准椅子，按 E。站着观察不会得到月光。',guidePoint(42,-23,3.2),'中央观测椅',2,7)}
    if(seated)return step('moon-rise','带着月光起身','月光照片已收进相册。按 WASD 或空格起身，然后到左侧的回声圈。',ap(0),'起身，前往回声圈',4,7);
    if(!actorPads[0].on)return step('moon-echo','留一段回声在庭院',echoRecord?'站稳在左侧回声圈，再按 V 结束。回声会留在本次录制的终点。':'走进左侧回声圈，V 开始录制，停留片刻，再 V 结束。',ap(0),'回声圈',5,7);
    return step('moon-light','把月光显影在右边','Tab 切到“一小片月亮”，靠近右侧接收器。C 举照片，显示“可显影”时 F。让月光和回声同时停留约一秒。',sensors[0].pos,'月光接收器',6,7);
  }
  return guideStep('explore','继续探索',chapters[level].goal);
}
function guideControls(){
  if(echoRecord)return ['V 结束录制','走到回声圈再结束。回声只重放路线，不会替你拿物体。'];
  if(photoMode){const c=cards[selected];if(c?.type==='cutout')return [ghostValid?'F 剪开通道':'准星 → 白弧标记',ghostValid?'✓ 可显影：位置有效。按 F 剪开，C 放下照片。':'留白只能用于带白弧的墙；靠近并把准星放在标记上。'];return [ghostValid?'F 显影 · C 放下照片':'滚轮调距离 · Q / E 旋转',ghostValid?'✓ 可显影：可以成为实体。按 F 放置，X 可收回。':photoFailureReason()];}
  if(held)return ['E 放下 · 滚轮 / − + 缩放','当前 '+held.obj.userData.size.toFixed(2)+' m。'+(held.blocked?'前方被地面或墙挡住了。先抬到平视，转向空地再推远。':'推远变大，拉近变小；E 放下后会保留这个尺寸。')];
  if(seated)return ['鼠标环顾 · WASD / 空格起身','保持坐姿寻找完整圆弧，视角正确时会出现进度条。'];
  const o=aimTarget();if(o)return [o.userData.type==='seat'?'E 坐下':o.userData.type==='return'?'E 回到屋外':o.userData.type==='pickup'?'E 领取':o.userData.kind==='house'?'E 拿房子 · 放大后 F 进入':'E 拿起 · P 拍摄','准星已经对准可操作物体。照片在右下角，用 Tab 切换。'];
  return ['WASD 移动 · 鼠标环顾','准星放在物体上才可互动。H 详细线索 · R 重置本章 · G 开关指引。'];
}
function resetGuideSession(){guideOrigin=player.pos.clone();guideYaw=player.yaw;guidePitch=player.pitch;guideMoved=false;guideLooked=false;$('hintModal').hidden=true;guideHintOpen=false;guideHintResume=false;$('guideMarker').hidden=true;}
function currentGuide(){
  const puzzle=chapterGuide();if(level===11||guideLearned)return puzzle;
  if(guideOrigin&&player.pos.distanceTo(guideOrigin)>1.1)guideMoved=true;
  if(Math.abs(player.yaw-guideYaw)>.18||Math.abs(player.pitch-guidePitch)>.13)guideLooked=true;
  if(!guideMoved)return guideStep('walk','先试着走几步','按 W 向前，A / D 横移，S 后退。朝空地走两步；按住 Shift 可以快走。',null,'',1,2);
  if(!guideLooked)return guideStep('look','转动视角，找到准星','移动鼠标环顾。若鼠标没有锁定，按住右键拖动，或用方向键。屏幕中心的小圆点就是互动准星。',null,'',2,2);
  guideLearned=true;try{localStorage.setItem('borrowed-distance-controls','learned')}catch(e){}return puzzle;
}
function renderGuidance(){
  $('guidePanel').hidden=!guideEnabled||!active;$('guideMarker').hidden=true;
  renderPracticeFacts();if(!guideEnabled||!active)return;
  const s=currentGuide(),[key,note]=guideControls();
  $('guideCount').textContent=(level===11?'动手练习':s.id==='walk'||s.id==='look'?'初次操作':'本章步骤')+' '+s.index+' / '+s.total;
  $('ruleNote').hidden=level===11;$('guidePrinciple').textContent=mechanicPrinciple();$('guideTitle').textContent=s.title;$('guideBody').textContent=s.body;$('guideKey').textContent=level===11?practiceLessons[practice.stage][2]:key;$('guideNote').textContent=note;$('guideNote').hidden=!(held||photoMode||seated||echoRecord);
  $('guideMeter').style.width=Math.round((s.index-1)/s.total*100)+'%';
  const navigation=$('guideDirection');navigation.hidden=!s.target;
  if(s.target){const d=s.target.clone().sub(player.pos),distance=d.length(),f=camera.getWorldDirection(new V()),right=new V().crossVectors(f,camera.up).normalize();const forward=d.dot(f),side=d.dot(right);navigation.textContent=(forward<0?'转身寻找':Math.abs(side)<distance*.18?'前方':side>0?'右前方':'左前方')+' · '+s.label+' · 直线距 '+distance.toFixed(1)+' m';
    const pos=s.target.clone().project(camera),x=(pos.x*.5+.5)*innerWidth,y=(-pos.y*.5+.5)*innerHeight;
    if(forward>0&&pos.z>=-1&&pos.z<=1&&x>innerWidth*.3&&x<innerWidth-80&&y>170&&y<innerHeight-200){const marker=$('guideMarker');marker.hidden=false;marker.style.left=x+'px';marker.style.top=y+'px';$('guideMarkerLabel').textContent=s.label;}
  }
}
function setGuidance(on,announce=false){guideEnabled=!!on;try{localStorage.setItem('borrowed-distance-guide',on?'on':'off')}catch(e){}$('guideStart').checked=guideEnabled;$('guidePause').checked=guideEnabled;$('guideBtn').textContent='指引：'+(on?'开':'关')+' G';$('guideBtn').setAttribute('aria-pressed',String(guideEnabled));renderGuidance();if(announce&&active)showToast(on?'操作指引已开启。G 可随时关闭。':'操作指引已关闭。H 仍可查看本章线索。',4)}
function hint(){if(guideHintOpen){closeGuideHint();return}guideHintOpen=true;guideHintResume=active;active=false;clearKeys();$('hintModal').hidden=false;guideHintIndex=clamp(flags.hint||0,0,chapters[level].hints.length-1);renderGuideHint();if(document.pointerLockElement)document.exitPointerLock()}
function renderGuideHint(){const s=chapterGuide();$('hintChapter').textContent=chapterNumber(level)+' / '+chapters[level].title;$('hintNow').textContent=s.title+'：'+s.body;$('hintText').textContent=chapters[level].hints[guideHintIndex];$('hintCounter').textContent='线索 '+(guideHintIndex+1)+' / '+chapters[level].hints.length;$('hintPrevious').disabled=guideHintIndex===0;$('hintNext').disabled=guideHintIndex===chapters[level].hints.length-1;flags.hint=guideHintIndex;}
function closeGuideHint(){guideHintOpen=false;$('hintModal').hidden=true;if(guideHintResume){guideHintResume=false;resume()}}
function initGuidance(){
  $('guideStart').onchange=e=>setGuidance(e.target.checked);$('guidePause').onchange=e=>setGuidance(e.target.checked);$('guideBtn').onclick=()=>setGuidance(!guideEnabled,true);
  $('hintPrevious').onclick=()=>{guideHintIndex=Math.max(0,guideHintIndex-1);renderGuideHint()};$('hintNext').onclick=()=>{guideHintIndex=Math.min(chapters[level].hints.length-1,guideHintIndex+1);renderGuideHint()};$('hintClose').onclick=closeGuideHint;
  $('relearnBtn').onclick=()=>{guideLearned=false;resetGuideSession();setGuidance(true);try{localStorage.removeItem('borrowed-distance-controls')}catch(e){}$('relearnBtn').textContent='已安排：返回游戏后开始教学'};setGuidance(guideEnabled);
}
