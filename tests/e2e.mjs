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
await page.evaluate(()=>__astro.teleport(-8,-34));await page.locator('#game').click();await page.waitForTimeout(50);await page.mouse.click(450,255);await page.waitForTimeout(180);assert((await page.evaluate(()=>__astro.getState().mobs[0].hp))<36,'sword hit damages mob');await page.screenshot({path:'qa/screenshots/combat-907.png'});const itemCount=await page.evaluate(()=>__astro.getState().inventory.length);await page.evaluate(()=>__astro.killMob(0));await page.keyboard.press('KeyE');await page.waitForTimeout(80);assert((await page.evaluate(()=>__astro.getState().inventory.length))>itemCount,'loot pickup');
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
await page.evaluate(()=>{for(let i=0;i<8;i++)__astro.completeTutorialStep()});assert((await page.evaluate(()=>__astro.getState().tutorialStep))>=8,'tutorial debug steps transition');await page.evaluate(()=>localStorage.setItem('aetherblade.save',JSON.stringify({level:3,xp:12,inventory:['potion'],equipped:'ironSword',tutorialStep:8})));await page.reload();await page.waitForFunction(()=>window.__astro);assert.equal(await page.evaluate(()=>__astro.getState().level),3,'save/load level');
const pixels=await page.screenshot();assert(pixels.length>1000,'canvas screenshot non-empty');assert.equal(errors.length,0,`console errors: ${errors}`);await page.screenshot({path:'qa/screenshots/e2e-907.png'});await browser.close();await new Promise(r=>s.close(r));console.log('e2e passed');
