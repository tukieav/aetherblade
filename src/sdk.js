let sdk=null; export async function initSDK(){try{if(window.CrazyGames?.SDK){await Promise.race([window.CrazyGames.SDK.init(),new Promise((_,r)=>setTimeout(r,3000))]);sdk=window.CrazyGames.SDK;}}catch{} return !!sdk}
export const saveData=(k,v)=>{try{sdk?.data.setItem(k,v)}catch{} try{localStorage.setItem(k,v)}catch{}};
export const loadData=k=>{try{return sdk?.data.getItem(k)||localStorage.getItem(k)}catch{return null}};
export const happytime=()=>{try{sdk?.game.happytime()}catch{}};
let lastGameplay=0; export const gameplayStart=()=>{const now=Date.now();if(now-lastGameplay<1100)return;lastGameplay=now;try{sdk?.game.gameplayStart()}catch{}}; export const getMuteSetting=()=>{try{return !!sdk?.game.settings.muteAudio}catch{return false}};
