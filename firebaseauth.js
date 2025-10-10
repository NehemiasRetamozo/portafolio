// Import Firebase v12.3.0 (igual que el resto)
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult,
  fetchSignInMethodsForEmail, setPersistence, browserLocalPersistence, signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  getFirestore, setDoc, doc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// === Config (tuya)
const firebaseConfig = {
  apiKey: "AIzaSyCo3llrVhgJroj1NcM4tGiKOJQVwRIx4FU",
  authDomain: "login-form-6f237.firebaseapp.com",
  projectId: "login-form-6f237",
  storageBucket: "login-form-6f237.firebasestorage.app",
  messagingSenderId: "711287319130",
  appId: "1:711287319130:web:92eec814baf16a665d8663",
  measurementId: "G-H6H8BCWJ35"
};

// === Init único
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// === Persistencia local
try { await setPersistence(auth, browserLocalPersistence); } catch (e) { console.warn('persistencia:', e); }

// === Helper mensajes (tu helper)
function showMessage(message, divId){
  const el = document.getElementById(divId);
  if(!el) return;
  el.style.display="block";
  el.textContent=message;
  el.style.opacity=1;
  setTimeout(()=>{ el.style.opacity=0; },5000);
}

/* ====== TU REGISTRO (intacto) ====== */
document.getElementById('submitSignUp')?.addEventListener('click', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName  = document.getElementById('lName').value;

  try{
    const cred = await createUserWithEmailAndPassword(auth,email,password);
    const user = cred.user;
    await setDoc(doc(db,'users',user.uid), {
      uid:user.uid, email, firstName, lastName, createdAt: serverTimestamp()
    }, { merge:true });
    showMessage('Cuenta creada exitosamente','signUpMessage');
    window.location.href='login.html';
  }catch(error){
    if(error.code==='auth/email-already-in-use'){
      showMessage('La dirección de correo electrónico ya existe !!!','signUpMessage');
    }else{
      showMessage('no se puede crear usuario','signUpMessage');
    }
  }
});

/* ====== TU LOGIN (intacto) ====== */
document.getElementById('submitSignIn')?.addEventListener('click', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try{
    const cred = await signInWithEmailAndPassword(auth,email,password);
    showMessage('inicio de sesión es exitoso','signInMessage');
    localStorage.setItem('loggedInUserId', cred.user.uid);
    window.location.href='cuenta.html';
  }catch(error){
    if(error.code==='auth/invalid-credential'){
      showMessage('Correo electrónico o contraseña incorrectos','signInMessage');
    }else{
      showMessage('La cuenta no existe','signInMessage');
    }
  }
});

/* ====== GOOGLE (Firebase) ====== */
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
auth.useDeviceLanguage?.();

// ---- Guardas anti-doble disparo ----
let GOOGLE_IN_PROGRESS = false;
const REDIRECT_FLAG = 'googleRedirectPending';

// Post-login común
async function afterLogin(user){
  if(!user) return;
  localStorage.setItem('loggedInUserId', user.uid);

  try{
    const ref = doc(db,'users',user.uid);
    const snap = await getDoc(ref);
    const base = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      provider: user.providerData?.[0]?.providerId || 'google',
      updatedAt: serverTimestamp()
    };
    await setDoc(ref, snap.exists()? { ...snap.data(), ...base } : base, { merge:true });
  }catch(e){ console.warn('users/{uid} write:', e); }

  // Redirección garantizada
  window.location.href = 'cuenta.html';
}

// Popup con fallback a redirect (controlado)
export async function googleSignIn(){
  if (GOOGLE_IN_PROGRESS) return; // evita doble click
  GOOGLE_IN_PROGRESS = true;

  try{
    const res = await signInWithPopup(auth, provider);
    await afterLogin(res.user);
  }catch(e){
    // Si el popup es bloqueado o cerrado, vamos por redirect UNA sola vez
    if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
      if (!sessionStorage.getItem(REDIRECT_FLAG)) {
        sessionStorage.setItem(REDIRECT_FLAG, '1');
        await signInWithRedirect(auth, provider);
      }
      return;
    }
    if (e?.code === 'auth/account-exists-with-different-credential' && e?.customData?.email){
      const methods = await fetchSignInMethodsForEmail(auth, e.customData.email);
      showMessage(`La cuenta ${e.customData.email} ya existe con: ${methods.join(', ')}`,'signInMessage');
      return;
    }
    console.error('Google Sign-In error:', e);
    showMessage('No se pudo iniciar con Google','signInMessage');
  } finally {
    // soltar el flag si seguimos en la misma página
    GOOGLE_IN_PROGRESS = false;
  }
}

// Resolver redirect (solo si realmente venimos de redirect)
export async function resolveGoogleRedirect(){
  if (!sessionStorage.getItem(REDIRECT_FLAG)) return; // no proceses si no tocó redirect
  try{
    const res = await getRedirectResult(auth);
    sessionStorage.removeItem(REDIRECT_FLAG); // limpiar pase lo que pase
    if(res?.user){ await afterLogin(res.user); }
  }catch(e){
    console.warn('resolve redirect:', e);
    showMessage('No se pudo iniciar con Google','signInMessage');
  }
}

// === Hard-bind del botón para eliminar listeners previos ===
function hardBindClickById(id, handler){
  const btn = document.getElementById(id);
  if(!btn) return;
  const clone = btn.cloneNode(true);      // borra todos los event listeners previos
  btn.replaceWith(clone);                 // reemplaza en DOM
  clone.addEventListener('click', (ev)=>{ // enlaza SOLO a Firebase
    ev.preventDefault();
    handler();
  }, { capture:true });
}

function wireGoogleButtons(){
  hardBindClickById('googleSignIn', googleSignIn);
  hardBindClickById('googleSignUp',  googleSignIn);
}

// Conectar y resolver en cuanto cargue login.html
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  wireGoogleButtons();
  resolveGoogleRedirect();
} else {
  document.addEventListener('DOMContentLoaded', ()=>{
    wireGoogleButtons();
    resolveGoogleRedirect();
  });
}

// (Opcional) logout para usermenu.js
export async function doSignOut(){
  try{ await signOut(auth); localStorage.removeItem('loggedInUserId'); }
  catch(e){ console.warn(e); }
}
