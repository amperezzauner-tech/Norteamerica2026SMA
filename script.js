'use strict';

let PRED=null, RES=null, PARTICIPANTES=[], MATCHES=[], PLAYED=[], PENDING=[], RANKING=[];
let currentTab='inicio', currentProfile=null;

const FLAGS={
 'México':'🇲🇽','Sudáfrica':'🇿🇦','Corea del Sur':'🇰🇷','Chequia':'🇨🇿','Canadá':'🇨🇦','Bosnia':'🇧🇦','Qatar':'🇶🇦','Suiza':'🇨🇭','Haití':'🇭🇹','Escocia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Brasil':'🇧🇷','Marruecos':'🇲🇦','EE.UU.':'🇺🇸','Paraguay':'🇵🇾','Australia':'🇦🇺','Turquía':'🇹🇷','C. de Marfil':'🇨🇮','Ecuador':'🇪🇨','Alemania':'🇩🇪','Curazao':'🇨🇼','P. Bajos':'🇳🇱','Japón':'🇯🇵','Suecia':'🇸🇪','Túnez':'🇹🇳','Egipto':'🇪🇬','Irán':'🇮🇷','Bélgica':'🇧🇪','N. Zelanda':'🇳🇿','España':'🇪🇸','Uruguay':'🇺🇾','Cabo Verde':'🇨🇻','Arabia Saudita':'🇸🇦','Francia':'🇫🇷','Noruega':'🇳🇴','Senegal':'🇸🇳','Irak':'🇮🇶','Argentina':'🇦🇷','Austria':'🇦🇹','Argelia':'🇩🇿','Jordania':'🇯🇴','Colombia':'🇨🇴','Portugal':'🇵🇹','Congo':'🇨🇩','Uzbekistán':'🇺🇿','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Ghana':'🇬🇭','Croacia':'🇭🇷','Panamá':'🇵🇦'
};
const GROUP_BONUS=[4,3,1,1];
const R32_BONUS=2;
const R16_BONUS=2;
const KO_PHASES={
 '16avos':['p073','p074','p075','p076','p077','p078','p079','p080','p081','p082','p083','p084','p085','p086','p087','p088'],
 '8vos':['p089','p090','p091','p092','p093','p094','p095','p096'],
 'Cuartos':['p097','p098','p099','p100'],
 'Semis':['p101','p102'],
 'Final':['p103','p104']
};
const R16_SLOTS=[
 {r32a:'p073',r32b:'p074',r16:'p089'}, {r32a:'p075',r32b:'p076',r16:'p090'},
 {r32a:'p077',r32b:'p078',r16:'p091'}, {r32a:'p079',r32b:'p080',r16:'p092'},
 {r32a:'p081',r32b:'p082',r16:'p093'}, {r32a:'p083',r32b:'p084',r16:'p094'},
 {r32a:'p085',r32b:'p086',r16:'p095'}, {r32a:'p087',r32b:'p088',r16:'p096'}
];
const R32_SLOTS=[
 {id:'R32-1',a:{group:'A',pos:2},b:{group:'B',pos:2}}, {id:'R32-2',a:{group:'C',pos:1},b:{group:'F',pos:2}},
 {id:'R32-3',a:{group:'E',pos:1},b:{third:['A','B','C','D','F']}}, {id:'R32-4',a:{group:'F',pos:1},b:{group:'C',pos:2}},
 {id:'R32-5',a:{group:'E',pos:2},b:{group:'I',pos:2}}, {id:'R32-6',a:{group:'I',pos:1},b:{third:['C','D','F','G','H']}},
 {id:'R32-7',a:{group:'A',pos:1},b:{third:['C','E','F','H','I']}}, {id:'R32-8',a:{group:'L',pos:1},b:{third:['E','H','I','J','K']}},
 {id:'R32-9',a:{group:'G',pos:1},b:{third:['A','E','H','I','J']}}, {id:'R32-10',a:{group:'D',pos:1},b:{third:['B','E','F','I','J']}},
 {id:'R32-11',a:{group:'H',pos:1},b:{group:'J',pos:2}}, {id:'R32-12',a:{group:'K',pos:2},b:{group:'L',pos:2}},
 {id:'R32-13',a:{group:'B',pos:1},b:{third:['E','F','G','I','J']}}, {id:'R32-14',a:{group:'D',pos:2},b:{group:'G',pos:2}},
 {id:'R32-15',a:{group:'J',pos:1},b:{group:'H',pos:2}}, {id:'R32-16',a:{group:'K',pos:1},b:{third:['D','E','I','J','L']}}
];

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const teamKey=s=>norm(s).replace(/[^a-z0-9]/g,'');
const sameTeam=(a,b)=>teamKey(a)===teamKey(b);
const pairKey=(a,b)=>[teamKey(a),teamKey(b)].sort().join('::');
const flag=t=>FLAGS[t]||'🏳️';
const medal=i=>i===1?'🥇':i===2?'🥈':i===3?'🥉':'#'+i;
const pct=(n,d)=>Math.round((n/(d||1))*100);
function outcome(a,b){return +a>+b?'L':+a<+b?'V':'E'}
function isScoreable(m){return (m.estado==='finalizado'||m.estado==='en_vivo')&&m.golesLocal!=null&&m.golesVisitante!=null}
function isFinal(m){return m.estado==='finalizado'&&m.golesLocal!=null&&m.golesVisitante!=null}
function isLive(m){return m.estado==='en_vivo'}
function points(ph,pa,rh,ra){ph=+ph;pa=+pa;rh=+rh;ra=+ra;if(ph===rh&&pa===ra)return 5+rh+ra;const ok=outcome(ph,pa)===outcome(rh,ra);const bonus=(ph===rh&&rh>0)?rh:((pa===ra&&ra>0)?ra:0);return ok?3+bonus:bonus}
function scoreText(m){return isScoreable(m)?`${m.golesLocal} - ${m.golesVisitante}`:'vs'}
function stateText(m){return isLive(m)?'EN VIVO':(isFinal(m)?'FINAL':'PENDIENTE')}
function matchById(id){return MATCHES.find(m=>m.id===id)}

async function loadData(){
 try{
  const [p,r]=await Promise.all([
   fetch('predicciones.json?ts='+Date.now(),{cache:'no-store'}).then(x=>{if(!x.ok)throw new Error('No cargó predicciones.json');return x.json()}),
   fetch('resultados.json?ts='+Date.now(),{cache:'no-store'}).then(x=>{if(!x.ok)throw new Error('No cargó resultados.json');return x.json()})
  ]);
  PRED=p; RES=r; PARTICIPANTES=(p.participantes||[]).filter(Boolean); MATCHES=(r.partidos||[]).map(m=>({...m}));
  PLAYED=MATCHES.filter(isScoreable); PENDING=MATCHES.filter(m=>!isScoreable(m));
  calculateRanking();
  renderAll();
 }catch(e){
  document.body.innerHTML='<div class="fatal"><h1>⚠️ No pude cargar la página</h1><p>'+esc(e.message)+'</p><p>Verifica que index.html, script.js, predicciones.json y resultados.json estén en la misma carpeta.</p></div>';
 }
}

function groupLetters(){return [...new Set(MATCHES.map(m=>m.grupo).filter(Boolean))].sort()}
function groupMatches(g){return MATCHES.filter(m=>m.grupo===g)}
function tableRow(team){return {team,pj:0,pts:0,gf:0,gc:0,gd:0,w:0,d:0,l:0}}
function addStanding(rows,local,visitante,gl,gv){
 if(!rows[local])rows[local]=tableRow(local); if(!rows[visitante])rows[visitante]=tableRow(visitante);
 const a=rows[local],b=rows[visitante]; a.pj++;b.pj++;a.gf+=+gl;a.gc+=+gv;b.gf+=+gv;b.gc+=+gl; a.gd=a.gf-a.gc;b.gd=b.gf-b.gc;
 if(+gl>+gv){a.w++;b.l++;a.pts+=3}else if(+gl<+gv){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}
}
function sortStanding(rows){return Object.values(rows).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.gc-b.gc||a.team.localeCompare(b.team))}
function actualGroupStanding(g){
 const ms=groupMatches(g); if(ms.length<6||!ms.every(isFinal))return null;
 const rows={}; ms.forEach(m=>addStanding(rows,m.local,m.visitante,m.golesLocal,m.golesVisitante)); return sortStanding(rows);
}
function predictedGroupStanding(g,p){
 if(p.grupos&&Array.isArray(p.grupos[g])&&p.grupos[g].length>=4)return p.grupos[g].map(team=>({team}));
 const ms=groupMatches(g); if(ms.length<6)return null; const rows={};
 for(const m of ms){const pr=p.predicciones?.[m.id]; if(!pr)return null; addStanding(rows,m.local,m.visitante,pr.golesLocal,pr.golesVisitante)}
 return sortStanding(rows);
}
function groupBonus(p){
 let total=0,hits=0,closed=0,detail=[];
 groupLetters().forEach(g=>{const real=actualGroupStanding(g), pred=predictedGroupStanding(g,p); if(!real||!pred)return; closed++; for(let i=0;i<4;i++){if(real[i]?.team&&pred[i]?.team&&sameTeam(real[i].team,pred[i].team)){total+=GROUP_BONUS[i];hits++;detail.push({grupo:g,pos:i+1,team:real[i].team,pts:GROUP_BONUS[i]})}}});
 return {total,hits,closed,detail};
}
function getGroupStandingForBracket(g,p){return p?predictedGroupStanding(g,p):actualGroupStanding(g)}
function bestThirds(p){
 const thirds=[]; let closed=0; groupLetters().forEach(g=>{const st=getGroupStandingForBracket(g,p); if(!st||st.length<4)return; closed++; thirds.push({...st[2],grupo:g})});
 if(!p&&closed<groupLetters().length)return {thirds:[],closed,total:groupLetters().length,complete:false};
 thirds.sort((a,b)=>(b.pts??0)-(a.pts??0)||(b.gd??0)-(a.gd??0)||(b.gf??0)-(a.gf??0)||(a.gc??0)-(b.gc??0)||String(a.team).localeCompare(String(b.team)));
 return {thirds:thirds.slice(0,8),closed,total:groupLetters().length,complete:p?true:closed===groupLetters().length};
}
function resolveSlot(slot,p,used){
 if(slot.group){const st=getGroupStandingForBracket(slot.group,p); if(!st||!st[slot.pos-1])return null; return {team:st[slot.pos-1].team,source:`${slot.pos}° Grupo ${slot.group}`}}
 if(slot.third){const best=bestThirds(p); if(!best.complete)return null; const f=best.thirds.find(x=>slot.third.includes(x.grupo)&&!used.has(x.grupo)); if(!f)return null; used.add(f.grupo); return {team:f.team,source:`3° Grupo ${f.grupo}`}}
 return null;
}
function r32Matchups(p){const used=new Set(),out=[];R32_SLOTS.forEach(slot=>{const a=resolveSlot(slot.a,p,used),b=resolveSlot(slot.b,p,used);if(a&&b)out.push({id:slot.id,a:a.team,b:b.team,key:pairKey(a.team,b.team),sourceA:a.source,sourceB:b.source})});return out}
function r32Bonus(p){const real=r32Matchups(null),pred=r32Matchups(p),keys=new Set(pred.map(x=>x.key));let total=0,detail=[];real.forEach(m=>{if(keys.has(m.key)){total+=R32_BONUS;detail.push({...m,pts:R32_BONUS})}});return {total,hits:detail.length,available:real.length,detail}}
function predictedWinner(p,id){const m=matchById(id),pr=p.predicciones?.[id]; if(!m||!pr||pr.golesLocal==null||pr.golesVisitante==null||+pr.golesLocal===+pr.golesVisitante)return null; return +pr.golesLocal>+pr.golesVisitante?m.local:m.visitante}
function r16Bonus(p){let total=0,detail=[],available=0;R16_SLOTS.forEach(s=>{const m=matchById(s.r16); if(!m||!m.local||!m.visitante||/por definir|winner|tbd/i.test((m.local||'')+(m.visitante||'')))return; available++; const a=predictedWinner(p,s.r32a),b=predictedWinner(p,s.r32b); if(a&&b&&pairKey(a,b)===pairKey(m.local,m.visitante)){total+=R16_BONUS;detail.push({a,b,pts:R16_BONUS})}});return {total,hits:detail.length,available,detail}}

function calculateRanking(){
 RANKING=PARTICIPANTES.map(p=>{
  let pts=0,exact=0,hit=0,last=[];
  PLAYED.forEach(m=>{const pr=p.predicciones?.[m.id]; if(!pr)return; const s=points(pr.golesLocal,pr.golesVisitante,m.golesLocal,m.golesVisitante); pts+=s; const ex=+pr.golesLocal===+m.golesLocal&&+pr.golesVisitante===+m.golesVisitante; const ok=outcome(pr.golesLocal,pr.golesVisitante)===outcome(m.golesLocal,m.golesVisitante); if(ex)exact++; if(ok)hit++; last.push({m,pr,s,exact:ex,ok})});
  const gb=groupBonus(p), rb=r32Bonus(p), r16=r16Bonus(p); pts+=gb.total+rb.total+r16.total;
  return {...p,pts,exact,hit,pct:PLAYED.length?pct(hit,PLAYED.length):0,last:last.reverse(),groupPosPts:gb.total,groupPosHits:gb.hits,r32Pts:rb.total,r32Hits:rb.hits,r16Pts:r16.total,r16Hits:r16.hits,koPts:rb.total+r16.total};
 });
 RANKING.sort((a,b)=>b.pts-a.pts||b.exact-a.exact||b.hit-a.hit||a.nombre.localeCompare(b.nombre)); RANKING.forEach((p,i)=>p.pos=i+1);
}

function renderAll(){
 const meta=RES?._meta||{}; $('subtitle').textContent=`${PARTICIPANTES.length} participantes · ${PLAYED.length}/${MATCHES.length} partidos · ${meta.ultima_actualizacion_auto?new Date(meta.ultima_actualizacion_auto).toLocaleString('es-CO'):''}`;
 renderDashboard(); renderRanking(); renderMatches(); renderKnockout(); renderWorld(); renderSalon(); bindSearch(); showTab('inicio');
}
function renderDashboard(){
 const leader=RANKING[0], next=PENDING[0], live=MATCHES.find(isLive);
 const championStats=countBy(PARTICIPANTES.map(p=>p.honor?.campeon).filter(Boolean)); const topChampion=championStats[0];
 $('dash').innerHTML=`
  <div class="dash-card"><span>👑 Líder</span><b>${esc(leader?.nombre||'-')}</b><small>${leader?.pts||0} puntos</small></div>
  <div class="dash-card"><span>⚽ Estado</span><b>${live?`${flag(live.local)} ${esc(live.local)} ${scoreText(live)} ${flag(live.visitante)} ${esc(live.visitante)}`:'Sin partidos en vivo'}</b><small>${live?'EN VIVO':'Próximo: '+(next?`${flag(next.local)} ${esc(next.local)} vs ${flag(next.visitante)} ${esc(next.visitante)}`:'Por definir')}</small></div>
  <div class="dash-card"><span>🏆 Campeón más elegido</span><b>${topChampion?`${flag(topChampion.name)} ${esc(topChampion.name)}`:'-'}</b><small>${topChampion?topChampion.count+' votos':''}</small></div>
  <div class="dash-card"><span>🌎 Mundial</span><b>${PLAYED.length}/${MATCHES.length}</b><small>partidos jugados</small><div class="progress"><i style="width:${pct(PLAYED.length,MATCHES.length)}%"></i></div></div>`;
 $('podium').innerHTML=RANKING.slice(0,3).map(playerCard).join('');
 $('activity-feed').innerHTML=feedItems().map(x=>`<div class="feed-item"><div>${x.ico}</div><div><b>${x.title}</b><small>${x.sub}</small></div></div>`).join('');
 renderRankingChart('ranking-chart-home');
}
function playerCard(p,i=0){return `<div class="fifa-card rank-${p.pos}" onclick="openProfile('${esc(p.id)}')"><div class="stars">★★★★★</div><div class="ovr">${Math.min(99,Math.round(60+p.pct*.25+p.exact*.7))}</div><div class="pc-name">${medal(p.pos)} ${esc(p.nombre)}</div><div class="pc-meta">${p.pts} pts · 🎯 ${p.exact} · ⚽ ${p.hit}</div><div class="pc-champ">${flag(p.honor?.campeon)} ${esc(p.honor?.campeon||'Sin campeón')}</div></div>`}
function renderRanking(){
 $('ranking-list').innerHTML=RANKING.map(p=>rankRow(p)).join(''); renderRankingChart('ranking-chart');
}
function rankRow(p){return `<div class="rank-row" data-name="${esc(norm(p.nombre))}" onclick="openProfile('${esc(p.id)}')"><div class="pos">${medal(p.pos)}</div><div><div class="name">${esc(p.nombre)}</div><div class="chips"><span>🎯 ${p.exact} exactos</span><span>⚽ ${p.hit} aciertos</span><span>🏆 ${p.groupPosPts||0}+${p.koPts||0}</span></div></div><div class="pts">${p.pts}<small>pts</small></div></div>`}
function renderRankingChart(id){
 const top=RANKING.slice(0,10), max=Math.max(1,...top.map(p=>p.pts));
 $(id).innerHTML='<div class="chart">'+top.map(p=>`<div class="chart-row"><span>${esc(p.nombre.split(' ')[0])}</span><div><i style="width:${pct(p.pts,max)}%"></i></div><b>${p.pts}</b></div>`).join('')+'</div>';
}
function renderMatches(){
 const live=MATCHES.filter(isLive), upcoming=PENDING.slice(0,8), latest=PLAYED.slice().reverse().slice(0,12);
 $('matches-live').innerHTML=(live.length?live:upcoming).map(matchCard).join('')||'<div class="empty">No hay partidos próximos.</div>';
 $('matches-played').innerHTML=latest.map(matchCard).join('');
 renderGroupTables();
}
function matchCard(m){return `<div class="match-card"><div><b>${flag(m.local)} ${esc(m.local)}</b><small>${esc(m.grupo?`Grupo ${m.grupo}`:'Eliminatorias')} · ${stateText(m)}</small></div><div class="score">${scoreText(m)}</div><div><b>${flag(m.visitante)} ${esc(m.visitante)}</b></div></div>`}
function renderGroupTables(){
 $('group-tables').innerHTML=groupLetters().map(g=>{const st=actualGroupStanding(g); return `<div class="card compact"><h3>Grupo ${g}</h3>${st?'<table><tbody>'+st.map((r,i)=>`<tr><td>${i+1}</td><td>${flag(r.team)} ${esc(r.team)}</td><td>${r.pts}</td><td>${r.gd>0?'+':''}${r.gd}</td></tr>`).join('')+'</tbody></table>':'<div class="empty">Grupo en disputa</div>'}</div>`}).join('');
}
function renderKnockout(){
 $('ko-summary').innerHTML=Object.entries(KO_PHASES).map(([phase,ids])=>{const done=ids.map(matchById).filter(Boolean).filter(isFinal).length; return `<div class="mini-stat"><span>${phase}</span><b>${done}/${ids.length}</b></div>`}).join('');
 $('ko-bracket').innerHTML=Object.entries(KO_PHASES).map(([phase,ids])=>`<div class="ko-phase"><h3>${phase}</h3>${ids.map(matchById).filter(Boolean).map(koCard).join('')}</div>`).join('');
}
function koCard(m){const known=m.local&&m.visitante&&!/winner|tbd|por definir/i.test((m.local||'')+(m.visitante||'')); return `<div class="ko-match ${isFinal(m)?'done':isLive(m)?'live':'pending'}"><small>${esc(m.id)} · ${stateText(m)}</small><div>${known?`${flag(m.local)} ${esc(m.local)}`:'Por definir'}</div><b>${known?scoreText(m):'vs'}</b><div>${known?`${flag(m.visitante)} ${esc(m.visitante)}`:'Por definir'}</div></div>`}
function renderWorld(){
 renderStats(); renderMap();
}
function renderStats(){
 const champ=countBy(PARTICIPANTES.map(p=>p.honor?.campeon).filter(Boolean)).slice(0,8);
 const topExact=RANKING.slice().sort((a,b)=>b.exact-a.exact||b.pts-a.pts).slice(0,5);
 const topHit=RANKING.slice().sort((a,b)=>b.hit-a.hit||b.pts-a.pts).slice(0,5);
 $('stats-grid').innerHTML=`
  <div class="card"><h3>🏆 Campeón más votado</h3>${bars(champ,PARTICIPANTES.length)}</div>
  <div class="card"><h3>🎯 Botín de oro</h3>${miniList(topExact,p=>`${p.exact} exactos`)}</div>
  <div class="card"><h3>⚽ Balón de oro</h3>${miniList(topHit,p=>`${p.hit} aciertos`)}</div>
  <div class="card"><h3>📊 Acertómetro top 5</h3>${miniList(RANKING.slice().sort((a,b)=>b.pct-a.pct).slice(0,5),p=>`${p.pct}%`)}</div>`;
 const focus=PENDING[0]||MATCHES.find(isLive)||PLAYED[PLAYED.length-1];
 $('collective').innerHTML=focus?collectiveForMatch(focus):'<div class="empty">Sin partido de referencia.</div>';
}
function countBy(arr){const m=new Map(); arr.forEach(x=>m.set(x,(m.get(x)||0)+1)); return [...m.entries()].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count||String(a.name).localeCompare(String(b.name)))}
function bars(items,total){return items.map(x=>`<div class="barrow"><div><span>${flag(x.name)} ${esc(x.name)}</span><b>${x.count}</b></div><i><em style="width:${pct(x.count,total)}%"></em></i></div>`).join('')}
function miniList(items,sub){return items.map((p,i)=>`<div class="mini-row"><span>${medal(i+1)} ${esc(p.nombre)}</span><b>${sub(p)}</b></div>`).join('')}
function collectiveForMatch(m){
 const vals=PARTICIPANTES.map(p=>p.predicciones?.[m.id]).filter(Boolean); const res=countBy(vals.map(pr=>outcome(pr.golesLocal,pr.golesVisitante)==='L'?m.local:outcome(pr.golesLocal,pr.golesVisitante)==='V'?m.visitante:'Empate'));
 const scores=countBy(vals.map(pr=>`${pr.golesLocal}-${pr.golesVisitante}`)).slice(0,6);
 return `<div class="card"><h3>🇲🇽 Opinión colectiva</h3><p>${flag(m.local)} ${esc(m.local)} vs ${flag(m.visitante)} ${esc(m.visitante)}</p>${bars(res,vals.length)}<h4>Marcadores más repetidos</h4>${bars(scores,vals.length)}</div>`;
}
function allTeams(){return [...new Set(MATCHES.flatMap(m=>[m.local,m.visitante]).filter(t=>t&&!/winner|tbd|por definir/i.test(t)))]}
function qualifiedTeams(){
 const set=new Set(); groupLetters().forEach(g=>{const st=actualGroupStanding(g); if(st){if(st[0])set.add(st[0].team); if(st[1])set.add(st[1].team)}}); bestThirds(null).thirds.forEach(x=>set.add(x.team)); return set;
}
function renderMap(){
 const q=qualifiedTeams(); const groupClosed=groupLetters().filter(g=>actualGroupStanding(g)).length; const allClosed=groupClosed===groupLetters().length;
 $('world-map').innerHTML=allTeams().sort().map(t=>{const st=q.has(t)?'clasificado':(allClosed?'eliminado':'disputa');return `<div class="team-pill ${st}">${flag(t)} ${esc(t)} <small>${st}</small></div>`}).join('');
}
function renderSalon(){
 const awards=[
  {ico:'👑',title:'Rey del Mundial',p:RANKING[0],sub:p=>`${p.pts} puntos`},
  {ico:'🎯',title:'Francotirador',p:RANKING.slice().sort((a,b)=>b.exact-a.exact)[0],sub:p=>`${p.exact} exactos`},
  {ico:'🐙',title:'Pulpo Paul',p:RANKING.slice().sort((a,b)=>b.hit-a.hit)[0],sub:p=>`${p.hit} aciertos`},
  {ico:'🏆',title:'Experto en grupos',p:RANKING.slice().sort((a,b)=>b.groupPosPts-a.groupPosPts)[0],sub:p=>`${p.groupPosPts} puntos de grupos`},
  {ico:'⚔️',title:'Maestro de llaves',p:RANKING.slice().sort((a,b)=>b.koPts-a.koPts)[0],sub:p=>`${p.koPts} puntos de llaves`}
 ];
 $('salon-list').innerHTML=awards.map(a=>`<div class="award" onclick="openProfile('${esc(a.p.id)}')"><div>${a.ico}</div><div><b>${a.title}</b><small>${esc(a.p.nombre)} · ${a.sub(a.p)}</small></div></div>`).join('');
}
function feedItems(){
 const items=[]; const latest=PLAYED.slice().reverse().slice(0,4); latest.forEach(m=>items.push({ico:'⚽',title:`${m.local} ${scoreText(m)} ${m.visitante}`,sub:`Resultado final · ranking recalculado`}));
 items.unshift({ico:'👑',title:`${RANKING[0]?.nombre||'-'} lidera la polla`,sub:`${RANKING[0]?.pts||0} puntos · ${RANKING[0]?.exact||0} exactos`});
 const exact=RANKING.slice().sort((a,b)=>b.exact-a.exact)[0]; if(exact)items.push({ico:'🎯',title:`${exact.nombre} domina en marcadores exactos`,sub:`${exact.exact} marcadores exactos`});
 return items.slice(0,8);
}
function bindSearch(){const s=$('rank-search'); if(s){s.oninput=()=>{const q=norm(s.value);document.querySelectorAll('#ranking-list .rank-row').forEach(r=>r.style.display=r.dataset.name.includes(q)?'grid':'none')}}}
function showTab(tab){currentTab=tab; document.querySelectorAll('.section').forEach(x=>x.classList.remove('act')); document.querySelectorAll('.navbtn').forEach(x=>x.classList.toggle('act',x.dataset.tab===tab)); $(tab).classList.add('act'); window.scrollTo({top:0,behavior:'smooth'})}
function openProfile(id){const p=RANKING.find(x=>x.id===id); if(!p)return; currentProfile=p; $('profile').classList.add('act'); $('profile-content').innerHTML=profileHtml(p)}
function closeProfile(){ $('profile').classList.remove('act') }
function profileHtml(p){
 const need=needToWin(p); const recent=p.last.slice(0,8).map(x=>`<div class="mini-row"><span>${x.exact?'🎯':x.ok?'✅':'—'} ${esc(x.m.local)} ${x.m.golesLocal}-${x.m.golesVisitante} ${esc(x.m.visitante)}</span><b>+${x.s}</b></div>`).join('');
 return `<button class="close" onclick="closeProfile()">×</button>${playerCard(p)}<div class="profile-grid"><div class="prof-stat"><span>Puesto</span><b>${medal(p.pos)}</b></div><div class="prof-stat"><span>Puntos</span><b>${p.pts}</b></div><div class="prof-stat"><span>Exactos</span><b>${p.exact}</b></div><div class="prof-stat"><span>Aciertos</span><b>${p.hit}</b></div></div><div class="card"><h3>🤖 Qué necesito para ganar</h3>${need}</div><button class="share" onclick="shareProfile()">📲 Compartir por WhatsApp / copiar</button><div class="card"><h3>Últimos puntos</h3>${recent||'<div class="empty">Sin partidos jugados.</div>'}</div>`;
}
function needToWin(p){
 const leader=RANKING[0]; if(!leader||p.id===leader.id)return '<p>Vas liderando. La clave es sostener la ventaja en los próximos partidos y llaves.</p>';
 const gap=leader.pts-p.pts; const diffs=PENDING.filter(m=>{const a=p.predicciones?.[m.id],b=leader.predicciones?.[m.id]; return a&&b&&(a.golesLocal!==b.golesLocal||a.golesVisitante!==b.golesVisitante)}).slice(0,4);
 return `<p>Estás a <b>${gap} puntos</b> del líder.</p>${diffs.length?'<p>Partidos que más te pueden mover porque tienes predicción distinta al líder:</p>'+diffs.map(m=>`<div class="need-row">${flag(m.local)} ${esc(m.local)} vs ${flag(m.visitante)} ${esc(m.visitante)}<br><small>Tu marcador: ${p.predicciones[m.id].golesLocal}-${p.predicciones[m.id].golesVisitante} · Líder: ${leader.predicciones?.[m.id]?.golesLocal??'-'}-${leader.predicciones?.[m.id]?.golesVisitante??'-'}</small></div>`).join(''):'<p>No hay suficientes diferencias pendientes frente al líder en los próximos partidos cargados.</p>'}`;
}
async function shareProfile(){
 const p=currentProfile; if(!p)return; const text=`🏆 Polla Mundial 2026\n${p.nombre}\nPuesto: ${p.pos}\nPuntos: ${p.pts}\n🎯 Exactos: ${p.exact}\n⚽ Aciertos: ${p.hit}`;
 try{if(navigator.share){await navigator.share({text});return}}catch(e){}
 try{await navigator.clipboard.writeText(text); alert('Texto copiado para WhatsApp ✅')}catch(e){location.href='https://wa.me/?text='+encodeURIComponent(text)}
}

document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.navbtn').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.tab)));
 $('profile').addEventListener('click',e=>{if(e.target.id==='profile')closeProfile()});
 loadData();
});
