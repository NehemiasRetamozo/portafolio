/* Controlador Off-Canvas robusto (delegación + accesible) */
(function () {
  const S = { trigger:'#oc-trigger', overlay:'#oc-overlay', panel:'#offcanvas', close:'#oc-close' };
  const $ = s => document.querySelector(s);

  function openOC(btn){
    document.body.classList.add('oc-open');
    document.body.style.overflow = 'hidden';
    $(S.overlay).hidden = false;
    $(S.panel).removeAttribute('aria-hidden');
    btn?.setAttribute('aria-expanded','true');
    $(S.close)?.focus();
  }
  function closeOC(){
    document.body.classList.remove('oc-open');
    document.body.style.overflow = '';
    $(S.panel)?.setAttribute('aria-hidden','true');
    $(S.overlay).hidden = true;
    const t = $(S.trigger);
    t?.setAttribute('aria-expanded','false');
    t?.focus();
  }

  // Delegación (funciona aunque usermenu.js repinte el header)
  document.addEventListener('click', e=>{
    const trg = e.target.closest(S.trigger);
    if (trg) { openOC(trg); return; }
    if (e.target.closest(S.close))   { closeOC(); return; }
    if (e.target.closest(S.overlay)) { closeOC(); return; }
  });

  document.addEventListener('keydown', e=>{
    if (e.key === 'Escape' && document.body.classList.contains('oc-open')) closeOC();
  });
})();
