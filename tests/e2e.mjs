import {chromium} from 'playwright';
import {server,chrome} from './helpers.mjs';
import assert from 'node:assert/strict';
const s=await server();
const browser=await chromium.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=swiftshader']});
const page=await browser.newPage({viewport:{width:907,height:510}}),errors=[];
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:8701/?debug=1&capture=1');
try{await page.waitForFunction(()=>window.__astro,{timeout:5000})}catch{throw new Error('Game did not boot: '+errors.join(' | '))}
await page.waitForFunction(()=>__astro.getState().characterClips.knight?.length>0,{timeout:8000});
assert((await page.evaluate(()=>__astro.getState().characterClips.knight.length))>=8,'KayKit knight animations load');
await page.screenshot({path:'qa/screenshots/tutorial-907.png'});
await page.screenshot({path:'qa/screenshots/village-golden-hour.png'});
const before=await page.evaluate(()=>__astro.getState().pos.z);await page.locator('#game').click();await page.waitForTimeout(40);assert(await page.evaluate(()=>document.pointerLockElement===document.querySelector('#game')),'pointer lock after click');await page.keyboard.down('z');await page.waitForTimeout(450);await page.keyboard.up('z');const after=await page.evaluate(()=>__astro.getState().pos.z);assert.notEqual(before,after,'AZERTY z / event.code movement changes position');
await page.keyboard.press('Space');await page.waitForTimeout(50);assert((await page.evaluate(()=>__astro.getState().pos.y))>0,'jump rises');
await page.keyboard.press('KeyI');assert(await page.locator('#inventory').evaluate(e=>e.classList.contains('open')),'inventory opens');await page.screenshot({path:'qa/screenshots/inventory-907.png'});await page.locator('#invClose').click();
await page.evaluate(()=>__astro.teleport(-8,-42));await page.waitForTimeout(180);const labelProjection=await page.evaluate(()=>{const mob=__astro.getState().mobs[1],label=document.querySelectorAll('.nameplate')[1].getBoundingClientRect(),canvas=document.querySelector('#game').getBoundingClientRect(),labelCenter={x:label.left+label.width/2,y:label.top+label.height/2},playerCenter={x:canvas.left+canvas.width/2,y:canvas.top+canvas.height/2};return {visible:mob.screen.visible,labelDistance:Math.hypot(labelCenter.x-mob.screen.x,labelCenter.y-mob.screen.y),playerDistance:Math.hypot(labelCenter.x-playerCenter.x,labelCenter.y-playerCenter.y)}});assert(labelProjection.visible,'mob label target is on-screen');assert(labelProjection.labelDistance<80,`mob label tracks its projected position (${labelProjection.labelDistance}px)`);assert(labelProjection.playerDistance>120,`mob label is not attached to player (${labelProjection.playerDistance}px)`);
await page.evaluate(()=>__astro.teleport(-8,-34));await page.locator('#game').click();await page.waitForTimeout(50);await page.mouse.click(450,255);await page.waitForTimeout(180);assert((await page.evaluate(()=>__astro.getState().mobs[0].hp))<36,'sword hit damages mob');await page.screenshot({path:'qa/screenshots/combat-907.png'});const pickBefore=await page.evaluate(()=>{const s=__astro.getState();return {inv:s.inventory.length,gold:s.gold}});await page.evaluate(()=>__astro.killMob(0));await page.keyboard.press('KeyE');await page.waitForTimeout(80);const pickAfter=await page.evaluate(()=>{const s=__astro.getState();return {inv:s.inventory.length,gold:s.gold}});assert(pickAfter.inv>pickBefore.inv||pickAfter.gold>pickBefore.gold,'loot pickup adds item or gold');
await page.evaluate(()=>__astro.teleport(19,-38));await page.waitForTimeout(120);await page.screenshot({path:'qa/screenshots/mob-fight-wolf.png'});
// M2 — dash: distance + i-frames + cooldown
await page.evaluate(()=>__astro.teleport(55,40));await page.waitForFunction(()=>__astro.getState().stamina>=45,{timeout:15000});
const dash=await page.evaluate(()=>{const p=__astro.getState().pos;__astro.castSkill(2);const s=__astro.getState();return {p,ifr:s.iframes,cd:s.cooldowns.dash}});assert(dash.ifr>0,'dash grants i-frames');assert(dash.cd>0,'dash cooldown started');
await page.waitForTimeout(400);const dp=await page.evaluate(()=>__astro.getState().pos);assert(Math.hypot(dp.x-dash.p.x,dp.z-dash.p.z)>=4,`dash moves >=4m (${Math.hypot(dp.x-dash.p.x,dp.z-dash.p.z)})`);
// M2 — war cry buff + whirlwind hits 2 mobs at once (buffed 12*1.5*1.3=23 vs 18 unbuffed)
const pair=await page.evaluate(()=>{const p=__astro.getState().pos,a=__astro.spawnMobAt('Slime',p.x+1.2,p.z+1),b=__astro.spawnMobAt('Slime',p.x-1.2,p.z+1);__astro.castSkill(4);__astro.castSkill(3);const s=__astro.getState();return {a:s.mobs[a].hp,b:s.mobs[b].hp,buff:s.buffs.warcry,cds:s.cooldowns}});
assert(pair.buff>0,'war cry buff active');assert(pair.cds.whirl>0&&pair.cds.cry>0,'whirl/cry cooldowns running');
assert(pair.a<36&&pair.b<36,'whirlwind damages 2 mobs at once');assert(pair.a<=13&&pair.b<=13,`war cry buff increases whirlwind damage (${pair.a},${pair.b})`);
await page.waitForTimeout(60);await page.screenshot({path:'qa/screenshots/combat-907.png'});
// M2 — boss: exists, telegraphs, drops Fang Blade + coins
const boss0=await page.evaluate(()=>__astro.getState().boss);assert(boss0&&boss0.hp===400&&!boss0.dead,'Alpha Wolf boss exists with 400 HP');
await page.evaluate(()=>__astro.teleport(-40,-62));await page.waitForFunction(()=>__astro.getState().boss.telegraph!==null,{timeout:8000});
const tele=await page.evaluate(()=>__astro.getState().boss.telegraph);assert(['lunge','howl'].includes(tele),`boss telegraphs (${tele})`);
const bi=await page.evaluate(()=>{const i=__astro.getState().mobs.findIndex(m=>m.type==='Alpha Wolf');__astro.killMob(i);return i});assert(bi>=0,'boss index found');
const drops=await page.evaluate(()=>__astro.getState().loot);assert(drops.filter(l=>l.id==='fangBlade').length===1,'boss drops Fang Blade');assert(drops.filter(l=>l.id==='coin').length>=5,'boss drops 5 coins');
await page.evaluate(()=>{const f=__astro.getState().loot.find(l=>l.id==='fangBlade');__astro.teleport(f.x,f.z)});for(let i=0;i<6;i++){await page.keyboard.press('KeyE');await page.waitForTimeout(30)}
assert(await page.evaluate(()=>__astro.getState().inventory.includes('fangBlade')),'Fang Blade picked up into inventory');
await page.evaluate(()=>{for(let i=0;i<8;i++)__astro.completeTutorialStep()});assert((await page.evaluate(()=>__astro.getState().tutorialStep))>=8,'tutorial debug steps transition');await page.evaluate(()=>{window.__skipUnloadSave=true;localStorage.setItem('aetherblade.save',JSON.stringify({level:3,xp:12,inventory:['potion'],equipped:'ironSword',tutorialStep:8}))});await page.reload();await page.waitForFunction(()=>window.__astro);assert.equal(await page.evaluate(()=>__astro.getState().level),3,'save/load level');
// M3 — shop: buy decreases gold + adds item; sell grants 40% value
await page.evaluate(()=>{const m=__astro.getState().merchant;__astro.grantGold(100);__astro.teleport(m.x+1.5,m.z)});
const shop0=await page.evaluate(()=>{__astro.openShop();const s=__astro.getState();return {gold:s.gold,inv:s.inventory.length,merchant:s.merchant}});
assert(shop0.merchant&&typeof shop0.merchant.x==='number','merchant position exposed');
assert(await page.locator('#shop').evaluate(e=>e.classList.contains('open')),'shop panel opens');
await page.screenshot({path:'qa/screenshots/shop-907.png'});
await page.locator('#shopBuy .item').first().click();await page.waitForTimeout(50);
const shop1=await page.evaluate(()=>{const s=__astro.getState();return {gold:s.gold,inv:s.inventory.length}});
assert.equal(shop1.gold,shop0.gold-15,'buying potion costs 15g');assert.equal(shop1.inv,shop0.inv+1,'buying potion adds inventory item');
await page.locator('#shopSell .item').last().click();await page.waitForTimeout(50);
const shop2=await page.evaluate(()=>{const s=__astro.getState();return {gold:s.gold,inv:s.inventory.length}});
assert.equal(shop2.gold,shop1.gold+6,'selling potion grants 6g (40%)');assert.equal(shop2.inv,shop1.inv-1,'selling removes inventory item');
await page.keyboard.press('Backspace');assert(!await page.locator('#shop').evaluate(e=>e.classList.contains('open')),'Backspace closes shop');
// M3 — quests: kill tracking, mentor claim, chain advance
await page.evaluate(()=>__astro.setQuest(1));
const q0=await page.evaluate(()=>__astro.getState().quest);assert.equal(q0.id,1,'quest 1 active');assert.equal(q0.target,5,'quest target exposed');
await page.evaluate(()=>{const p=__astro.getState().pos,i=__astro.spawnMobAt('Slime',p.x+2,p.z+2);__astro.killMob(i)});
assert.equal((await page.evaluate(()=>__astro.getState().quest)).progress,1,'quest kill-tracking increments');
await page.evaluate(()=>{for(let k=0;k<4;k++){const p=__astro.getState().pos,i=__astro.spawnMobAt('Slime',p.x+2,p.z+2);__astro.killMob(i)}});
const q1=await page.evaluate(()=>__astro.getState().quest);assert.equal(q1.progress,5,'quest reaches target');assert(q1.done,'quest flagged done');
await page.keyboard.press('Backspace');
const goldPre=await page.evaluate(()=>{const m=__astro.getState().mentor;__astro.teleport(m.x+1,m.z);return __astro.getState().gold});
await page.keyboard.press('KeyE');await page.waitForTimeout(60);
const claim=await page.evaluate(()=>{const s=__astro.getState();return {gold:s.gold,quest:s.quest}});
assert.equal(claim.gold,goldPre+30,'claiming Pest Control at mentor grants 30g');assert.equal(claim.quest.id,2,'quest chain advances to Wolf Pack');
await page.screenshot({path:'qa/screenshots/quest-hud-907.png'});
// M3 — quest state survives reload
await page.reload();await page.waitForFunction(()=>window.__astro);
const persisted=await page.evaluate(()=>{const s=__astro.getState();return {quest:s.quest,gold:s.gold}});
assert.equal(persisted.quest.id,2,'quest id survives reload');assert.equal(persisted.gold,claim.gold,'gold survives reload');
// M4 — Hollow Depths: map swap, cave mobs, golem drop, colossus, exit, persistence
const vale0=await page.evaluate(()=>{const s=__astro.getState();return {map:s.map,visible:s.mobs.filter(m=>m.map==='vale').length,cave:s.mobs.filter(m=>m.map==='cave').length}});
assert.equal(vale0.map,'vale','starts in vale');assert(vale0.cave>=8,`cave mobs pre-spawned (${vale0.cave})`);
const gate=await page.evaluate(()=>{__astro.teleport(30,-85);return __astro.enterCave(false)});
assert.equal(gate,false,'cave entry gated below level 5');
await page.evaluate(()=>__astro.enterCave());await page.waitForFunction(()=>__astro.getState().map==='cave',{timeout:4000});
const caveS=await page.evaluate(()=>{const s=__astro.getState();return {map:s.map,bat:s.mobs.find(m=>m.type==='Cave Bat'),golem:s.mobs.find(m=>m.type==='Crystal Golem'&&!m.dead),caveBoss:s.caveBoss,quest:s.quest}});
assert.equal(caveS.map,'cave','enterCave switches map to cave');
assert(caveS.bat&&caveS.bat.hp===25,`Cave Bat exists with 25 HP (${caveS.bat?.hp})`);
assert(caveS.golem&&caveS.golem.hp===120,`Crystal Golem exists with 120 HP (${caveS.golem?.hp})`);
assert(caveS.caveBoss&&caveS.caveBoss.hp===600&&!caveS.caveBoss.dead,'Deepstone Colossus exists with 600 HP');
await page.evaluate(()=>{const i=__astro.getState().mobs.findIndex(m=>m.type==='Crystal Golem'&&!m.dead);__astro.killMob(i)});
assert((await page.evaluate(()=>__astro.getState().loot)).some(l=>l.id==='crystalShard'),'Crystal Golem drops Crystal Shard');
// M4 quests 6-8 chain: Q6 enter, Q7 golems, Q8 colossus
await page.evaluate(()=>{__astro.setQuest(7);for(let k=0;k<2;k++){const i=__astro.getState().mobs.findIndex(m=>m.type==='Crystal Golem'&&!m.dead);if(i>=0)__astro.killMob(i);else{const j=__astro.spawnMobAt('Crystal Golem',__astro.getState().pos.x+3,__astro.getState().pos.z+3);__astro.killMob(j)}}});
assert((await page.evaluate(()=>__astro.getState().quest)).done,'Crystal Hunter quest completes on 2 golem kills');
// colossus telegraph appears when close
await page.waitForTimeout(2100);// let quest-complete toast fade before boss beauty shot
await page.evaluate(()=>{const s=__astro.getState();__astro.teleport(0,-33)});
await page.waitForFunction(()=>__astro.getState().caveBoss.telegraph!==null,{timeout:8000});
const cb=await page.evaluate(()=>{const s=__astro.getState();return {tele:s.caveBoss.telegraph,fields:s.telegraphs}});
assert(['smash','throw'].includes(cb.tele),`colossus telegraphs (${cb.tele})`);assert(cb.fields>=1,'telegraph field mesh present');
const bossScreen=await page.evaluate(()=>__astro.getState().mobs.find(m=>m.type==='Deepstone Colossus').screen);
await page.screenshot({path:'qa/screenshots/cave-boss-907.png'});
// boss visibility: sample mean luminance in a 60px box around the boss's projected screen position
const shotB64=(await page.screenshot()).toString('base64');
const lum=await page.evaluate(async ({b64,sx,sy})=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(Math.max(0,sx-30),Math.max(0,sy-10),60,80).data;let s=0;for(let i=0;i<d.length;i+=4)s+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];return s/(d.length/4)},{b64:shotB64,sx:Math.round(bossScreen.x),sy:Math.round(bossScreen.y)});
assert(bossScreen.visible,'colossus is on-screen in boss shot');assert(lum>28,`colossus region luminance readable (${lum.toFixed(1)})`);
console.log(`boss-shot luminance @(${Math.round(bossScreen.x)},${Math.round(bossScreen.y)}) = ${lum.toFixed(1)}`);
// colossus kill: 300 XP path, Colossus Core + Runic Greatsword drops, endgame modal
await page.evaluate(()=>{__astro.setQuest(8);const i=__astro.getState().mobs.findIndex(m=>m.type==='Deepstone Colossus');__astro.killMob(i)});
const post=await page.evaluate(()=>{const s=__astro.getState();return {dead:s.caveBoss.dead,loot:s.loot.map(l=>l.id),quest:s.quest}});
assert(post.dead,'colossus dies via debug kill');assert(post.loot.includes('colossusCore'),'drops Colossus Core');assert(post.loot.includes('runicSword'),'drops Runic Greatsword');assert(post.quest.done,'The Colossus quest flagged done');
await page.waitForFunction(()=>document.querySelector('#endgame').classList.contains('open'),{timeout:5000});
await page.evaluate(()=>document.querySelector('#endgameClose').click());
// save/reload inside cave restores cave
await page.reload();await page.waitForFunction(()=>window.__astro);
assert.equal(await page.evaluate(()=>__astro.getState().map),'cave','reload inside cave restores map=cave');
await page.evaluate(()=>__astro.teleport(4,32));await page.waitForTimeout(900);
await page.screenshot({path:'qa/screenshots/cave-907.png'});
// exitCave returns to vale near entrance
await page.evaluate(()=>__astro.exitCave());await page.waitForFunction(()=>__astro.getState().map==='vale',{timeout:4000});
const back=await page.evaluate(()=>__astro.getState().pos);
assert(Math.hypot(back.x-32,back.z+81)<8,`exitCave returns near entrance (${back.x.toFixed(1)},${back.z.toFixed(1)})`);
const pixels=await page.screenshot();assert(pixels.length>1000,'canvas screenshot non-empty');assert.equal(errors.length,0,`console errors: ${errors}`);await page.screenshot({path:'qa/screenshots/e2e-907.png'});

// ================= M5 — SDK monetization, controls, collisions, resilience =================
// Fresh page with a stubbed CrazyGames SDK injected BEFORE the bundle, with call counters.
const p5=await browser.newPage({viewport:{width:907,height:510}});const errors5=[];
p5.on('console',m=>{if(m.type()==='error')errors5.push(m.text())});p5.on('pageerror',e=>errors5.push(e.message));
await p5.route('**/sdk.crazygames.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:'/* stubbed by e2e */'}));
await p5.addInitScript(()=>{
  window.__cg={midgame:0,rewarded:0,gpStart:0,gpStop:0,loadStart:0,loadStop:0,happy:0};
  const store={};
  window.CrazyGames={SDK:{
    init:()=>Promise.resolve(),
    game:{gameplayStart:()=>window.__cg.gpStart++,gameplayStop:()=>window.__cg.gpStop++,loadingStart:()=>window.__cg.loadStart++,loadingStop:()=>window.__cg.loadStop++,happytime:()=>window.__cg.happy++,settings:{muteAudio:false},addSettingsChangeListener:fn=>{window.__cgSettingsCb=fn}},
    ad:{requestAd:(type,cbs)=>{window.__cg[type]=(window.__cg[type]||0)+1;cbs.adStarted();cbs.adFinished()}},
    data:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=v}},
  }};
});
await p5.goto('http://localhost:8701/?debug=1&capture=1');
await p5.waitForFunction(()=>window.__astro,{timeout:8000});
await p5.waitForFunction(()=>__astro.getState().characterClips.knight?.length>0,{timeout:8000});
// loading order: SDK init ran, loadingStart before loadingStop, both fired once
const loadC=await p5.evaluate(()=>window.__cg);
assert.equal(loadC.loadStart,1,'loadingStart called once after initSDK');assert.equal(loadC.loadStop,1,'loadingStop called when world ready');
// -- BUGFIX 1: mouse-look direction — positive movementX increases yaw (orbits right)
await p5.locator('#game').click();await p5.waitForTimeout(120);
assert(await p5.evaluate(()=>document.pointerLockElement===document.querySelector('#game')),'pointer lock acquired (stub page)');
const yaw0=await p5.evaluate(()=>__astro.getYaw());
await p5.evaluate(()=>document.dispatchEvent(new MouseEvent('mousemove',{movementX:120,movementY:0})));
const yaw1=await p5.evaluate(()=>__astro.getYaw());
assert(yaw1>yaw0,`mouse right increases yaw (${yaw0}->${yaw1})`);
// gameplayStart fired on pointer lock
await p5.waitForFunction(()=>window.__cg.gpStart>=1,{timeout:4000});
// -- BUGFIX 2: W moves in camera-forward direction
await p5.evaluate(()=>__astro.teleport(55,40));await p5.waitForTimeout(60);
const wTest=await p5.evaluate(()=>({pos:{...__astro.getState().pos},yaw:__astro.getYaw()}));
await p5.keyboard.down('KeyW');await p5.waitForTimeout(400);await p5.keyboard.up('KeyW');
const wPos=await p5.evaluate(()=>__astro.getState().pos);
{const fx=-Math.sin(wTest.yaw),fz=Math.cos(wTest.yaw),dx=wPos.x-wTest.pos.x,dz=wPos.z-wTest.pos.z,dot=dx*fx+dz*fz,len=Math.hypot(dx,dz);
 assert(len>1.5,`W moved player (${len.toFixed(2)}m)`);assert(dot/len>.85,`W moves camera-forward (cos=${(dot/len).toFixed(2)})`)}
// deterministic speed check: 1 sim-second of fixed-dt steps with W held => ~6.9m
await p5.evaluate(()=>__astro.teleport(55,40));await p5.keyboard.down('KeyW');
const simDist=await p5.evaluate(()=>{const a={...__astro.getState().pos};__astro.soak(1);const b=__astro.getState().pos;return Math.hypot(b.x-a.x,b.z-a.z)});
await p5.keyboard.up('KeyW');
assert(simDist>6&&simDist<8,`base run speed ~6.9 m/s (${simDist.toFixed(2)})`);
// -- BUGFIX 4: collision — player cannot walk through a cabin (cabin at 10,1, r=3.6)
await p5.evaluate(()=>{__astro.teleport(10,-4)});await p5.waitForTimeout(60);
// face the cabin: set yaw so forward = +z (yaw=0 gives forward (0,0,1))
await p5.evaluate(()=>{const y=__astro.getYaw();document.dispatchEvent(new MouseEvent('mousemove',{movementX:-y/.0025,movementY:0}))});
await p5.keyboard.down('KeyW');await p5.waitForTimeout(1000);await p5.keyboard.up('KeyW');
const colPos=await p5.evaluate(()=>__astro.getState().pos);
assert(colPos.z<-2.4,`cabin blocks player (z=${colPos.z.toFixed(2)}, wall face ~-3.1)`);
assert((await p5.evaluate(()=>__astro.colliderCount())).vale>300,'static colliders registered');
// -- knight front screenshot (spin camera 180° to face the knight)
await p5.evaluate(()=>{document.dispatchEvent(new MouseEvent('mousemove',{movementX:Math.PI/.0025,movementY:0}))});
await p5.waitForTimeout(600);await p5.screenshot({path:'qa/screenshots/knight-front.png'});
// -- Rewarded revive: death opens the Second Breath modal
await p5.evaluate(()=>__astro.forceGameOver());
assert(await p5.locator('#revive').evaluate(e=>e.classList.contains('open')),'revive modal opens on death');
await p5.screenshot({path:'qa/screenshots/revive-modal-907.png'});
// declining respawns at the campfire and requests a midgame ad
const declined=await p5.evaluate(()=>{document.querySelector('#reviveDecline').click();const s=__astro.getState();return {pos:s.pos,hp:s.hp,maxHp:s.maxHp,mid:window.__cg.midgame,map:s.map}});
assert(!(await p5.locator('#revive').evaluate(e=>e.classList.contains('open'))),'revive modal closes on decline');
assert(Math.hypot(declined.pos.x-0,declined.pos.z-16)<3,`declining respawns at campfire (${declined.pos.x.toFixed(1)},${declined.pos.z.toFixed(1)})`);
assert.equal(declined.hp,declined.maxHp,'campfire respawn restores full HP');
assert.equal(declined.mid,1,'midgame ad requested on death respawn');
// -- Midgame throttle: a second quick death does NOT request another midgame ad
await p5.evaluate(()=>{__astro.forceGameOver();document.querySelector('#reviveDecline').click()});
assert.equal(await p5.evaluate(()=>window.__cg.midgame),1,'midgame throttled to 1 per 90s across two quick deaths');
// -- Accepting the revive: rewarded ad, revive on the spot with 50% HP
await p5.evaluate(()=>{__astro.teleport(30,-40);__astro.forceGameOver()});
const revived=await p5.evaluate(async()=>{document.querySelector('#reviveWatch').click();await new Promise(r=>setTimeout(r,80));const s=__astro.getState();return {pos:s.pos,hp:s.hp,maxHp:s.maxHp,rew:window.__cg.rewarded}});
assert.equal(revived.rew,1,'rewarded ad requested for Second Breath');
assert.equal(revived.hp,Math.ceil(revived.maxHp*.5),`revive grants 50% HP (${revived.hp}/${revived.maxHp})`);
assert(Math.hypot(revived.pos.x-30,revived.pos.z+40)<3,'revive keeps player on the spot');
// -- Shop rewarded ad: +25 gold, throttled 1/120s
const shopAd=await p5.evaluate(async()=>{__astro.openShop();const g0=__astro.getState().gold;document.querySelector('#shopAdBtn').click();await new Promise(r=>setTimeout(r,80));const g1=__astro.getState().gold;document.querySelector('#shopAdBtn').click();await new Promise(r=>setTimeout(r,80));return {g0,g1,g2:__astro.getState().gold,rew:window.__cg.rewarded}});
assert.equal(shopAd.g1,shopAd.g0+25,'shop rewarded ad grants +25 gold');
assert.equal(shopAd.g2,shopAd.g1,'shop ad throttled (second click no gold)');
assert.equal(shopAd.rew,2,'exactly one extra rewarded request from shop');
await p5.keyboard.press('Backspace');
// -- Mute setting propagates via SDK settings listener
const muted=await p5.evaluate(()=>{window.__cgSettingsCb({muteAudio:true});return __astro.audioState()});
assert(muted.sdkMuted&&muted.muted,'SDK muteAudio=true propagates to audio');
const unmuted=await p5.evaluate(()=>{window.__cgSettingsCb({muteAudio:false});return __astro.audioState()});
assert(!unmuted.muted,'SDK muteAudio=false unmutes');
// audio-scape state exposed
const aState=await p5.evaluate(()=>__astro.audioState());
assert.equal(aState.ambient,'vale',`ambient layer tracks map (${aState.ambient})`);assert(aState.started,'audio scape started after pointer lock');
// -- gameplayStop on pointer lock loss
const gpBefore=await p5.evaluate(()=>window.__cg.gpStop);
await p5.evaluate(()=>__astro.simulatePointerLockLoss());await p5.waitForTimeout(1300);
assert((await p5.evaluate(()=>window.__cg.gpStop))>gpBefore,'gameplayStop fires on pointer lock loss');
// drain any deferred (1.1s-throttled) gameplay calls so the panel check below is clean
let gpDrain=await p5.evaluate(()=>window.__cg.gpStop+window.__cg.gpStart),stable=0;
for(let i=0;i<20&&stable<2;i++){await p5.waitForTimeout(700);const now=await p5.evaluate(()=>window.__cg.gpStop+window.__cg.gpStart);if(now===gpDrain)stable++;else{stable=0;gpDrain=now}}
// panels do NOT stop gameplay: open shop+inventory, gpStop unchanged
const gpStop0=await p5.evaluate(()=>window.__cg.gpStop);
await p5.evaluate(()=>{__astro.openShop()});await p5.keyboard.press('Backspace');await p5.keyboard.press('KeyI');await p5.keyboard.press('KeyI');await p5.waitForTimeout(1500);
assert.equal(await p5.evaluate(()=>window.__cg.gpStop),gpStop0,'shop/inventory panels do not call gameplayStop');
// -- visibilitychange pauses the simulation
const paused=await p5.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));return __astro.paused()});
assert(paused,'document.hidden pauses simulation');
const resumed=await p5.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));return __astro.paused()});
assert(!resumed,'simulation resumes on visible');
// -- autosave persists after reload (save-on-hide + explicit save path)
await p5.evaluate(()=>{__astro.grantGold(777);__astro.save()});
await p5.reload();await p5.waitForFunction(()=>window.__astro);
assert((await p5.evaluate(()=>__astro.getState().gold))>=777,'autosaved gold persists after reload');
assert.equal(errors5.length,0,`M5 console errors: ${errors5}`);
await p5.close();

// ================= M5 — touch HUD (mobile emulation 390x844) =================
const tctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'});
const tp=await tctx.newPage();const tErrors=[];
tp.on('console',m=>{if(m.type()==='error')tErrors.push(m.text())});tp.on('pageerror',e=>tErrors.push(e.message));
await tp.goto('http://localhost:8701/?debug=1&capture=1');
await tp.waitForFunction(()=>window.__astro,{timeout:8000});
await tp.touchscreen.tap(100,600);await tp.waitForTimeout(150);
assert(await tp.evaluate(()=>__astro.touchActive()),'touch input activates touch mode');
assert(await tp.locator('#touchui').evaluate(e=>getComputedStyle(e).display!=='none'),'touch HUD visible');
for(const id of ['tbAttack','tbJump','tbDash','tbPotion']){const box=await tp.locator('#'+id).boundingBox();assert(box.width>=56&&box.height>=56,`${id} hit area >=56px (${box.width})`)}
assert((await tp.evaluate(()=>document.querySelector('#quest').textContent)).includes('joystick'),'tutorial shows touch hints');
assert.equal(await tp.evaluate(()=>getComputedStyle(document.body).userSelect),'none','user-select:none present');
// virtual joystick drag on left half moves the player
const tPos0=await tp.evaluate(()=>({...__astro.getState().pos}));
await tp.evaluate(async()=>{const c=document.querySelector('#game');const mk=(type,x,y)=>{c.dispatchEvent(new TouchEvent(type,{touches:type==='touchend'?[]:[new Touch({identifier:1,target:c,clientX:x,clientY:y})],changedTouches:[new Touch({identifier:1,target:c,clientX:x,clientY:y})],bubbles:true,cancelable:true}))};mk('touchstart',100,600);mk('touchmove',100,552);await new Promise(r=>setTimeout(r,700));mk('touchend',100,552)});
const tPos1=await tp.evaluate(()=>__astro.getState().pos);
assert(Math.hypot(tPos1.x-tPos0.x,tPos1.z-tPos0.z)>1,'virtual joystick moves the player');
await tp.waitForTimeout(250);await tp.screenshot({path:'qa/screenshots/touch-hud.png'});
assert.equal(tErrors.length,0,`touch console errors: ${tErrors}`);
await tctx.close();
console.log('M5 monetization/touch/resilience assertions passed');

await browser.close();await new Promise(r=>s.close(r));console.log('e2e passed');
