
import { storage } from './firebaseConfig';

export const uploadFile = async (file: File): Promise<string> => {
  if (storage) {
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Erro no upload Firebase:", error);
    }
  }

  // Fallback Local (Simulação)
  await new Promise(resolve => setTimeout(resolve, 500));
  return URL.createObjectURL(file);
};

export const uploadImage = async (file: File, path: string): Promise<string> => {
  if (storage) {
    try {
      const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Erro no upload Firebase:", error);
    }
  }
  
  await new Promise(resolve => setTimeout(resolve, 800));
  return `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&fallback_path=${path}`;
};

export const getDownloadURL = async (path: string): Promise<string> => {
  return `https://example.com/simulated/${path}`;
};

export const deleteFile = async (path: string): Promise<void> => {
  if (storage) {
    try {
      const { ref, deleteObject } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js');
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
    } catch (e) {}
  }
  await new Promise(resolve => setTimeout(resolve, 300));
};
