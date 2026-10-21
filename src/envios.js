import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore'
import { db } from './firebase'

// Firestore admite documentos de hasta 1 MiB; dejamos margen para el base64.
export const MAX_BYTES = 700 * 1024

const MAX_LADO_FOTO = 1600

function aDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.onerror = () => reject(lector.error)
    lector.readAsDataURL(blob)
  })
}

// Redimensiona y recomprime la foto a JPEG hasta que quepa en MAX_BYTES.
export async function comprimirFoto(archivo) {
  const imagen = await createImageBitmap(archivo)
  let lado = MAX_LADO_FOTO
  let calidad = 0.8

  for (let intento = 0; intento < 8; intento++) {
    const escala = Math.min(1, lado / Math.max(imagen.width, imagen.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(imagen.width * escala)
    canvas.height = Math.round(imagen.height * escala)
    canvas.getContext('2d').drawImage(imagen, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', calidad))
    if (blob.size <= MAX_BYTES) return blob

    if (calidad > 0.5) calidad -= 0.15
    else lado = Math.round(lado * 0.75)
  }
  throw new Error('No se pudo comprimir la foto lo suficiente')
}

// Guarda los metadatos en `envios` y el contenido en `archivos` con el mismo id,
// así el receptor puede listar sin descargar todos los archivos de golpe.
export async function enviar(user, tipo, blob) {
  if (blob.size > MAX_BYTES) throw new Error('El archivo es demasiado grande')

  const datos = await aDataUrl(blob)
  const envio = doc(collection(db, 'envios'))
  const lote = writeBatch(db)

  lote.set(envio, {
    tipo,
    uid: user.uid,
    nombre: user.displayName,
    email: user.email,
    creadoEn: serverTimestamp(),
  })
  lote.set(doc(db, 'archivos', envio.id), { uid: user.uid, datos })

  await lote.commit()
}
