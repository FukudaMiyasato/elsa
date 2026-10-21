import { useRef, useState } from 'react'
import { useAuth } from '../AuthContext'
import { comprimirFoto, enviar } from '../envios'

// A 24 kbps, 3 minutos son ~540 KB: entra en un documento de Firestore.
const MAX_SEGUNDOS_AUDIO = 180
const BITRATE_AUDIO = 24000

export default function Chat() {
  const { user } = useAuth()
  const [grabando, setGrabando] = useState(false)
  const [restante, setRestante] = useState(MAX_SEGUNDOS_AUDIO)
  const [estado, setEstado] = useState(null)
  const grabadorRef = useRef(null)
  const inputFotoRef = useRef(null)

  const subir = async (tipo, obtenerBlob) => {
    setEstado({ texto: tipo === 'audio' ? 'Enviando audio…' : 'Enviando foto…' })
    try {
      await enviar(user, tipo, await obtenerBlob())
      setEstado({ texto: tipo === 'audio' ? 'Audio enviado ✓' : 'Foto enviada ✓', ok: true })
    } catch (e) {
      setEstado({ texto: `Error: ${e.message}`, error: true })
    }
  }

  const alternarAudio = async () => {
    if (grabando) {
      grabadorRef.current?.stop()
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const grabador = new MediaRecorder(stream, { audioBitsPerSecond: BITRATE_AUDIO })
      const partes = []
      let segundos = MAX_SEGUNDOS_AUDIO
      const reloj = setInterval(() => {
        segundos -= 1
        setRestante(segundos)
        if (segundos <= 0) grabador.stop()
      }, 1000)

      grabador.ondataavailable = (e) => e.data.size && partes.push(e.data)
      grabador.onstop = () => {
        clearInterval(reloj)
        stream.getTracks().forEach((t) => t.stop())
        setGrabando(false)
        subir('audio', () => new Blob(partes, { type: grabador.mimeType }))
      }
      grabador.start()
      grabadorRef.current = grabador
      setRestante(MAX_SEGUNDOS_AUDIO)
      setGrabando(true)
      setEstado({ texto: 'Grabando… toca de nuevo para enviar' })
    } catch (e) {
      setEstado({ texto: `No se pudo usar el micrófono: ${e.message}`, error: true })
    }
  }

  const alSeleccionarFoto = (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (archivo) subir('foto', () => comprimirFoto(archivo))
  }

  const mmss = `${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, '0')}`

  return (
    <div className="chat">
      <button
        className={`grande audio ${grabando ? 'activo' : ''}`}
        onClick={alternarAudio}
      >
        <span className="icono">{grabando ? '⏹' : '🎙️'}</span>
        {grabando ? `Detener y enviar (${mmss})` : 'Enviar audio'}
      </button>

      <button
        className="grande foto"
        onClick={() => inputFotoRef.current.click()}
        disabled={grabando}
      >
        <span className="icono">📷</span>
        Tomar foto
      </button>
      <input
        ref={inputFotoRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={alSeleccionarFoto}
      />

      {estado && (
        <p className={`estado ${estado.ok ? 'ok' : ''} ${estado.error ? 'error' : ''}`}>
          {estado.texto}
        </p>
      )}
    </div>
  )
}
