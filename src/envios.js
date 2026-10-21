import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from './firebase'

const EXTENSIONES = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/ogg': 'ogg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

// Sube un archivo (audio o foto) a Storage y lo registra en Firestore.
export async function enviar(user, tipo, blob) {
  const mime = blob.type.split(';')[0]
  const ext = EXTENSIONES[mime] ?? 'bin'
  const path = `envios/${user.uid}/${Date.now()}.${ext}`
  const archivo = ref(storage, path)

  await uploadBytes(archivo, blob, { contentType: mime })
  const url = await getDownloadURL(archivo)

  await addDoc(collection(db, 'envios'), {
    tipo,
    url,
    path,
    uid: user.uid,
    nombre: user.displayName,
    email: user.email,
    creadoEn: serverTimestamp(),
  })
}
