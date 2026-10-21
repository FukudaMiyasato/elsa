import { useRef, useState } from 'react'
import { useAuth } from '../AuthContext'
import { enviar } from '../envios'

export default function Chat() {
  const { user } = useAuth()
  const [grabando, setGrabando] = useState(false)
  const [estado, setEstado] = useState(null)
  const grabadorRef = useRef(null)
  const inputFotoRef = useRef(null)

  const subir = async (tipo, blob) => {
    setEstado({ texto: tipo === 'audio' ? 'Enviando audio…' : 'Enviando foto…' })
    try {
      await enviar(user, tipo, blob)
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
      const grabador = new MediaRecorder(stream)
      const partes = []
      grabador.ondataavailable = (e) => e.data.size && partes.push(e.data)
      grabador.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        setGrabando(false)
        subir('audio', new Blob(partes, { type: grabador.mimeType }))
      }
      grabador.start()
      grabadorRef.current = grabador
      setGrabando(true)
      setEstado({ texto: 'Grabando… toca de nuevo para enviar' })
    } catch (e) {
      setEstado({ texto: `No se pudo usar el micrófono: ${e.message}`, error: true })
    }
  }

  const alSeleccionarFoto = (e) => {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (archivo) subir('foto', archivo)
  }

  return (
    <div className="chat">
      <button
        className={`grande audio ${grabando ? 'activo' : ''}`}
        onClick={alternarAudio}
      >
        <span className="icono">{grabando ? '⏹' : '🎙️'}</span>
        {grabando ? 'Detener y enviar' : 'Enviar audio'}
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
