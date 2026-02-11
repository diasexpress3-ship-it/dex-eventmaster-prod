import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';

import { auth } from './firebaseConfig';

/**
 * Login do usuário
 */
export async function login(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Registo de novo usuário
 */
export async function register(email: string, password: string, displayName: string = '') {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName.trim()) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Logout do usuário
 */
export async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Observador do estado de autenticação
 */
export function onUserChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna o usuário atual
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Verifica se usuário está autenticado
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}
