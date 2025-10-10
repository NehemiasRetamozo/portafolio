/* ===== Off-canvas ===== */
const body = document.body;
const trigger = document.getElementById('oc-trigger');
const overlay = document.getElementById('oc-overlay');
const panel = document.getElementById('offcanvas');
const btnClose = document.getElementById('oc-close');

function closeOC(){
  body.classList.remove('oc-open');
  body.style.overflow = '';
  trigger?.setAttribute('aria-expanded','false');
  panel?.setAttribute('aria-hidden','true');
  if (overlay) overlay.hidden = true;
  trigger?.focus();
}
trigger?.addEventListener('click', ()=>{
  body.classList.add('oc-open');
  body.style.overflow = 'hidden';
  if (overlay) overlay.hidden = false;
  panel?.removeAttribute('aria-hidden');
  trigger.setAttribute('aria-expanded','true');
  btnClose?.focus();
});
btnClose?.addEventListener('click', closeOC);
overlay?.addEventListener('click', closeOC);

/* ===== Cambiar Login <-> Registro ===== */
const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInFormBox = document.getElementById('signIn');
const signUpFormBox = document.getElementById('signup');

signUpButton?.addEventListener('click', ()=>{
  signInFormBox.style.display = "none";
  signUpFormBox.style.display = "block";
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
signInButton?.addEventListener('click', ()=>{
  signInFormBox.style.display = "block";
  signUpFormBox.style.display = "none";
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
    