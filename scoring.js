// scoring.js — Motor de puntaje compartido de la Polla Mundial 2026.
// Usado por index.html (app principal) y grupos.html (ligas privadas) para que
// ambos calculen los mismos puntos con la misma lógica. Si algo se corrige aquí,
// se corrige para las dos páginas a la vez — no dupliques esta lógica en otro lado.
let MATCHES=[];
const MATCH_SCHEDULE={
  p001:'2026-06-11T19:00:00Z',p002:'2026-06-12T02:00:00Z',
  p003:'2026-06-12T19:00:00Z',p004:'2026-06-13T01:00:00Z',
  p008:'2026-06-13T19:00:00Z',p007:'2026-06-13T22:00:00Z',p005:'2026-06-14T01:00:00Z',
  p006:'2026-06-14T04:00:00Z',p010:'2026-06-14T17:00:00Z',p011:'2026-06-14T20:00:00Z',p009:'2026-06-14T23:00:00Z',p012:'2026-06-15T02:00:00Z',
  p014:'2026-06-15T16:00:00Z',p016:'2026-06-15T19:00:00Z',p013:'2026-06-15T22:00:00Z',p015:'2026-06-16T01:00:00Z',
  p017:'2026-06-16T19:00:00Z',p018:'2026-06-16T22:00:00Z',p019:'2026-06-17T01:00:00Z',
  p020:'2026-06-17T04:00:00Z',p023:'2026-06-17T17:00:00Z',p022:'2026-06-17T20:00:00Z',p021:'2026-06-17T23:00:00Z',p024:'2026-06-18T02:00:00Z',
  p025:'2026-06-18T16:00:00Z',p026:'2026-06-18T19:00:00Z',p027:'2026-06-18T22:00:00Z',p028:'2026-06-19T01:00:00Z',
  p032:'2026-06-19T19:00:00Z',p030:'2026-06-19T22:00:00Z',p029:'2026-06-20T00:30:00Z',p031:'2026-06-20T03:00:00Z',
  p035:'2026-06-20T17:00:00Z',p033:'2026-06-20T20:00:00Z',p034:'2026-06-21T00:00:00Z',
  p036:'2026-06-21T04:00:00Z',p038:'2026-06-21T16:00:00Z',p039:'2026-06-21T19:00:00Z',p037:'2026-06-21T22:00:00Z',p040:'2026-06-22T01:00:00Z',
  p043:'2026-06-22T17:00:00Z',p042:'2026-06-22T21:00:00Z',p041:'2026-06-23T00:00:00Z',p044:'2026-06-23T03:00:00Z',
  p047:'2026-06-23T17:00:00Z',p045:'2026-06-23T20:00:00Z',p046:'2026-06-23T23:00:00Z',p048:'2026-06-24T02:00:00Z',
  p051:'2026-06-24T19:00:00Z',p052:'2026-06-24T19:00:00Z',p049:'2026-06-24T22:00:00Z',p050:'2026-06-24T22:00:00Z',p053:'2026-06-25T01:00:00Z',p054:'2026-06-25T01:00:00Z',
  p056:'2026-06-25T20:00:00Z',p055:'2026-06-25T20:00:00Z',p058:'2026-06-25T23:00:00Z',p057:'2026-06-25T23:00:00Z',p059:'2026-06-26T02:00:00Z',p060:'2026-06-26T02:00:00Z',
  p061:'2026-06-26T19:00:00Z',p062:'2026-06-26T19:00:00Z',p066:'2026-06-27T00:00:00Z',p065:'2026-06-27T00:00:00Z',p064:'2026-06-27T03:00:00Z',p063:'2026-06-27T03:00:00Z',
  p067:'2026-06-27T21:00:00Z',p068:'2026-06-27T21:00:00Z',p071:'2026-06-27T23:30:00Z',p072:'2026-06-27T23:30:00Z',p070:'2026-06-28T02:00:00Z',p069:'2026-06-28T02:00:00Z',
  // 16avos de Final
  p073:'2026-06-28T19:00:00Z',
  p074:'2026-06-29T17:00:00Z',p075:'2026-06-29T20:30:00Z',p076:'2026-06-30T01:00:00Z',
  p077:'2026-06-30T17:00:00Z',p078:'2026-06-30T21:00:00Z',p079:'2026-07-01T01:00:00Z',
  p080:'2026-07-01T16:00:00Z',p081:'2026-07-01T20:00:00Z',p082:'2026-07-02T00:00:00Z',
  p083:'2026-07-02T19:00:00Z',p084:'2026-07-02T23:00:00Z',p085:'2026-07-03T03:00:00Z',
  p086:'2026-07-03T18:00:00Z',p087:'2026-07-03T22:00:00Z',p088:'2026-07-04T01:30:00Z',
  // Octavos de Final confirmados
  p089:'2026-07-04T17:00:00Z',p090:'2026-07-04T21:00:00Z',
  p091:'2026-07-05T20:00:00Z',p092:'2026-07-06T00:00:00Z',
  p093:'2026-07-06T19:00:00Z',p094:'2026-07-07T00:00:00Z',
  p095:'2026-07-07T16:00:00Z',p096:'2026-07-07T20:00:00Z',
  // Cuartos, semis y finales
  p097:'2026-07-09T20:00:00Z',p098:'2026-07-10T19:00:00Z',
  p099:'2026-07-11T21:00:00Z',p100:'2026-07-12T01:00:00Z',
  p101:'2026-07-14T19:00:00Z',p102:'2026-07-15T19:00:00Z',
  p103:'2026-07-18T21:00:00Z',p104:'2026-07-19T19:00:00Z'
};
function matchTime(m){return MATCH_SCHEDULE[m.id]?new Date(MATCH_SCHEDULE[m.id]).getTime():((m.matchId||9999)*999999999999)}
function outcome(a,b){return a>b?'L':a<b?'V':'E'}
function points(ph,pa,rh,ra){ph=+ph;pa=+pa;rh=+rh;ra=+ra;const goalBonus=((ph===rh&&rh>0)?rh:0)+((pa===ra&&ra>0)?ra:0);if(ph===rh&&pa===ra)return 5+goalBonus;const ok=outcome(ph,pa)===outcome(rh,ra);return ok?3+goalBonus:goalBonus}
function norm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function teamKey(s){return norm(s).replace(/[^a-z0-9]/g,'')}
function sameTeam(a,b){return teamKey(a)===teamKey(b)}
function pairKey(a,b){return [teamKey(a),teamKey(b)].sort().join('::')}
function orderedPairKey(a,b){return teamKey(a)+'::'+teamKey(b)}
function isScoreable(m){
  return (m.estado==='finalizado'||m.estado==='en_vivo') && m.golesLocal!==null && m.golesVisitante!==null;
}
function isFinal(m){
  return m.estado==='finalizado' && m.golesLocal!==null && m.golesVisitante!==null;
}
function isLive(m){
  return m.estado==='en_vivo' && m.golesLocal!==null && m.golesVisitante!==null;
}
// Corrección de seguridad para el Grupo B:
// evita que el partido Suiza-Bosnia de jornada 2 se duplique como jornada 3.
// p026 es Suiza vs Bosnia 4-1; p051 debe ser Suiza vs Canadá; p052 debe ser Bosnia vs Qatar.
function sanitizeMatches(matches){
  matches.forEach(m=>{
    if(m.id==='p051'){
      const l=norm(m.local), v=norm(m.visitante);
      const isCorrect=l.includes('suiza') && v.includes('canada');
      const isDuplicated=(l.includes('bosnia')&&v.includes('suiza'))||(l.includes('suiza')&&v.includes('bosnia'));
      if(!isCorrect || isDuplicated){
        m.local='Suiza';
        m.visitante='Canadá';
        m.grupo='B';
        m.jornada=3;
        m.estado='pendiente';
        m.golesLocal=null;
        m.golesVisitante=null;
      }
      if(m.espn_id==='760439') delete m.espn_id;
    }
    if(m.id==='p052'){
      const l=norm(m.local), v=norm(m.visitante);
      const isCorrect=l.includes('bosnia') && v.includes('qatar');
      if(!isCorrect){
        m.local='Bosnia';
        m.visitante='Qatar';
        m.grupo='B';
        m.jornada=3;
        m.estado='pendiente';
        m.golesLocal=null;
        m.golesVisitante=null;
      }
      if(m.espn_id==='760439') delete m.espn_id;
    }
  });
  return matches;
}
// Correcciones manuales de eliminatorias: la polla se califica con marcador a 90',
// pero el equipo que avanza puede venir de alargue o penales.
const KO_ADVANCERS={
  p073:'Canadá',p074:'Brasil',p075:'Paraguay',p076:'Marruecos',
  p077:'Noruega',p078:'Francia',p079:'México',p080:'Inglaterra',
  p081:'Bélgica',p082:'EE.UU.',p083:'España',p084:'Portugal',
  p085:'Suiza',p086:'Egipto',p087:'Argentina',p088:'Colombia'
};
const CONFIRMED_OCTAVOS=[
  {id:'p089',matchId:89,local:'Canadá',visitante:'Marruecos',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p090',matchId:90,local:'Paraguay',visitante:'Francia',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p091',matchId:91,local:'Brasil',visitante:'Noruega',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p092',matchId:92,local:'México',visitante:'Inglaterra',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p093',matchId:93,local:'Portugal',visitante:'España',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p094',matchId:94,local:'EE.UU.',visitante:'Bélgica',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p095',matchId:95,local:'Argentina',visitante:'Egipto',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null},
  {id:'p096',matchId:96,local:'Suiza',visitante:'Colombia',fase:'Octavos',jornada:1,estado:'pendiente',golesLocal:null,golesVisitante:null}
];
function applyKnockoutOverrides(matches){
  const out=(matches||[]).map(m=>({...m}));
  const p087=out.find(m=>m.id==='p087'||String(m.matchId)==='87');
  if(p087){
    p087.id='p087';p087.local='Argentina';p087.visitante='Cabo Verde';
    p087.estado='finalizado';p087.golesLocal=1;p087.golesVisitante=1;
    p087.clasificado='Argentina';p087.definicion='alargue';
  }
  const byId=new Map(out.map(m=>[m.id,m]));
  CONFIRMED_OCTAVOS.forEach(base=>{
    const existing=byId.get(base.id);
    if(existing){Object.assign(existing,{local:base.local,visitante:base.visitante,fase:base.fase,matchId:base.matchId});}
    else out.push({...base});
  });
  return out;
}
// Bonificación por posiciones finales de grupo.
// Se suma únicamente cuando el grupo ya tiene sus 6 partidos finalizados.
// 1.º correcto = 4 pts, 2.º correcto = 3 pts, 3.º correcto = 1 pt, 4.º correcto = 1 pt.
const GROUP_POSITION_BONUS=[4,3,1,1];
function groupLetters(){return [...new Set(MATCHES.map(m=>m.grupo).filter(Boolean))].sort()}
function groupMatches(g){return MATCHES.filter(m=>m.grupo===g).sort((a,b)=>matchTime(a)-matchTime(b))}
function tableRow(team){return {team,pj:0,pts:0,gf:0,gc:0,gd:0,w:0,d:0,l:0}}
function addStandingMatch(rows,local,visitante,gl,gv){
  if(!rows[local])rows[local]=tableRow(local);
  if(!rows[visitante])rows[visitante]=tableRow(visitante);
  const a=rows[local], b=rows[visitante];
  a.pj++;b.pj++;a.gf+=gl;a.gc+=gv;b.gf+=gv;b.gc+=gl;a.gd=a.gf-a.gc;b.gd=b.gf-b.gc;
  if(gl>gv){a.w++;b.l++;a.pts+=3}else if(gl<gv){b.w++;a.l++;b.pts+=3}else{a.d++;b.d++;a.pts++;b.pts++}
}
function sortStandings(rows){
  return Object.values(rows).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.gc-b.gc||a.team.localeCompare(b.team));
}
function actualGroupStanding(g){
  const ms=groupMatches(g);
  if(ms.length<6 || !ms.every(isFinal))return null;
  const rows={};
  ms.forEach(m=>addStandingMatch(rows,m.local,m.visitante,+m.golesLocal,+m.golesVisitante));
  return sortStandings(rows);
}
function predictedGroupStandingFromScores(g,p){
  const ms=groupMatches(g);
  if(ms.length<6)return null;
  const rows={};
  for(const m of ms){
    const pr=p.predicciones?.[m.id];
    if(!pr || pr.golesLocal===undefined || pr.golesVisitante===undefined)return null;
    addStandingMatch(rows,m.local,m.visitante,+pr.golesLocal,+pr.golesVisitante);
  }
  return sortStandings(rows);
}
function predictedGroupStanding(g,p){
  const byScore=predictedGroupStandingFromScores(g,p)||[];
  const statsByTeam={};
  byScore.forEach(x=>statsByTeam[teamKey(x.team)]=x);
  if(p.grupos && Array.isArray(p.grupos[g]) && p.grupos[g].length>=4){
    return p.grupos[g].map(team=>({...(statsByTeam[teamKey(team)]||{}),team}));
  }
  return byScore.length?byScore:null;
}
function groupPositionBonus(p){
  let total=0,hits=0,closed=0;
  const detail=[];
  groupLetters().forEach(g=>{
    const real=actualGroupStanding(g);
    if(!real)return;
    const pred=predictedGroupStanding(g,p);
    if(!pred)return;
    closed++;
    for(let i=0;i<4;i++){
      if(real[i]?.team && pred[i]?.team && sameTeam(real[i].team,pred[i].team)){
        const pts=GROUP_POSITION_BONUS[i]||0;
        total+=pts;hits++;
        detail.push({grupo:g,pos:i+1,team:real[i].team,pts});
      }
    }
  });
  return {total,hits,closed,detail};
}
const KO_PHASES={
  '16avos':{ids:['p073','p074','p075','p076','p077','p078','p079','p080','p081','p082','p083','p084','p085','p086','p087','p088'],total:16,label:'Clasificados a 8vos / 16avos jugados',roundLabel:'16avos de Final'},
  '8vos':{ids:['p089','p090','p091','p092','p093','p094','p095','p096'],total:8,label:'Clasificados a cuartos',roundLabel:'8vos de Final'},
  'Cuartos':{ids:['p097','p098','p099','p100'],total:4,label:'Clasificados a semifinal',roundLabel:'Cuartos de Final'},
  'Semis':{ids:['p101','p102'],total:2,label:'Finalistas',roundLabel:'Semifinales'},
  'Final':{ids:['p103','p104'],total:2,label:'Tercer puesto y final',roundLabel:'Tercer puesto y Final'}
};
const EXACT_MATCHUP_BONUS=2;
const R32_SLOTS=[
  {id:'R32-1',a:{group:'A',pos:2},b:{group:'B',pos:2}},
  {id:'R32-2',a:{group:'C',pos:1},b:{group:'F',pos:2}},
  {id:'R32-3',a:{group:'E',pos:1},b:{third:['A','B','C','D','F']}},
  {id:'R32-4',a:{group:'F',pos:1},b:{group:'C',pos:2}},
  {id:'R32-5',a:{group:'E',pos:2},b:{group:'I',pos:2}},
  {id:'R32-6',a:{group:'I',pos:1},b:{third:['C','D','F','G','H']}},
  {id:'R32-7',a:{group:'A',pos:1},b:{third:['C','E','F','H','I']}},
  {id:'R32-8',a:{group:'L',pos:1},b:{third:['E','H','I','J','K']}},
  {id:'R32-9',a:{group:'G',pos:1},b:{third:['A','E','H','I','J']}},
  {id:'R32-10',a:{group:'D',pos:1},b:{third:['B','E','F','I','J']}},
  {id:'R32-11',a:{group:'H',pos:1},b:{group:'J',pos:2}},
  {id:'R32-12',a:{group:'K',pos:2},b:{group:'L',pos:2}},
  {id:'R32-13',a:{group:'B',pos:1},b:{third:['E','F','G','I','J']}},
  {id:'R32-14',a:{group:'D',pos:2},b:{group:'G',pos:2}},
  {id:'R32-15',a:{group:'J',pos:1},b:{group:'H',pos:2}},
  {id:'R32-16',a:{group:'K',pos:1},b:{third:['D','E','I','J','L']}}
];
// Anexo C del reglamento oficial FIFA 2026: para cada combinación posible de los
// 8 grupos cuyo tercero clasifica, indica exactamente a qué ganador de grupo se
// enfrenta el tercero de cada uno de esos grupos. Reemplaza la heurística anterior
// (que asignaba el mejor tercero disponible al primer cruce que lo pidiera), la cual
// no coincidía con el sorteo oficial en varios casos.
const THIRD_PLACE_TABLE={EFGHIJKL:{A:"E",B:"J",D:"I",E:"F",G:"H",I:"G",K:"L",L:"K"},DFGHIJKL:{A:"H",B:"G",D:"I",E:"D",G:"J",I:"F",K:"L",L:"K"},DEGHIJKL:{A:"E",B:"J",D:"I",E:"D",G:"H",I:"G",K:"L",L:"K"},DEFHIJKL:{A:"E",B:"J",D:"I",E:"D",G:"H",I:"F",K:"L",L:"K"},DEFGIJKL:{A:"E",B:"G",D:"I",E:"D",G:"J",I:"F",K:"L",L:"K"},DEFGHJKL:{A:"E",B:"G",D:"J",E:"D",G:"H",I:"F",K:"L",L:"K"},DEFGHIKL:{A:"E",B:"G",D:"I",E:"D",G:"H",I:"F",K:"L",L:"K"},DEFGHIJL:{A:"E",B:"G",D:"J",E:"D",G:"H",I:"F",K:"L",L:"I"},DEFGHIJK:{A:"E",B:"G",D:"J",E:"D",G:"H",I:"F",K:"I",L:"K"},CFGHIJKL:{A:"H",B:"G",D:"I",E:"C",G:"J",I:"F",K:"L",L:"K"},CEGHIJKL:{A:"E",B:"J",D:"I",E:"C",G:"H",I:"G",K:"L",L:"K"},CEFHIJKL:{A:"E",B:"J",D:"I",E:"C",G:"H",I:"F",K:"L",L:"K"},CEFGIJKL:{A:"E",B:"G",D:"I",E:"C",G:"J",I:"F",K:"L",L:"K"},CEFGHJKL:{A:"E",B:"G",D:"J",E:"C",G:"H",I:"F",K:"L",L:"K"},CEFGHIKL:{A:"E",B:"G",D:"I",E:"C",G:"H",I:"F",K:"L",L:"K"},CEFGHIJL:{A:"E",B:"G",D:"J",E:"C",G:"H",I:"F",K:"L",L:"I"},CEFGHIJK:{A:"E",B:"G",D:"J",E:"C",G:"H",I:"F",K:"I",L:"K"},CDGHIJKL:{A:"H",B:"G",D:"I",E:"C",G:"J",I:"D",K:"L",L:"K"},CDFHIJKL:{A:"C",B:"J",D:"I",E:"D",G:"H",I:"F",K:"L",L:"K"},CDFGIJKL:{A:"C",B:"G",D:"I",E:"D",G:"J",I:"F",K:"L",L:"K"},CDFGHJKL:{A:"C",B:"G",D:"J",E:"D",G:"H",I:"F",K:"L",L:"K"},CDFGHIKL:{A:"C",B:"G",D:"I",E:"D",G:"H",I:"F",K:"L",L:"K"},CDFGHIJL:{A:"C",B:"G",D:"J",E:"D",G:"H",I:"F",K:"L",L:"I"},CDFGHIJK:{A:"C",B:"G",D:"J",E:"D",G:"H",I:"F",K:"I",L:"K"},CDEHIJKL:{A:"E",B:"J",D:"I",E:"C",G:"H",I:"D",K:"L",L:"K"},CDEGIJKL:{A:"E",B:"G",D:"I",E:"C",G:"J",I:"D",K:"L",L:"K"},CDEGHJKL:{A:"E",B:"G",D:"J",E:"C",G:"H",I:"D",K:"L",L:"K"},CDEGHIKL:{A:"E",B:"G",D:"I",E:"C",G:"H",I:"D",K:"L",L:"K"},CDEGHIJL:{A:"E",B:"G",D:"J",E:"C",G:"H",I:"D",K:"L",L:"I"},CDEGHIJK:{A:"E",B:"G",D:"J",E:"C",G:"H",I:"D",K:"I",L:"K"},CDEFIJKL:{A:"C",B:"J",D:"E",E:"D",G:"I",I:"F",K:"L",L:"K"},CDEFHJKL:{A:"C",B:"J",D:"E",E:"D",G:"H",I:"F",K:"L",L:"K"},CDEFHIKL:{A:"C",B:"E",D:"I",E:"D",G:"H",I:"F",K:"L",L:"K"},CDEFHIJL:{A:"C",B:"J",D:"E",E:"D",G:"H",I:"F",K:"L",L:"I"},CDEFHIJK:{A:"C",B:"J",D:"E",E:"D",G:"H",I:"F",K:"I",L:"K"},CDEFGJKL:{A:"C",B:"G",D:"E",E:"D",G:"J",I:"F",K:"L",L:"K"},CDEFGIKL:{A:"C",B:"G",D:"E",E:"D",G:"I",I:"F",K:"L",L:"K"},CDEFGIJL:{A:"C",B:"G",D:"E",E:"D",G:"J",I:"F",K:"L",L:"I"},CDEFGIJK:{A:"C",B:"G",D:"E",E:"D",G:"J",I:"F",K:"I",L:"K"},CDEFGHKL:{A:"C",B:"G",D:"E",E:"D",G:"H",I:"F",K:"L",L:"K"},CDEFGHJL:{A:"C",B:"G",D:"J",E:"D",G:"H",I:"F",K:"L",L:"E"},CDEFGHJK:{A:"C",B:"G",D:"J",E:"D",G:"H",I:"F",K:"E",L:"K"},CDEFGHIL:{A:"C",B:"G",D:"E",E:"D",G:"H",I:"F",K:"L",L:"I"},CDEFGHIK:{A:"C",B:"G",D:"E",E:"D",G:"H",I:"F",K:"I",L:"K"},CDEFGHIJ:{A:"C",B:"G",D:"J",E:"D",G:"H",I:"F",K:"E",L:"I"},BFGHIJKL:{A:"H",B:"J",D:"B",E:"F",G:"I",I:"G",K:"L",L:"K"},BEGHIJKL:{A:"E",B:"J",D:"I",E:"B",G:"H",I:"G",K:"L",L:"K"},BEFHIJKL:{A:"E",B:"J",D:"B",E:"F",G:"I",I:"H",K:"L",L:"K"},BEFGIJKL:{A:"E",B:"J",D:"B",E:"F",G:"I",I:"G",K:"L",L:"K"},BEFGHJKL:{A:"E",B:"J",D:"B",E:"F",G:"H",I:"G",K:"L",L:"K"},BEFGHIKL:{A:"E",B:"G",D:"B",E:"F",G:"I",I:"H",K:"L",L:"K"},BEFGHIJL:{A:"E",B:"J",D:"B",E:"F",G:"H",I:"G",K:"L",L:"I"},BEFGHIJK:{A:"E",B:"J",D:"B",E:"F",G:"H",I:"G",K:"I",L:"K"},BDGHIJKL:{A:"H",B:"J",D:"B",E:"D",G:"I",I:"G",K:"L",L:"K"},BDFHIJKL:{A:"H",B:"J",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BDFGIJKL:{A:"I",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"K"},BDFGHJKL:{A:"H",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"K"},BDFGHIKL:{A:"H",B:"G",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BDFGHIJL:{A:"H",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"I"},BDFGHIJK:{A:"H",B:"G",D:"B",E:"D",G:"J",I:"F",K:"I",L:"K"},BDEHIJKL:{A:"E",B:"J",D:"B",E:"D",G:"I",I:"H",K:"L",L:"K"},BDEGIJKL:{A:"E",B:"J",D:"B",E:"D",G:"I",I:"G",K:"L",L:"K"},BDEGHJKL:{A:"E",B:"J",D:"B",E:"D",G:"H",I:"G",K:"L",L:"K"},BDEGHIKL:{A:"E",B:"G",D:"B",E:"D",G:"I",I:"H",K:"L",L:"K"},BDEGHIJL:{A:"E",B:"J",D:"B",E:"D",G:"H",I:"G",K:"L",L:"I"},BDEGHIJK:{A:"E",B:"J",D:"B",E:"D",G:"H",I:"G",K:"I",L:"K"},BDEFIJKL:{A:"E",B:"J",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BDEFHJKL:{A:"E",B:"J",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BDEFHIKL:{A:"E",B:"I",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BDEFHIJL:{A:"E",B:"J",D:"B",E:"D",G:"H",I:"F",K:"L",L:"I"},BDEFHIJK:{A:"E",B:"J",D:"B",E:"D",G:"H",I:"F",K:"I",L:"K"},BDEFGJKL:{A:"E",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"K"},BDEFGIKL:{A:"E",B:"G",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BDEFGIJL:{A:"E",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"I"},BDEFGIJK:{A:"E",B:"G",D:"B",E:"D",G:"J",I:"F",K:"I",L:"K"},BDEFGHKL:{A:"E",B:"G",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BDEFGHJL:{A:"H",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"E"},BDEFGHJK:{A:"H",B:"G",D:"B",E:"D",G:"J",I:"F",K:"E",L:"K"},BDEFGHIL:{A:"E",B:"G",D:"B",E:"D",G:"H",I:"F",K:"L",L:"I"},BDEFGHIK:{A:"E",B:"G",D:"B",E:"D",G:"H",I:"F",K:"I",L:"K"},BDEFGHIJ:{A:"H",B:"G",D:"B",E:"D",G:"J",I:"F",K:"E",L:"I"},BCGHIJKL:{A:"H",B:"J",D:"B",E:"C",G:"I",I:"G",K:"L",L:"K"},BCFHIJKL:{A:"H",B:"J",D:"B",E:"C",G:"I",I:"F",K:"L",L:"K"},BCFGIJKL:{A:"I",B:"G",D:"B",E:"C",G:"J",I:"F",K:"L",L:"K"},BCFGHJKL:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"L",L:"K"},BCFGHIKL:{A:"H",B:"G",D:"B",E:"C",G:"I",I:"F",K:"L",L:"K"},BCFGHIJL:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"L",L:"I"},BCFGHIJK:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"I",L:"K"},BCEHIJKL:{A:"E",B:"J",D:"B",E:"C",G:"I",I:"H",K:"L",L:"K"},BCEGIJKL:{A:"E",B:"J",D:"B",E:"C",G:"I",I:"G",K:"L",L:"K"},BCEGHJKL:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"G",K:"L",L:"K"},BCEGHIKL:{A:"E",B:"G",D:"B",E:"C",G:"I",I:"H",K:"L",L:"K"},BCEGHIJL:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"G",K:"L",L:"I"},BCEGHIJK:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"G",K:"I",L:"K"},BCEFIJKL:{A:"E",B:"J",D:"B",E:"C",G:"I",I:"F",K:"L",L:"K"},BCEFHJKL:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"F",K:"L",L:"K"},BCEFHIKL:{A:"E",B:"I",D:"B",E:"C",G:"H",I:"F",K:"L",L:"K"},BCEFHIJL:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"F",K:"L",L:"I"},BCEFHIJK:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"F",K:"I",L:"K"},BCEFGJKL:{A:"E",B:"G",D:"B",E:"C",G:"J",I:"F",K:"L",L:"K"},BCEFGIKL:{A:"E",B:"G",D:"B",E:"C",G:"I",I:"F",K:"L",L:"K"},BCEFGIJL:{A:"E",B:"G",D:"B",E:"C",G:"J",I:"F",K:"L",L:"I"},BCEFGIJK:{A:"E",B:"G",D:"B",E:"C",G:"J",I:"F",K:"I",L:"K"},BCEFGHKL:{A:"E",B:"G",D:"B",E:"C",G:"H",I:"F",K:"L",L:"K"},BCEFGHJL:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"L",L:"E"},BCEFGHJK:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"E",L:"K"},BCEFGHIL:{A:"E",B:"G",D:"B",E:"C",G:"H",I:"F",K:"L",L:"I"},BCEFGHIK:{A:"E",B:"G",D:"B",E:"C",G:"H",I:"F",K:"I",L:"K"},BCEFGHIJ:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"E",L:"I"},BCDHIJKL:{A:"H",B:"J",D:"B",E:"C",G:"I",I:"D",K:"L",L:"K"},BCDGIJKL:{A:"I",B:"G",D:"B",E:"C",G:"J",I:"D",K:"L",L:"K"},BCDGHJKL:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"D",K:"L",L:"K"},BCDGHIKL:{A:"H",B:"G",D:"B",E:"C",G:"I",I:"D",K:"L",L:"K"},BCDGHIJL:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"D",K:"L",L:"I"},BCDGHIJK:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"D",K:"I",L:"K"},BCDFIJKL:{A:"C",B:"J",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BCDFHJKL:{A:"C",B:"J",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BCDFHIKL:{A:"C",B:"I",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BCDFHIJL:{A:"C",B:"J",D:"B",E:"D",G:"H",I:"F",K:"L",L:"I"},BCDFHIJK:{A:"C",B:"J",D:"B",E:"D",G:"H",I:"F",K:"I",L:"K"},BCDFGJKL:{A:"C",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"K"},BCDFGIKL:{A:"C",B:"G",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BCDFGIJL:{A:"C",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"I"},BCDFGIJK:{A:"C",B:"G",D:"B",E:"D",G:"J",I:"F",K:"I",L:"K"},BCDFGHKL:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BCDFGHJL:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"L",L:"J"},BCDFGHJK:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"D",L:"K"},BCDFGHIL:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"L",L:"I"},BCDFGHIK:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"I",L:"K"},BCDFGHIJ:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"D",L:"I"},BCDEIJKL:{A:"E",B:"J",D:"B",E:"C",G:"I",I:"D",K:"L",L:"K"},BCDEHJKL:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"D",K:"L",L:"K"},BCDEHIKL:{A:"E",B:"I",D:"B",E:"C",G:"H",I:"D",K:"L",L:"K"},BCDEHIJL:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"D",K:"L",L:"I"},BCDEHIJK:{A:"E",B:"J",D:"B",E:"C",G:"H",I:"D",K:"I",L:"K"},BCDEGJKL:{A:"E",B:"G",D:"B",E:"C",G:"J",I:"D",K:"L",L:"K"},BCDEGIKL:{A:"E",B:"G",D:"B",E:"C",G:"I",I:"D",K:"L",L:"K"},BCDEGIJL:{A:"E",B:"G",D:"B",E:"C",G:"J",I:"D",K:"L",L:"I"},BCDEGIJK:{A:"E",B:"G",D:"B",E:"C",G:"J",I:"D",K:"I",L:"K"},BCDEGHKL:{A:"E",B:"G",D:"B",E:"C",G:"H",I:"D",K:"L",L:"K"},BCDEGHJL:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"D",K:"L",L:"E"},BCDEGHJK:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"D",K:"E",L:"K"},BCDEGHIL:{A:"E",B:"G",D:"B",E:"C",G:"H",I:"D",K:"L",L:"I"},BCDEGHIK:{A:"E",B:"G",D:"B",E:"C",G:"H",I:"D",K:"I",L:"K"},BCDEGHIJ:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"D",K:"E",L:"I"},BCDEFJKL:{A:"C",B:"J",D:"B",E:"D",G:"E",I:"F",K:"L",L:"K"},BCDEFIKL:{A:"C",B:"E",D:"B",E:"D",G:"I",I:"F",K:"L",L:"K"},BCDEFIJL:{A:"C",B:"J",D:"B",E:"D",G:"E",I:"F",K:"L",L:"I"},BCDEFIJK:{A:"C",B:"J",D:"B",E:"D",G:"E",I:"F",K:"I",L:"K"},BCDEFHKL:{A:"C",B:"E",D:"B",E:"D",G:"H",I:"F",K:"L",L:"K"},BCDEFHJL:{A:"C",B:"J",D:"B",E:"D",G:"H",I:"F",K:"L",L:"E"},BCDEFHJK:{A:"C",B:"J",D:"B",E:"D",G:"H",I:"F",K:"E",L:"K"},BCDEFHIL:{A:"C",B:"E",D:"B",E:"D",G:"H",I:"F",K:"L",L:"I"},BCDEFHIK:{A:"C",B:"E",D:"B",E:"D",G:"H",I:"F",K:"I",L:"K"},BCDEFHIJ:{A:"C",B:"J",D:"B",E:"D",G:"H",I:"F",K:"E",L:"I"},BCDEFGKL:{A:"C",B:"G",D:"B",E:"D",G:"E",I:"F",K:"L",L:"K"},BCDEFGJL:{A:"C",B:"G",D:"B",E:"D",G:"J",I:"F",K:"L",L:"E"},BCDEFGJK:{A:"C",B:"G",D:"B",E:"D",G:"J",I:"F",K:"E",L:"K"},BCDEFGIL:{A:"C",B:"G",D:"B",E:"D",G:"E",I:"F",K:"L",L:"I"},BCDEFGIK:{A:"C",B:"G",D:"B",E:"D",G:"E",I:"F",K:"I",L:"K"},BCDEFGIJ:{A:"C",B:"G",D:"B",E:"D",G:"J",I:"F",K:"E",L:"I"},BCDEFGHL:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"L",L:"E"},BCDEFGHK:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"E",L:"K"},BCDEFGHJ:{A:"H",B:"G",D:"B",E:"C",G:"J",I:"F",K:"D",L:"E"},BCDEFGHI:{A:"C",B:"G",D:"B",E:"D",G:"H",I:"F",K:"E",L:"I"},AFGHIJKL:{A:"H",B:"J",D:"I",E:"F",G:"A",I:"G",K:"L",L:"K"},AEGHIJKL:{A:"E",B:"J",D:"I",E:"A",G:"H",I:"G",K:"L",L:"K"},AEFHIJKL:{A:"E",B:"J",D:"I",E:"F",G:"A",I:"H",K:"L",L:"K"},AEFGIJKL:{A:"E",B:"J",D:"I",E:"F",G:"A",I:"G",K:"L",L:"K"},AEFGHJKL:{A:"E",B:"G",D:"J",E:"F",G:"A",I:"H",K:"L",L:"K"},AEFGHIKL:{A:"E",B:"G",D:"I",E:"F",G:"A",I:"H",K:"L",L:"K"},AEFGHIJL:{A:"E",B:"G",D:"J",E:"F",G:"A",I:"H",K:"L",L:"I"},AEFGHIJK:{A:"E",B:"G",D:"J",E:"F",G:"A",I:"H",K:"I",L:"K"},ADGHIJKL:{A:"H",B:"J",D:"I",E:"D",G:"A",I:"G",K:"L",L:"K"},ADFHIJKL:{A:"H",B:"J",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ADFGIJKL:{A:"I",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"K"},ADFGHJKL:{A:"H",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"K"},ADFGHIKL:{A:"H",B:"G",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ADFGHIJL:{A:"H",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"I"},ADFGHIJK:{A:"H",B:"G",D:"J",E:"D",G:"A",I:"F",K:"I",L:"K"},ADEHIJKL:{A:"E",B:"J",D:"I",E:"D",G:"A",I:"H",K:"L",L:"K"},ADEGIJKL:{A:"E",B:"J",D:"I",E:"D",G:"A",I:"G",K:"L",L:"K"},ADEGHJKL:{A:"E",B:"G",D:"J",E:"D",G:"A",I:"H",K:"L",L:"K"},ADEGHIKL:{A:"E",B:"G",D:"I",E:"D",G:"A",I:"H",K:"L",L:"K"},ADEGHIJL:{A:"E",B:"G",D:"J",E:"D",G:"A",I:"H",K:"L",L:"I"},ADEGHIJK:{A:"E",B:"G",D:"J",E:"D",G:"A",I:"H",K:"I",L:"K"},ADEFIJKL:{A:"E",B:"J",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ADEFHJKL:{A:"H",B:"J",D:"E",E:"D",G:"A",I:"F",K:"L",L:"K"},ADEFHIKL:{A:"H",B:"E",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ADEFHIJL:{A:"H",B:"J",D:"E",E:"D",G:"A",I:"F",K:"L",L:"I"},ADEFHIJK:{A:"H",B:"J",D:"E",E:"D",G:"A",I:"F",K:"I",L:"K"},ADEFGJKL:{A:"E",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"K"},ADEFGIKL:{A:"E",B:"G",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ADEFGIJL:{A:"E",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"I"},ADEFGIJK:{A:"E",B:"G",D:"J",E:"D",G:"A",I:"F",K:"I",L:"K"},ADEFGHKL:{A:"H",B:"G",D:"E",E:"D",G:"A",I:"F",K:"L",L:"K"},ADEFGHJL:{A:"H",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"E"},ADEFGHJK:{A:"H",B:"G",D:"J",E:"D",G:"A",I:"F",K:"E",L:"K"},ADEFGHIL:{A:"H",B:"G",D:"E",E:"D",G:"A",I:"F",K:"L",L:"I"},ADEFGHIK:{A:"H",B:"G",D:"E",E:"D",G:"A",I:"F",K:"I",L:"K"},ADEFGHIJ:{A:"H",B:"G",D:"J",E:"D",G:"A",I:"F",K:"E",L:"I"},ACGHIJKL:{A:"H",B:"J",D:"I",E:"C",G:"A",I:"G",K:"L",L:"K"},ACFHIJKL:{A:"H",B:"J",D:"I",E:"C",G:"A",I:"F",K:"L",L:"K"},ACFGIJKL:{A:"I",B:"G",D:"J",E:"C",G:"A",I:"F",K:"L",L:"K"},ACFGHJKL:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"L",L:"K"},ACFGHIKL:{A:"H",B:"G",D:"I",E:"C",G:"A",I:"F",K:"L",L:"K"},ACFGHIJL:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"L",L:"I"},ACFGHIJK:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"I",L:"K"},ACEHIJKL:{A:"E",B:"J",D:"I",E:"C",G:"A",I:"H",K:"L",L:"K"},ACEGIJKL:{A:"E",B:"J",D:"I",E:"C",G:"A",I:"G",K:"L",L:"K"},ACEGHJKL:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"H",K:"L",L:"K"},ACEGHIKL:{A:"E",B:"G",D:"I",E:"C",G:"A",I:"H",K:"L",L:"K"},ACEGHIJL:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"H",K:"L",L:"I"},ACEGHIJK:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"H",K:"I",L:"K"},ACEFIJKL:{A:"E",B:"J",D:"I",E:"C",G:"A",I:"F",K:"L",L:"K"},ACEFHJKL:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"F",K:"L",L:"K"},ACEFHIKL:{A:"H",B:"E",D:"I",E:"C",G:"A",I:"F",K:"L",L:"K"},ACEFHIJL:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"F",K:"L",L:"I"},ACEFHIJK:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"F",K:"I",L:"K"},ACEFGJKL:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"F",K:"L",L:"K"},ACEFGIKL:{A:"E",B:"G",D:"I",E:"C",G:"A",I:"F",K:"L",L:"K"},ACEFGIJL:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"F",K:"L",L:"I"},ACEFGIJK:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"F",K:"I",L:"K"},ACEFGHKL:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"F",K:"L",L:"K"},ACEFGHJL:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"L",L:"E"},ACEFGHJK:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"E",L:"K"},ACEFGHIL:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"F",K:"L",L:"I"},ACEFGHIK:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"F",K:"I",L:"K"},ACEFGHIJ:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"E",L:"I"},ACDHIJKL:{A:"H",B:"J",D:"I",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDGIJKL:{A:"I",B:"G",D:"J",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDGHJKL:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDGHIKL:{A:"H",B:"G",D:"I",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDGHIJL:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDGHIJK:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDFIJKL:{A:"C",B:"J",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ACDFHJKL:{A:"H",B:"J",D:"F",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDFHIKL:{A:"H",B:"F",D:"I",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDFHIJL:{A:"H",B:"J",D:"F",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDFHIJK:{A:"H",B:"J",D:"F",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDFGJKL:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"K"},ACDFGIKL:{A:"C",B:"G",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ACDFGIJL:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"I"},ACDFGIJK:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"I",L:"K"},ACDFGHKL:{A:"H",B:"G",D:"F",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDFGHJL:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"H"},ACDFGHJK:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"D",L:"K"},ACDFGHIL:{A:"H",B:"G",D:"F",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDFGHIK:{A:"H",B:"G",D:"F",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDFGHIJ:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"D",L:"I"},ACDEIJKL:{A:"E",B:"J",D:"I",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEHJKL:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEHIKL:{A:"H",B:"E",D:"I",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEHIJL:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDEHIJK:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDEGJKL:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEGIKL:{A:"E",B:"G",D:"I",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEGIJL:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDEGIJK:{A:"E",B:"G",D:"J",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDEGHKL:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEGHJL:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"D",K:"L",L:"E"},ACDEGHJK:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"D",K:"E",L:"K"},ACDEGHIL:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDEGHIK:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDEGHIJ:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"D",K:"E",L:"I"},ACDEFJKL:{A:"C",B:"J",D:"E",E:"D",G:"A",I:"F",K:"L",L:"K"},ACDEFIKL:{A:"C",B:"E",D:"I",E:"D",G:"A",I:"F",K:"L",L:"K"},ACDEFIJL:{A:"C",B:"J",D:"E",E:"D",G:"A",I:"F",K:"L",L:"I"},ACDEFIJK:{A:"C",B:"J",D:"E",E:"D",G:"A",I:"F",K:"I",L:"K"},ACDEFHKL:{A:"H",B:"E",D:"F",E:"C",G:"A",I:"D",K:"L",L:"K"},ACDEFHJL:{A:"H",B:"J",D:"F",E:"C",G:"A",I:"D",K:"L",L:"E"},ACDEFHJK:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"F",K:"D",L:"K"},ACDEFHIL:{A:"H",B:"E",D:"F",E:"C",G:"A",I:"D",K:"L",L:"I"},ACDEFHIK:{A:"H",B:"E",D:"F",E:"C",G:"A",I:"D",K:"I",L:"K"},ACDEFHIJ:{A:"H",B:"J",D:"E",E:"C",G:"A",I:"F",K:"D",L:"I"},ACDEFGKL:{A:"C",B:"G",D:"E",E:"D",G:"A",I:"F",K:"L",L:"K"},ACDEFGJL:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"L",L:"E"},ACDEFGJK:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"E",L:"K"},ACDEFGIL:{A:"C",B:"G",D:"E",E:"D",G:"A",I:"F",K:"L",L:"I"},ACDEFGIK:{A:"C",B:"G",D:"E",E:"D",G:"A",I:"F",K:"I",L:"K"},ACDEFGIJ:{A:"C",B:"G",D:"J",E:"D",G:"A",I:"F",K:"E",L:"I"},ACDEFGHL:{A:"H",B:"G",D:"F",E:"C",G:"A",I:"D",K:"L",L:"E"},ACDEFGHK:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"F",K:"D",L:"K"},ACDEFGHJ:{A:"H",B:"G",D:"J",E:"C",G:"A",I:"F",K:"D",L:"E"},ACDEFGHI:{A:"H",B:"G",D:"E",E:"C",G:"A",I:"F",K:"D",L:"I"},ABGHIJKL:{A:"H",B:"J",D:"B",E:"A",G:"I",I:"G",K:"L",L:"K"},ABFHIJKL:{A:"H",B:"J",D:"B",E:"A",G:"I",I:"F",K:"L",L:"K"},ABFGIJKL:{A:"I",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"K"},ABFGHJKL:{A:"H",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"K"},ABFGHIKL:{A:"H",B:"G",D:"B",E:"A",G:"I",I:"F",K:"L",L:"K"},ABFGHIJL:{A:"H",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"I"},ABFGHIJK:{A:"H",B:"J",D:"B",E:"F",G:"A",I:"G",K:"I",L:"K"},ABEHIJKL:{A:"E",B:"J",D:"B",E:"A",G:"I",I:"H",K:"L",L:"K"},ABEGIJKL:{A:"E",B:"J",D:"B",E:"A",G:"I",I:"G",K:"L",L:"K"},ABEGHJKL:{A:"E",B:"J",D:"B",E:"A",G:"H",I:"G",K:"L",L:"K"},ABEGHIKL:{A:"E",B:"G",D:"B",E:"A",G:"I",I:"H",K:"L",L:"K"},ABEGHIJL:{A:"E",B:"J",D:"B",E:"A",G:"H",I:"G",K:"L",L:"I"},ABEGHIJK:{A:"E",B:"J",D:"B",E:"A",G:"H",I:"G",K:"I",L:"K"},ABEFIJKL:{A:"E",B:"J",D:"B",E:"A",G:"I",I:"F",K:"L",L:"K"},ABEFHJKL:{A:"E",B:"J",D:"B",E:"F",G:"A",I:"H",K:"L",L:"K"},ABEFHIKL:{A:"E",B:"I",D:"B",E:"F",G:"A",I:"H",K:"L",L:"K"},ABEFHIJL:{A:"E",B:"J",D:"B",E:"F",G:"A",I:"H",K:"L",L:"I"},ABEFHIJK:{A:"E",B:"J",D:"B",E:"F",G:"A",I:"H",K:"I",L:"K"},ABEFGJKL:{A:"E",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"K"},ABEFGIKL:{A:"E",B:"G",D:"B",E:"A",G:"I",I:"F",K:"L",L:"K"},ABEFGIJL:{A:"E",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"I"},ABEFGIJK:{A:"E",B:"J",D:"B",E:"F",G:"A",I:"G",K:"I",L:"K"},ABEFGHKL:{A:"E",B:"G",D:"B",E:"F",G:"A",I:"H",K:"L",L:"K"},ABEFGHJL:{A:"H",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"E"},ABEFGHJK:{A:"H",B:"J",D:"B",E:"F",G:"A",I:"G",K:"E",L:"K"},ABEFGHIL:{A:"E",B:"G",D:"B",E:"F",G:"A",I:"H",K:"L",L:"I"},ABEFGHIK:{A:"E",B:"G",D:"B",E:"F",G:"A",I:"H",K:"I",L:"K"},ABEFGHIJ:{A:"H",B:"J",D:"B",E:"F",G:"A",I:"G",K:"E",L:"I"},ABDHIJKL:{A:"I",B:"J",D:"B",E:"D",G:"A",I:"H",K:"L",L:"K"},ABDGIJKL:{A:"I",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"K"},ABDGHJKL:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"K"},ABDGHIKL:{A:"I",B:"G",D:"B",E:"D",G:"A",I:"H",K:"L",L:"K"},ABDGHIJL:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"I"},ABDGHIJK:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"G",K:"I",L:"K"},ABDFIJKL:{A:"I",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDFHJKL:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDFHIKL:{A:"H",B:"I",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDFHIJL:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABDFHIJK:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABDFGJKL:{A:"F",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"K"},ABDFGIKL:{A:"I",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDFGIJL:{A:"F",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"I"},ABDFGIJK:{A:"F",B:"J",D:"B",E:"D",G:"A",I:"G",K:"I",L:"K"},ABDFGHKL:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDFGHJL:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"J"},ABDFGHJK:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"J",L:"K"},ABDFGHIL:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABDFGHIK:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABDFGHIJ:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"I",L:"J"},ABDEIJKL:{A:"E",B:"J",D:"B",E:"A",G:"I",I:"D",K:"L",L:"K"},ABDEHJKL:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"H",K:"L",L:"K"},ABDEHIKL:{A:"E",B:"I",D:"B",E:"D",G:"A",I:"H",K:"L",L:"K"},ABDEHIJL:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"H",K:"L",L:"I"},ABDEHIJK:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"H",K:"I",L:"K"},ABDEGJKL:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"K"},ABDEGIKL:{A:"E",B:"G",D:"B",E:"A",G:"I",I:"D",K:"L",L:"K"},ABDEGIJL:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"I"},ABDEGIJK:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"G",K:"I",L:"K"},ABDEGHKL:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"H",K:"L",L:"K"},ABDEGHJL:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"E"},ABDEGHJK:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"G",K:"E",L:"K"},ABDEGHIL:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"H",K:"L",L:"I"},ABDEGHIK:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"H",K:"I",L:"K"},ABDEGHIJ:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"G",K:"E",L:"I"},ABDEFJKL:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDEFIKL:{A:"E",B:"I",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDEFIJL:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABDEFIJK:{A:"E",B:"J",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABDEFHKL:{A:"H",B:"E",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDEFHJL:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"E"},ABDEFHJK:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"F",K:"E",L:"K"},ABDEFHIL:{A:"H",B:"E",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABDEFHIK:{A:"H",B:"E",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABDEFHIJ:{A:"H",B:"J",D:"B",E:"D",G:"A",I:"F",K:"E",L:"I"},ABDEFGKL:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABDEFGJL:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"J"},ABDEFGJK:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"F",K:"J",L:"K"},ABDEFGIL:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABDEFGIK:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABDEFGIJ:{A:"E",B:"G",D:"B",E:"D",G:"A",I:"F",K:"I",L:"J"},ABDEFGHL:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"E"},ABDEFGHK:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"E",L:"K"},ABDEFGHJ:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"E",L:"J"},ABDEFGHI:{A:"H",B:"G",D:"B",E:"D",G:"A",I:"F",K:"E",L:"I"},ABCHIJKL:{A:"I",B:"J",D:"B",E:"C",G:"A",I:"H",K:"L",L:"K"},ABCGIJKL:{A:"I",B:"J",D:"B",E:"C",G:"A",I:"G",K:"L",L:"K"},ABCGHJKL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"G",K:"L",L:"K"},ABCGHIKL:{A:"I",B:"G",D:"B",E:"C",G:"A",I:"H",K:"L",L:"K"},ABCGHIJL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"G",K:"L",L:"I"},ABCGHIJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"G",K:"I",L:"K"},ABCFIJKL:{A:"I",B:"J",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCFHJKL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCFHIKL:{A:"H",B:"I",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCFHIJL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"L",L:"I"},ABCFHIJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"I",L:"K"},ABCFGJKL:{A:"C",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"K"},ABCFGIKL:{A:"I",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCFGIJL:{A:"C",B:"J",D:"B",E:"F",G:"A",I:"G",K:"L",L:"I"},ABCFGIJK:{A:"C",B:"J",D:"B",E:"F",G:"A",I:"G",K:"I",L:"K"},ABCFGHKL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCFGHJL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"J"},ABCFGHJK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"J",L:"K"},ABCFGHIL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"I"},ABCFGHIK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"I",L:"K"},ABCFGHIJ:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"I",L:"J"},ABCEIJKL:{A:"E",B:"J",D:"B",E:"A",G:"I",I:"C",K:"L",L:"K"},ABCEHJKL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"H",K:"L",L:"K"},ABCEHIKL:{A:"E",B:"I",D:"B",E:"C",G:"A",I:"H",K:"L",L:"K"},ABCEHIJL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"H",K:"L",L:"I"},ABCEHIJK:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"H",K:"I",L:"K"},ABCEGJKL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"G",K:"L",L:"K"},ABCEGIKL:{A:"E",B:"G",D:"B",E:"A",G:"I",I:"C",K:"L",L:"K"},ABCEGIJL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"G",K:"L",L:"I"},ABCEGIJK:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"G",K:"I",L:"K"},ABCEGHKL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"H",K:"L",L:"K"},ABCEGHJL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"G",K:"L",L:"E"},ABCEGHJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"G",K:"E",L:"K"},ABCEGHIL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"H",K:"L",L:"I"},ABCEGHIK:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"H",K:"I",L:"K"},ABCEGHIJ:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"G",K:"E",L:"I"},ABCEFJKL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCEFIKL:{A:"E",B:"I",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCEFIJL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"F",K:"L",L:"I"},ABCEFIJK:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"F",K:"I",L:"K"},ABCEFHKL:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCEFHJL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"L",L:"E"},ABCEFHJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"E",L:"K"},ABCEFHIL:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"F",K:"L",L:"I"},ABCEFHIK:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"F",K:"I",L:"K"},ABCEFHIJ:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"E",L:"I"},ABCEFGKL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"K"},ABCEFGJL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"J"},ABCEFGJK:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"F",K:"J",L:"K"},ABCEFGIL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"I"},ABCEFGIK:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"F",K:"I",L:"K"},ABCEFGIJ:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"F",K:"I",L:"J"},ABCEFGHL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"L",L:"E"},ABCEFGHK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"E",L:"K"},ABCEFGHJ:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"E",L:"J"},ABCEFGHI:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"E",L:"I"},ABCDIJKL:{A:"I",B:"J",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDHJKL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDHIKL:{A:"H",B:"I",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDHIJL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"D",K:"L",L:"I"},ABCDHIJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"D",K:"I",L:"K"},ABCDGJKL:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"K"},ABCDGIKL:{A:"I",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDGIJL:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"G",K:"L",L:"I"},ABCDGIJK:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"G",K:"I",L:"K"},ABCDGHKL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDGHJL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"J"},ABCDGHJK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"J",L:"K"},ABCDGHIL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"I"},ABCDGHIK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"I",L:"K"},ABCDGHIJ:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"I",L:"J"},ABCDFJKL:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABCDFIKL:{A:"C",B:"I",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABCDFIJL:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABCDFIJK:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABCDFHKL:{A:"H",B:"F",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDFHJL:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"H"},ABCDFHJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"D",L:"K"},ABCDFHIL:{A:"H",B:"F",D:"B",E:"C",G:"A",I:"D",K:"L",L:"I"},ABCDFHIK:{A:"H",B:"F",D:"B",E:"C",G:"A",I:"D",K:"I",L:"K"},ABCDFHIJ:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"D",L:"I"},ABCDFGKL:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABCDFGJL:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"J"},ABCDFGJK:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"J",L:"K"},ABCDFGIL:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABCDFGIK:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABCDFGIJ:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"I",L:"J"},ABCDFGHL:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"H"},ABCDFGHK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"D",L:"K"},ABCDFGHJ:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"D",L:"J"},ABCDFGHI:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"D",L:"I"},ABCDEJKL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDEIKL:{A:"E",B:"I",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDEIJL:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"D",K:"L",L:"I"},ABCDEIJK:{A:"E",B:"J",D:"B",E:"C",G:"A",I:"D",K:"I",L:"K"},ABCDEHKL:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDEHJL:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"D",K:"L",L:"E"},ABCDEHJK:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"D",K:"E",L:"K"},ABCDEHIL:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"D",K:"L",L:"I"},ABCDEHIK:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"D",K:"I",L:"K"},ABCDEHIJ:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"D",K:"E",L:"I"},ABCDEGKL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"K"},ABCDEGJL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"J"},ABCDEGJK:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"D",K:"J",L:"K"},ABCDEGIL:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"I"},ABCDEGIK:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"D",K:"I",L:"K"},ABCDEGIJ:{A:"E",B:"G",D:"B",E:"C",G:"A",I:"D",K:"I",L:"J"},ABCDEGHL:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"L",L:"E"},ABCDEGHK:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"E",L:"K"},ABCDEGHJ:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"E",L:"J"},ABCDEGHI:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"D",K:"E",L:"I"},ABCDEFKL:{A:"C",B:"E",D:"B",E:"D",G:"A",I:"F",K:"L",L:"K"},ABCDEFJL:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"L",L:"E"},ABCDEFJK:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"E",L:"K"},ABCDEFIL:{A:"C",B:"E",D:"B",E:"D",G:"A",I:"F",K:"L",L:"I"},ABCDEFIK:{A:"C",B:"E",D:"B",E:"D",G:"A",I:"F",K:"I",L:"K"},ABCDEFIJ:{A:"C",B:"J",D:"B",E:"D",G:"A",I:"F",K:"E",L:"I"},ABCDEFHL:{A:"H",B:"F",D:"B",E:"C",G:"A",I:"D",K:"L",L:"E"},ABCDEFHK:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"F",K:"D",L:"K"},ABCDEFHJ:{A:"H",B:"J",D:"B",E:"C",G:"A",I:"F",K:"D",L:"E"},ABCDEFHI:{A:"H",B:"E",D:"B",E:"C",G:"A",I:"F",K:"D",L:"I"},ABCDEFGL:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"L",L:"E"},ABCDEFGK:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"E",L:"K"},ABCDEFGJ:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"E",L:"J"},ABCDEFGI:{A:"C",B:"G",D:"B",E:"D",G:"A",I:"F",K:"E",L:"I"},ABCDEFGH:{A:"H",B:"G",D:"B",E:"C",G:"A",I:"F",K:"D",L:"E"}};
function getGroupStandingForBracket(g,p){
  return p?predictedGroupStanding(g,p):actualGroupStanding(g);
}
function bestThirdsForBracket(p){
  const thirds=[]; let closed=0;
  groupLetters().forEach(g=>{
    const st=getGroupStandingForBracket(g,p);
    if(!st||st.length<4)return;
    closed++;
    thirds.push({...st[2],grupo:g});
  });
  if(!p && closed<groupLetters().length)return {thirds:[],closed,total:groupLetters().length,complete:false};
  thirds.sort((a,b)=>(b.pts??0)-(a.pts??0)||(b.gd??0)-(a.gd??0)||(b.gf??0)-(a.gf??0)||(a.gc??0)-(b.gc??0)||String(a.team).localeCompare(String(b.team)));
  return {thirds:thirds.slice(0,8),closed,total:groupLetters().length,complete:p?true:closed===groupLetters().length};
}
function resolveGroupSlot(slot,p){
  const st=getGroupStandingForBracket(slot.group,p);
  if(!st||!st[slot.pos-1])return null;
  return {team:st[slot.pos-1].team,source:slot.pos+slot.group};
}
function thirdPlaceAssignment(p){
  const best=bestThirdsForBracket(p);
  if(!best.complete||best.thirds.length<8)return null;
  const key=best.thirds.map(x=>x.grupo).slice().sort().join('');
  const assign=THIRD_PLACE_TABLE[key];
  if(!assign)return null;
  const byGroup={};
  best.thirds.forEach(x=>{byGroup[x.grupo]=x;});
  return {assign,byGroup};
}
function resolveThirdSlot(anchorGroup,thirdRes){
  if(!thirdRes)return null;
  const targetGroup=thirdRes.assign[anchorGroup];
  const found=targetGroup&&thirdRes.byGroup[targetGroup];
  if(!found)return null;
  return {team:found.team,source:'3'+found.grupo};
}
function r32Matchups(p){
  const out=[];
  const thirdRes=thirdPlaceAssignment(p);
  R32_SLOTS.forEach(slot=>{
    const a=resolveGroupSlot(slot.a,p);
    const b=slot.b.third?resolveThirdSlot(slot.a.group,thirdRes):resolveGroupSlot(slot.b,p);
    if(a&&b)out.push({id:slot.id,a:a.team,b:b.team,aSource:a.source,bSource:b.source,key:orderedPairKey(a.team,b.team)});
  });
  return out;
}
function r32ExactMatchupBonus(p){return knockoutExactMatchupBonus(p,'16avos')}
const BRACKET_LINKS={
  p089:['p073','p076'], p090:['p075','p078'], p091:['p074','p077'], p092:['p079','p080'],
  p093:['p084','p083'], p094:['p082','p081'], p095:['p087','p086'], p096:['p085','p088'],
  p097:['p089','p090'], p098:['p093','p094'], p099:['p091','p092'], p100:['p095','p096'],
  p101:['p097','p098'], p102:['p099','p100'], p104:['p101','p102']
};
function predWinnerForMatch(p,matchup){
  if(!matchup||!p)return null;
  const pr=p.predicciones?.[matchup.id];
  if(!pr || pr.golesLocal===undefined || pr.golesVisitante===undefined)return null;
  const gl=+pr.golesLocal, gv=+pr.golesVisitante;
  if(gl>gv)return matchup.a;
  if(gv>gl)return matchup.b;
  return null;
}
function predLoserForMatch(p,matchup){
  if(!matchup||!p)return null;
  const pr=p.predicciones?.[matchup.id];
  if(!pr || pr.golesLocal===undefined || pr.golesVisitante===undefined)return null;
  const gl=+pr.golesLocal, gv=+pr.golesVisitante;
  if(gl>gv)return matchup.b;
  if(gv>gl)return matchup.a;
  return null;
}
function participantKnockoutMatchups(p){
  const map={};
  // OJO: no usar r32Matchups(p) aquí. Esa función SALTA (no empuja nada al arreglo)
  // los cruces que no logra resolver, así que su índice ya no corresponde a la
  // posición real del cruce en R32_SLOTS. Si eso pasa, todos los cruces siguientes
  // quedan desalineados y terminan comparándose contra el partido equivocado
  // (ej.: el cruce de p084 termina comparado como si fuera el de p081).
  // Por eso aquí se recorre R32_SLOTS directamente, para que el índice i
  // siempre corresponda a 73+i sin importar cuántos cruces no se resuelvan.
  const thirdRes=thirdPlaceAssignment(p);
  R32_SLOTS.forEach((slot,i)=>{
    const a=resolveGroupSlot(slot.a,p);
    const b=slot.b.third?resolveThirdSlot(slot.a.group,thirdRes):resolveGroupSlot(slot.b,p);
    if(!a||!b)return;
    const id='p'+String(73+i).padStart(3,'0');
    map[id]={id,a:a.team,b:b.team,key:orderedPairKey(a.team,b.team)};
  });
  Object.keys(BRACKET_LINKS).forEach(id=>{
    const [x,y]=BRACKET_LINKS[id];
    const a=predWinnerForMatch(p,map[x]);
    const b=predWinnerForMatch(p,map[y]);
    if(a&&b)map[id]={id,a,b,key:orderedPairKey(a,b)};
  });
  // Tercer puesto (p103): se juega entre los perdedores de las semifinales (p101/p102),
  // no está en BRACKET_LINKS porque ese mapa solo propaga ganadores.
  const l101=predLoserForMatch(p,map['p101']);
  const l102=predLoserForMatch(p,map['p102']);
  if(l101&&l102)map['p103']={id:'p103',a:l101,b:l102,key:orderedPairKey(l101,l102)};
  return map;
}
function realPhaseMatchups(phase){
  return phaseMatches(phase).filter(m=>m.local&&m.visitante&&!/^Por definir/i.test(m.local)&&!/^Por definir/i.test(m.visitante)).map(m=>({id:m.id,a:m.local,b:m.visitante,key:orderedPairKey(m.local,m.visitante)}));
}
function knockoutExactMatchupBonus(p,phase=null){
  const pred=participantKnockoutMatchups(p);
  const phases=phase?[phase]:Object.keys(KO_PHASES);
  const detail=[]; let total=0,available=0;
  // Una llave solo suma puntos cuando ese partido ya se jugó (cierre de los 90 min).
  // Aunque el cruce quede definido antes (p. ej. cuartos ya tiene los dos equipos por
  // los resultados de octavos), no se cuenta hasta que el partido se dispute, igual que
  // el marcador. Así el total no se adelanta a la planilla oficial.
  const playedIds=new Set((typeof MATCHES!=='undefined'?MATCHES:[]).filter(isScoreable).map(m=>m.id));
  phases.forEach(ph=>{
    realPhaseMatchups(ph).forEach(real=>{
      if(!playedIds.has(real.id))return;
      available++;
      const pm=pred[real.id];
      if(pm && pm.key===real.key){
        total+=EXACT_MATCHUP_BONUS;
        detail.push({...real,phase:ph,pts:EXACT_MATCHUP_BONUS});
      }
    });
  });
  return {total,hits:detail.length,available,detail};
}
function knockoutMatches(){return MATCHES.filter(m=>/^p(0?7[3-9]|0?8[0-9]|0?9[0-9]|10[0-4])$/.test(m.id))}
function phaseMatches(phase){
  const ids=new Set(KO_PHASES[phase].ids);
  return MATCHES.filter(m=>ids.has(m.id));
}

// Calcula el puntaje total de un participante: partidos jugados (marcador/resultado)
// + bono de posiciones de grupo + bono de llaves exactas de eliminatoria.
// `played` es la lista de partidos ya jugados (filter(isScoreable)) contra la que se
// califican los marcadores; el resto (bonos) usa el arreglo global MATCHES.
function computeParticipantScore(p,played){
  let pts=0,ex=0,hit=0,last=[];
  (played||[]).forEach(m=>{
    const pr=p.predicciones?.[m.id]; if(!pr)return;
    const s=points(pr.golesLocal,pr.golesVisitante,m.golesLocal,m.golesVisitante);
    pts+=s;
    const exact=+pr.golesLocal===+m.golesLocal&&+pr.golesVisitante===+m.golesVisitante;
    const ok=outcome(+pr.golesLocal,+pr.golesVisitante)===outcome(+m.golesLocal,+m.golesVisitante);
    if(exact)ex++;if(ok)hit++;
    last.push({m,pr,s,exact,ok});
  });
  const groupBonus=groupPositionBonus(p);
  const keyBonus=knockoutExactMatchupBonus(p);
  const honor=honorBonus(p);
  pts+=groupBonus.total+keyBonus.total+honor.total;
  return {pts,exact:ex,hit,last,groupBonus,keyBonus,honor};
}

function cleanHonorTeam(value){
  const raw=String(value||'').trim();
  if(!raw)return '';
  // Algunas celdas de Excel exportaron códigos internos de la llave (W101, L101, 1K)
  // en vez del país. No deben mostrarse como equipos favoritos.
  if(/^W\d+$/i.test(raw) || /^L\d+$/i.test(raw) || /^\d+[A-Z]$/i.test(raw))return '';
  return raw;
}
function normalizePlayer(name){
  if(!name)return null;
  const n=(name||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  if(n.includes('mbapp'))return'Kylian Mbappé';
  if(n.includes('yamal'))return'Lamine Yamal';
  if(n.includes('kane')&&!n.includes('fernand'))return'Harry Kane';
  if(n.includes('haaland'))return'Erling Haaland';
  if(n.includes('alvarez')||n.includes('julian'))return'Julián Álvarez';
  if(n.includes('ronaldo')||n.includes('cristiano'))return'Cristiano Ronaldo';
  if(n.includes('diaz'))return'Luis Díaz';
  if(n.includes('vitinha'))return'Vitinha';
  if(n.includes('pedri'))return'Pedri';
  if((n.includes('fernandes')||n.includes('bruno'))&&!n.includes('ronaldo'))return'Bruno Fernandes';
  if(n.includes('messi')||n.includes('lionel'))return'Lionel Messi';
  return name.trim();
}

// Puntos de la tabla de posiciones final y de los premios individuales (reglas de la
// polla). Campeón/subcampeón/3°/4° puesto se derivan solos de la final (p104) y el
// partido por el tercer puesto (p103) una vez se juegan. Nadie predijo un "4to puesto"
// explícito, así que se usa la misma predicción de tercer_puesto: si su equipo termina
// perdiendo ese partido (el 4° real) en vez de ganarlo (el 3° real), se le abona el
// bono de 4to puesto — es lo más parecido a "acertó quién llega a ese partido".
// Botín/Balón de Oro/Plata/Bronce no salen de ningún resultado de partido (son premios
// individuales que anuncia FIFA al final del torneo): se cargan a mano en
// RES.premios_oficiales cuando se sepan; mientras ese campo no exista, no suman nada.
const FINAL_PLACEMENT_BONUS={campeon:60,subcampeon:20,tercer_puesto:10,cuarto_puesto:5};
const HONOR_PLAYER_BONUS={botin_oro:40,botin_plata:30,botin_bronce:20,balon_oro:40,balon_plata:30,balon_bronce:20};
function officialFinalPlacements(){
  const final=(MATCHES||[]).find(m=>m.id==='p104');
  const third=(MATCHES||[]).find(m=>m.id==='p103');
  const out={campeon:null,subcampeon:null,tercer_puesto:null,cuarto_puesto:null};
  if(final&&isFinal(final)&&hasRealTeams(final)){
    const w=koAdvancer(final);
    if(w){out.campeon=w;out.subcampeon=(sameTeam(final.local,w)?final.visitante:final.local);}
  }
  if(third&&isFinal(third)&&hasRealTeams(third)){
    const w=koAdvancer(third);
    if(w){out.tercer_puesto=w;out.cuarto_puesto=(sameTeam(third.local,w)?third.visitante:third.local);}
  }
  return out;
}
function honorBonus(p){
  const h=p.honor||{};
  const official=officialFinalPlacements();
  let total=0; const detail=[];
  const pickCampeon=cleanHonorTeam(h.campeon);
  if(official.campeon&&pickCampeon&&sameTeam(pickCampeon,official.campeon)){
    total+=FINAL_PLACEMENT_BONUS.campeon;detail.push({tipo:'campeon',pts:FINAL_PLACEMENT_BONUS.campeon,team:official.campeon});
  }
  const pickSub=cleanHonorTeam(h.subcampeon);
  if(official.subcampeon&&pickSub&&sameTeam(pickSub,official.subcampeon)){
    total+=FINAL_PLACEMENT_BONUS.subcampeon;detail.push({tipo:'subcampeon',pts:FINAL_PLACEMENT_BONUS.subcampeon,team:official.subcampeon});
  }
  const pickTercero=cleanHonorTeam(h.tercer_puesto);
  if(pickTercero&&official.tercer_puesto&&sameTeam(pickTercero,official.tercer_puesto)){
    total+=FINAL_PLACEMENT_BONUS.tercer_puesto;detail.push({tipo:'tercer_puesto',pts:FINAL_PLACEMENT_BONUS.tercer_puesto,team:official.tercer_puesto});
  }else if(pickTercero&&official.cuarto_puesto&&sameTeam(pickTercero,official.cuarto_puesto)){
    total+=FINAL_PLACEMENT_BONUS.cuarto_puesto;detail.push({tipo:'cuarto_puesto',pts:FINAL_PLACEMENT_BONUS.cuarto_puesto,team:official.cuarto_puesto});
  }
  const oficialesJugadores=(typeof RES!=='undefined'&&RES&&RES.premios_oficiales)||{};
  Object.keys(HONOR_PLAYER_BONUS).forEach(campo=>{
    const realWinner=oficialesJugadores[campo];
    if(!realWinner)return;
    const pick=normalizePlayer(h[campo]);
    const real=normalizePlayer(realWinner);
    if(pick&&real&&pick===real){
      total+=HONOR_PLAYER_BONUS[campo];detail.push({tipo:campo,pts:HONOR_PLAYER_BONUS[campo],team:real});
    }
  });
  return {total,detail};
}
