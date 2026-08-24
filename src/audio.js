// audio.js — full WebAudio synth soundscape (no files): sfx, ambient layers, generative music.
let ctx=null,master=null,sfxBus=null,valeG=null,caveG=null,musBus=null;
let userMuted=false,sdkMuted=false,started=false,curMap='vale',heartbeatOn=false,hbTimer=null;

function ensure(){
  if(ctx)return true;
  try{
    ctx=new (window.AudioContext||window.webkitAudioContext)();
    master=gain(1,ctx.destination);
    sfxBus=gain(.9,master);
    valeG=gain(0,master);caveG=gain(0,master);
    musBus=gain(0,master);
    applyMute();
  }catch{ctx=null;return false}
  return true;
}
function gain(v,dest){const n=ctx.createGain();n.gain.value=v;n.connect(dest);return n}
function applyMute(){if(master&&ctx)master.gain.setTargetAtTime((userMuted||sdkMuted)?0:1,ctx.currentTime,.04)}
export function setUserMuted(m){userMuted=!!m;applyMute()}
export function setSdkMuted(m){sdkMuted=!!m;applyMute()}
export function toggleMute(){setUserMuted(!userMuted);return userMuted}
export function isMuted(){return userMuted||sdkMuted}
export function getState(){return{muted:isMuted(),userMuted,sdkMuted,ambient:curMap,started,running:!!ctx&&ctx.state==='running',heartbeat:heartbeatOn}}
export function pauseAll(){try{if(ctx&&ctx.state==='running')ctx.suspend()}catch{}}
export function resumeAll(){try{if(ctx&&ctx.state==='suspended')ctx.resume()}catch{}}

let noiseBuf=null;
function noise(){if(!noiseBuf){noiseBuf=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}const s=ctx.createBufferSource();s.buffer=noiseBuf;s.loop=true;return s}
function env(dest,peak,t0,a,d){const g=ctx.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(peak,t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+a+d);g.connect(dest);return g}
function tone(type,freq,dest,peak,a,d,slideTo=null){const t0=ctx.currentTime,o=ctx.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,t0);if(slideTo)o.frequency.exponentialRampToValueAtTime(slideTo,t0+a+d);o.connect(env(dest,peak,t0,a,d));o.start(t0);o.stop(t0+a+d+.05);return o}

// ---- SFX: distinct voice per skill/event ----
export function sfx(kind){
  if(!ensure())return;
  const t0=ctx.currentTime;
  switch(kind){
    case 'attack':tone('square',210,sfxBus,.04,.005,.1,150);break;
    case 'hit':tone('square',130,sfxBus,.045,.005,.11,70);break;
    case 'whoosh':{ // dash: filtered noise sweep
      const s=noise(),f=ctx.createBiquadFilter();f.type='bandpass';f.Q.value=1.4;
      f.frequency.setValueAtTime(400,t0);f.frequency.exponentialRampToValueAtTime(2600,t0+.22);
      s.connect(f).connect(env(sfxBus,.07,t0,.02,.24));s.start(t0);s.stop(t0+.3);break}
    case 'spin':tone('sawtooth',240,sfxBus,.035,.03,.4,520);tone('sine',480,sfxBus,.02,.05,.35,760);break; // whirlwind rising saw
    case 'cry':{tone('square',150,sfxBus,.05,.05,.45,95);tone('square',152,sfxBus,.04,.05,.45,97);break} // war cry: beating low squares
    case 'telegraph':{tone('triangle',880,sfxBus,.035,.01,.16,660);setTimeout(()=>{try{tone('triangle',660,sfxBus,.035,.01,.2,440)}catch{}},170);break}
    case 'level':tone('sine',660,sfxBus,.04,.01,.14);tone('sine',880,sfxBus,.03,.08,.18);break;
    case 'start':tone('sine',330,sfxBus,.04,.01,.14);break;
    default:tone('sine',330,sfxBus,.03,.01,.12);
  }
}

// ---- low-HP heartbeat ----
function thump(){if(!ctx||(userMuted||sdkMuted))return;tone('sine',58,sfxBus,.11,.008,.13,40);setTimeout(()=>{try{tone('sine',52,sfxBus,.08,.008,.12,38)}catch{}},180)}
export function setHeartbeat(on){
  on=!!on;if(on===heartbeatOn)return;heartbeatOn=on;
  if(on){if(!ensure())return;thump();hbTimer=setInterval(thump,850)}
  else if(hbTimer){clearInterval(hbTimer);hbTimer=null}
}

// ---- ambient layers ----
function buildVale(){
  const wind=noise(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=340;lp.Q.value=.6;
  const wg=gain(.05,valeG);wind.connect(lp).connect(wg);wind.start();
  const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.07;lg.gain.value=160;lfo.connect(lg).connect(lp.frequency);lfo.start();
  const lfo2=ctx.createOscillator(),lg2=ctx.createGain();lfo2.frequency.value=.05;lg2.gain.value=.02;lfo2.connect(lg2).connect(wg.gain);lfo2.start();
  const chirp=()=>{ // occasional bird: 2-4 quick descending blips
    if(curMap==='vale'&&ctx.state==='running'){const n=2+Math.floor(Math.random()*3),base=2300+Math.random()*900;
      for(let i=0;i<n;i++)setTimeout(()=>{try{tone('sine',base+Math.random()*300,valeG,.016,.008,.07,base*.72)}catch{}},i*(90+Math.random()*60))}
    setTimeout(chirp,3500+Math.random()*6000)};
  setTimeout(chirp,1500);
}
function buildCave(){
  // low drone: two detuned sines
  for(const f of [55,57.3]){const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;o.connect(gain(.032,caveG));o.start()}
  const o3=ctx.createOscillator();o3.type='triangle';o3.frequency.value=110.5;o3.connect(gain(.012,caveG));o3.start();
  const drip=()=>{ // water drips: fast pitch-drop sine plings
    if(curMap==='cave'&&ctx.state==='running'){try{tone('sine',900+Math.random()*600,caveG,.03,.004,.16,220)}catch{}}
    setTimeout(drip,1400+Math.random()*3200)};
  setTimeout(drip,900);
  const rumble=()=>{ // distant rumble: lowpassed noise swell
    if(curMap==='cave'&&ctx.state==='running'){try{
      const s=noise(),f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=75;
      const t0=ctx.currentTime,g=ctx.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(.09,t0+1.1);g.gain.linearRampToValueAtTime(.0001,t0+2.6);
      s.connect(f).connect(g).connect(caveG);s.start(t0);s.stop(t0+2.7)}catch{}}
    setTimeout(rumble,9000+Math.random()*9000)};
  setTimeout(rumble,4000);
}

// ---- generative music: 2 alternating chord pads + soft arpeggio ----
const SCALES={ // frequencies (Hz)
  vale:{scale:[220,246.9,277.2,329.6,370,440,493.9,554.4],chords:[[220,277.2,329.6],[164.8,246.9,329.6]]}, // A major pentatonic
  cave:{scale:[110,130.8,146.8,164.8,196,220,261.6,293.7],chords:[[110,130.8,164.8],[98,146.8,196]]},      // A minor
};
let bar=0;
function playBar(){
  if(ctx.state!=='running'){return}
  const sc=SCALES[curMap]||SCALES.vale,t0=ctx.currentTime,chord=sc.chords[bar%2];bar++;
  for(const f of chord){ // soft pad: slow attack triangle
    const o=ctx.createOscillator();o.type='triangle';o.frequency.value=f;
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t0);g.gain.linearRampToValueAtTime(.014,t0+1.1);g.gain.linearRampToValueAtTime(.0001,t0+3.4);
    o.connect(g).connect(musBus);o.start(t0);o.stop(t0+3.5);
  }
  for(let i=0;i<4;i++){ // gentle arpeggio
    const f=sc.scale[Math.floor(Math.random()*sc.scale.length)]*2,ts=t0+.2+i*.8;
    const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,ts);g.gain.linearRampToValueAtTime(.011,ts+.04);g.gain.exponentialRampToValueAtTime(.0001,ts+.7);
    o.connect(g).connect(musBus);o.start(ts);o.stop(ts+.8);
  }
}

export function setScape(map){
  curMap=map;
  if(!ctx||!started)return;
  const t=ctx.currentTime; // crossfade ambient layers
  valeG.gain.setTargetAtTime(map==='vale'?1:0,t,.7);
  caveG.gain.setTargetAtTime(map==='cave'?1:0,t,.7);
}
export function startScape(map){
  if(!ensure())return;
  resumeAll();
  if(started){setScape(map);return}
  started=true;
  buildVale();buildCave();
  musBus.gain.setTargetAtTime(.85,ctx.currentTime,2);
  setScape(map);
  playBar();setInterval(playBar,3200);
}
