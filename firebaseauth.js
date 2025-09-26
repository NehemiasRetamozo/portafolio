// Import Firebase v12.3.0 (Auth + Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Config (tus claves)
const firebaseConfig = {
  apiKey: "AIzaSyCo3llrVhgJroj1NcM4tGiKOJQVwRIx4FU",
  authDomain: "login-form-6f237.firebaseapp.com",
  projectId: "login-form-6f237",
  storageBucket: "login-form-6f237.firebasestorage.app",
  messagingSenderId: "711287319130",
  appId: "1:711287319130:web:92eec814baf16a665d8663",
  measurementId: "G-H6H8BCWJ35"
};

// Init
const app = initializeApp(firebaseConfig);

// Helper mensajes
function showMessage(message, divId){
  const el = document.getElementById(divId);
  if(!el) return;
  el.style.display="block";
  el.textContent=message;
  el.style.opacity=1;
  setTimeout(()=>{ el.style.opacity=0; },5000);
}

/* ===== Registro ===== */
document.getElementById('submitSignUp')?.addEventListener('click', (e)=>{
  e.preventDefault();
  const email = document.getElementById('rEmail').value;
  const password = document.getElementById('rPassword').value;
  const firstName = document.getElementById('fName').value;
  const lastName  = document.getElementById('lName').value;

  const auth = getAuth();
  const db   = getFirestore();

  createUserWithEmailAndPassword(auth,email,password)
  .then((cred)=>{
    const user = cred.user;
    const userData = { email, firstName, lastName };
    showMessage('Cuenta creada exitosamente','signUpMessage');

    const ref = doc(db,'users',user.uid);
    setDoc(ref,userData)
      .then(()=>{ window.location.href='login.html'; })
      .catch(err=>console.error('error writing document',err));
  })
  .catch((error)=>{
    if(error.code==='auth/email-already-in-use'){
      showMessage('La dirección de correo electrónico ya existe !!!','signUpMessage');
    }else{
      showMessage('no se puede crear usuario','signUpMessage');
    }
  });
});

/* ===== Login ===== */
document.getElementById('submitSignIn')?.addEventListener('click', (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const auth = getAuth();

  signInWithEmailAndPassword(auth,email,password)
  .then((cred)=>{
    showMessage('inicio de sesión es exitoso','signInMessage');
    const user = cred.user;
    localStorage.setItem('loggedInUserId', user.uid);
    window.location.href='cuenta.html';
  })
  .catch((error)=>{
    if(error.code==='auth/invalid-credential'){
      showMessage('Correo electrónico o contraseña incorrectos','signInMessage');
    }else{
      showMessage('La cuenta no existe','signInMessage');
    }
  });
});
