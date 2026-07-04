// 🏆 Camino al Campeonato — render estable sin dependencias externas
// Usa las variables globales del index.html: MATCHES, KO_PHASES, koAdvancer, isFinal, isScoreable, esc, phaseMatches, fmtTime.
(function(){
  function safeEsc(v){
    if (typeof esc === 'function') return esc(v);
    return String(v ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function teamLabel(t){
    const s = String(t || '').trim();
    if (!s || /^Por definir/i.test(s) || /^Ganador/i.test(s) || /^Perdedor/i.test(s)) return '<span class="br-tbd">Por definir</span>';
    return '<b>'+safeEsc(s)+'</b>';
  }
  function matchScore(m){
    if (!m) return '';
    if (typeof isScoreable === 'function' && isScoreable(m)) return '<span class="br-score">'+safeEsc(m.golesLocal)+'-'+safeEsc(m.golesVisitante)+'</span>';
    return '<span class="br-time">'+(typeof fmtTime === 'function' ? safeEsc(fmtTime(m)) : '')+'</span>';
  }
  function advText(m){
    if (!m) return '';
    const adv = (typeof koAdvancer === 'function') ? koAdvancer(m) : (m.clasificado || m.winner || m.ganador || '');
    if (adv) return '<div class="br-adv">Clasifica: '+safeEsc(adv)+(m.definicion || m.formaClasificacion || m.formaDefinicion ? ' · '+safeEsc(m.definicion || m.formaClasificacion || m.formaDefinicion) : '')+'</div>';
    return '';
  }
  function card(m){
    if (!m) return '';
    const done = typeof isFinal === 'function' ? isFinal(m) : m.estado === 'finalizado';
    const live = m.estado === 'en_vivo';
    return '<div class="br-match '+(done?'br-done':live?'br-live':'')+'">'
      + '<div class="br-meta">'+safeEsc(m.fase || '')+' · '+safeEsc(m.id || '')+'</div>'
      + '<div class="br-row"><span>'+teamLabel(m.local)+'</span>'+matchScore(m)+'</div>'
      + '<div class="br-row"><span>'+teamLabel(m.visitante)+'</span></div>'
      + advText(m)
      + '</div>';
  }
  function idsForPhase(phase){
    if (typeof KO_PHASES !== 'undefined' && KO_PHASES[phase]) return KO_PHASES[phase].ids || [];
    const map={
      '16avos':['p073','p074','p075','p076','p077','p078','p079','p080','p081','p082','p083','p084','p085','p086','p087','p088'],
      '8vos':['p089','p090','p091','p092','p093','p094','p095','p096'],
      'Cuartos':['p097','p098','p099','p100'],
      'Semis':['p101','p102'],
      'Final':['p103','p104']
    };
    return map[phase] || [];
  }
  function matchesForPhase(phase){
    if (typeof phaseMatches === 'function') return phaseMatches(phase);
    if (typeof MATCHES === 'undefined') return [];
    const ids = new Set(idsForPhase(phase));
    return MATCHES.filter(m => ids.has(m.id));
  }
  window.refreshBracket = function(targetId){
    const el = document.getElementById(targetId || 'bracket-section-body');
    if (!el) return;
    if (typeof MATCHES === 'undefined' || !Array.isArray(MATCHES) || !MATCHES.length){
      el.innerHTML = '<div class="br-empty">Cargando llave…</div>';
      return;
    }
    const phases = [
      ['16avos','16avos de final'],
      ['8vos','Octavos de final'],
      ['Cuartos','Cuartos de final'],
      ['Semis','Semifinales'],
      ['Final','Tercer puesto / Final']
    ];
    let html = '<div class="br-header"><div><h2>🏆 Camino al campeonato</h2><p>Llaves oficiales y clasificados actualizados con resultados.json.</p></div></div>';
    html += '<div class="br-grid">';
    phases.forEach(([key,label])=>{
      const ms = matchesForPhase(key);
      html += '<div class="br-col"><h3>'+safeEsc(label)+'</h3>'+(ms.length ? ms.map(card).join('') : '<div class="br-empty">Pendiente</div>')+'</div>';
    });
    html += '</div>';
    el.innerHTML = html;
  };
  window._bracketReady = function(){ window.refreshBracket('bracket-section-body'); };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => window.refreshBracket('bracket-section-body'), 0));
  } else {
    setTimeout(() => window.refreshBracket('bracket-section-body'), 0);
  }
})();
