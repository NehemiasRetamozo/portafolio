/* ============================================================
   MENÚ DE USUARIO (nombre + desplegable “Mi Cuenta / Salir”)
   → Agregar <script type="module" src="usermenu.js"></script> antes de </body> en todas las páginas con header
   ============================================================ */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

/* --- Firebase config --- */
const firebaseConfig = {
  apiKey: "AIzaSyCo3llrVhgJroj1NcM4tGiKOJQVwRIx4FU",
  authDomain: "login-form-6f237.firebaseapp.com",
  projectId: "login-form-6f237",
  storageBucket: "login-form-6f237.firebasestorage.app",
  messagingSenderId: "711287319130",
  appId: "1:711287319130:web:92eec814baf16a665d8663",
  measurementId: "G-H6H8BCWJ35"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

/* --- CSS interno del menú --- */
(function injectUserMenuCSS(){
  const css = `
  .user-menu{position:relative;display:inline-block}
  .user-btn{
    display:inline-flex;align-items:center;gap:10px;
    padding:10px 14px;border-radius:8px;border:1px solid rgba(255,255,255,.25);
    background:rgba(255,255,255,.08);color:#fff;font-weight:700;letter-spacing:.03em;
    text-transform:none;text-decoration:none;cursor:pointer;line-height:1
  }
  .user-btn:hover{background:rgba(255,255,255,.14)}
  .user-btn .avatar{
    width:28px;height:28px;border-radius:50%;overflow:hidden;
    background:radial-gradient(120px 120px at 50% -20%, #7f5af0, #3b2db8);
    color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:900
  }
  /* ADD: imagen dentro del avatar */
  .user-btn .avatar img{width:100%;height:100%;object-fit:cover;display:block}
  .user-dropdown{
    position:absolute;top:100%;right:0;min-width:220px;margin-top:10px;
    background:#fff;color:#1b1b1b;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,.25);
    padding:8px;display:none;z-index:2000
  }
  .user-menu.open .user-dropdown{display:block}
  .user-dropdown .item{
    width:100%;display:block;padding:12px 14px;border-radius:8px;
    color:#1b1b1b;text-decoration:none;font-weight:600;text-align:left;border:none;background:none;cursor:pointer
  }
  .user-dropdown .item:hover{background:#f3f4f6}
  .user-dropdown .danger{color:#c00}
  .user-dropdown hr{border:none;border-top:1px solid #e5e7eb;margin:6px 0}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* --- Helpers DOM --- */
function findLoginLink(){
  return document.querySelector('.nav-right .cta[href="login.html"]')
      || document.querySelector('a.cta[href="login.html"]');
}

/* ADD: avatar dinámico (foto o inicial) */
function makeAvatarNode(initial, photoURL){
  const span = document.createElement('span');
  span.className = 'avatar';
  if (photoURL) {
    const img = document.createElement('img');
    img.alt = 'Avatar';
    img.src = photoURL;
    span.appendChild(img);
  } else {
    span.textContent = (initial || 'U').toUpperCase();
  }
  return span;
}

function makeUserMenu(displayName="Mi Cuenta", photoURL=""){
  const wrap = document.createElement('div');
  wrap.className = 'user-menu';

  const btn = document.createElement('button');
  btn.className = 'user-btn';
  btn.id = 'userMenuBtn';
  btn.setAttribute('aria-haspopup','true');
  btn.setAttribute('aria-expanded','false');

  const initial = (displayName||'U').trim().charAt(0).toUpperCase();
  btn.appendChild(makeAvatarNode(initial, photoURL)); // ADD: avatar con imagen si existe

  const nameSpan = document.createElement('span');
  nameSpan.className = 'user-name';
  nameSpan.textContent = displayName;
  btn.appendChild(nameSpan);

  // chevron
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width','16'); svg.setAttribute('height','16');
  svg.setAttribute('viewBox','0 0 24 24'); svg.setAttribute('fill','none'); svg.setAttribute('aria-hidden','true');
  const path = document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M6 9l6 6 6-6');
  path.setAttribute('stroke','currentColor'); path.setAttribute('stroke-width','2');
  path.setAttribute('stroke-linecap','round'); path.setAttribute('stroke-linejoin','round');
  svg.appendChild(path);
  btn.appendChild(svg);

  const dropdown = document.createElement('div');
  dropdown.className = 'user-dropdown';
  dropdown.setAttribute('role','menu');
  dropdown.setAttribute('aria-label','Menú de usuario');
  dropdown.innerHTML = `
    <a class="item" href="cuenta.html">Mi Cuenta</a>
    <hr/>
    <button class="item danger" id="logoutBtn" type="button">Salir</button>
  `;

  wrap.appendChild(btn);
  wrap.appendChild(dropdown);

  // Toggle
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    wrap.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(wrap.classList.contains('open')));
  });

  // ADD: cerrar al hacer click fuera
  document.addEventListener('click', (ev)=>{
    if (!wrap.contains(ev.target)) {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }
  });

  // ADD: cerrar con ESC
  document.addEventListener('keydown', (ev)=>{
    if (ev.key === 'Escape') {
      wrap.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
      btn.focus();
    }
  });

  return wrap;
}

function restoreLogin(originalLoginLink, slot){
  if(!originalLoginLink) return;
  slot.innerHTML = '';
  slot.appendChild(originalLoginLink);
}

/* --- Render principal --- */
(async function main(){
  const slotParent = (()=>{
    const loginLink = findLoginLink();
    return loginLink?.parentElement || document.querySelector('.nav-right') || document.body;
  })();

  const originalLoginLink = findLoginLink()?.cloneNode(true);

  async function resolveProfile(user){
    const uid = user?.uid || localStorage.getItem('loggedInUserId');
    if(!uid) return { displayName: '', photoURL: '' , email: ''};

    let displayName = '';
    let photoURL    = '';
    let email       = user?.email || '';

    // 1) Base desde Auth (Google ya trae displayName y photoURL)
    if (user) {
      displayName = user.displayName || '';
      photoURL    = user.photoURL || '';
    }

    // 2) Si hay Firestore, priorizamos sus datos si existen
    try {
      const snap = await getDoc(doc(db,'users',uid));
      if(snap.exists()){
        const d = snap.data();
        const f=(d.firstName||'').trim(), l=(d.lastName||'').trim();
        const full = `${f} ${l}`.trim();
        displayName = (d.displayName || d.fullName || full || displayName || (email? email.split('@')[0] : '')).trim();
        photoURL    = d.photoURL || photoURL;
        email       = d.email || email;
      }
    } catch {}

    if(!displayName) displayName = email?.split('@')[0] || 'Mi Cuenta';
    return { displayName, photoURL, email };
  }

  async function renderForUser(user){
    try{
      const uid = user?.uid || localStorage.getItem('loggedInUserId');
      if(!uid){ restoreLogin(originalLoginLink, slotParent); return; }

      const { displayName, photoURL } = await resolveProfile(user);

      const loginLink = findLoginLink();
      if(loginLink){
        const menu = makeUserMenu(displayName, photoURL); // ADD: pasamos foto
        loginLink.replaceWith(menu);

        menu.querySelector('#logoutBtn')?.addEventListener('click', async ()=>{
          try{
            localStorage.removeItem('loggedInUserId');
            await signOut(auth);
          }catch{}
          restoreLogin(originalLoginLink, slotParent);
          window.location.href = 'login.html';
        });
      }
    }catch{
      restoreLogin(originalLoginLink, slotParent);
    }
  }

  const cached = localStorage.getItem('loggedInUserId');
  if(cached){ await renderForUser({ uid: cached, email: '' }); }

  onAuthStateChanged(auth, async (user)=>{
    if(user){
      localStorage.setItem('loggedInUserId', user.uid);
      await renderForUser(user);
    }else{
      localStorage.removeItem('loggedInUserId');
      restoreLogin(originalLoginLink, slotParent);
    }
  });
})();
