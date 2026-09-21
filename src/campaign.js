/* Public chapter order. Legacy scene IDs stay private to the geometry builders. */
const CAMPAIGN=Object.freeze([11,2,6,7,9,10]);
function chapterNumber(raw){return String(CAMPAIGN.indexOf(raw)+1).padStart(2,'0')}
const campaignMetadata=[
 {title:'借一个台阶',sub:'01 / THE BORROWED MEASURE',mechanics:'缩放 · 拍照 · 显影',goal:'从一次拿起开始，亲手把照片变成路。',intro:'第一章 · 借一个台阶。每次只试一个动作，先走到蓝色圆圈。'},
 {title:'泳池来信',sub:'02 / A LETTER FROM THE POOL',mechanics:'楼梯 · 视点 · 双重曝光',goal:'登上水中的观察台，让分散的轮廓成为下一座桥。',intro:'第二章 · 泳池来信。上一关的桥来自照片，这一次，要先从视点里找到它。'},
 {title:'折叠的家',sub:'03 / A HOUSE LARGER WITHIN',mechanics:'放大房屋 · 把光带进去',goal:'拍下灯光，放大小屋，把一份光带进更大的庭院。',intro:'第三章 · 折叠的家。街区向天空卷起，一间小屋正等待你决定它的大小。'},
 {title:'留白花园',sub:'04 / AN ADDRESS IN THE HEDGE',mechanics:'缩小锚点 · 循环 · 负片',goal:'留下地址，跟随鹿，用同一片留白穿过两道绿篱。',intro:'第四章 · 留白花园。先缩小方块稳定地址，再寻找不重复的路线。'},
 {title:'影子成路',sub:'05 / THE WEIGHT OF A SHADOW',mechanics:'尺度 · 投影 · 保存影长',goal:'放大人偶延长影子，拍下长度，再把影子铺到对岸。',intro:'第五章 · 影子成路。人偶不能走过断崖，但它的影子可以先抵达。'},
 {title:'月光归档',sub:'06 / THE MOON ARCHIVE',mechanics:'画中路 · 红椅 · 回声与光',goal:'穿入幕布，坐下看月亮，让回声与月光同时留在庭院。',intro:'第六章 · 月光归档。用留白进入画中，再把最后一个视点带回现实。'}
];
CAMPAIGN.forEach((raw,i)=>Object.assign(chapters[raw],campaignMetadata[i]));
chapters[7].hints.unshift('先缩小入口的黄色方块：E 拿起，− 拉近到 ≤ 0.70 m，放在锚点中心松手。圆环亮起后，花园才会记住正确路线。');
