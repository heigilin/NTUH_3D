const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');global.window={devicePixelRatio:1};
for(const f of ['rooms-data','ward-3d-layout-data','ward-bed-ids'])require(path.join(root,'js/data',f+'.js'));
require(path.join(root,'js/ward-plan-layout.js'));
require(path.join(root,'js/ward-plan-2d.js'));
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
for (const ward of ['11C','11B']) {
  const out=['<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="850" viewBox="0 0 1800 850">'];
  let state={a:1,d:1,e:0,f:0,fillStyle:'#000',strokeStyle:'#000',lineWidth:1,font:'20px sans-serif',textAlign:'center'},stack=[],points=[];
  const transform=()=>`matrix(${state.a} 0 0 ${state.d} ${state.e} ${state.f})`;
  const rect=(x,y,w,h,stroke)=>out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" transform="${transform()}" fill="${stroke?'none':state.fillStyle}" stroke="${stroke?state.strokeStyle:'none'}" stroke-width="${state.lineWidth}"/>`);
  const api={setTransform(a,b,c,d,e,f){Object.assign(state,{a,d,e,f});},clearRect(){},save(){stack.push({...state});},restore(){state=stack.pop();},translate(x,y){state.e+=x*state.a;state.f+=y*state.d;},scale(x,y){state.a*=x;state.d*=y;},fillRect(x,y,w,h){rect(x,y,w,h,false);},strokeRect(x,y,w,h){rect(x,y,w,h,true);},beginPath(){points=[];},moveTo(x,y){points.push(`M ${x} ${y}`);},lineTo(x,y){points.push(`L ${x} ${y}`);},stroke(){out.push(`<path d="${points.join(' ')}" transform="${transform()}" fill="none" stroke="${state.strokeStyle}" stroke-width="${state.lineWidth}"/>`);},fillText(t,x,y){const size=(state.font.match(/([\d.]+)px/)||[])[1]||20;out.push(`<text x="${x}" y="${y}" transform="${transform()}" fill="${state.fillStyle}" font-family="Microsoft JhengHei, sans-serif" font-size="${size}" font-weight="600" dominant-baseline="central" text-anchor="${{center:'middle',left:'start',right:'end'}[state.textAlign]||'middle'}">${escape(t)}</text>`);}};
  const ctx=new Proxy(api,{set(o,k,v){state[k]=v;return true;},get(o,k){return o[k]??state[k];}});
  api.measureText=t=>({width:[...String(t)].reduce((sum,ch)=>sum+(/[\x00-\x7f]/.test(ch)?0.58:1),0)*Number((state.font.match(/([\d.]+)px/)||[])[1]||20)});
  api.rect=()=>{};api.clip=()=>{};
  window.WardPlan2D.render({wardCtx:ctx,wardCanvas:{width:1800,height:850},wardActiveBuildingId:'E01_MAIN',wardActiveFloor:'11F',wardActiveWard:ward,wardPan:{x:0,y:0},wardZoom:1,wardHistory:[],wardModal:null});
  out.push('</svg>');fs.writeFileSync(path.join(root,`floorplans/${ward}_2D重繪.svg`),out.join('\n'));
  fs.copyFileSync(path.join(root,`floorplans/${ward}_2D重繪.svg`),path.join('D:/Users/006340/Documents/ChatGPT/平面圖',`${ward}_2D重繪.svg`));
}
console.log('SVG exports complete');
