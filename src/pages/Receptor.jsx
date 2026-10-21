import { useEffect, useState } from 'react'
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

export default function Receptor() {
  const [envios, setEnvios] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [error, setError] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'envios'), orderBy('creadoEn', 'desc'), limit(100))
    return onSnapshot(
      q,
      (snap) => setEnvios(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (e) => setError(e.message),
    )
  }, [])

  if (error) return <p className="error">{error}</p>
  if (!envios) return <p className="centrado">Cargando…</p>

  const visibles = filtro === 'todos' ? envios : envios.filter((e) => e.tipo === filtro)

  return (
    <div className="receptor">
      <div className="filtros">
        {['todos', 'foto', 'audio'].map((f) => (
          <button key={f} className={filtro === f ? 'activo' : ''} onClick={() => setFiltro(f)}>
            {f === 'todos' ? 'Todos' : f === 'foto' ? 'Fotos' : 'Audios'}
          </button>
        ))}
      </div>

      {visibles.length === 0 && <p className="vacio">Todavía no hay envíos.</p>}

      <ul className="registro">
        {visibles.map((e) => (
          <li key={e.id} className="item">
            <div className="meta">
              <strong>{e.nombre || e.email}</strong>
              <span>{e.creadoEn ? e.creadoEn.toDate().toLocaleString() : 'enviando…'}</span>
            </div>
            <Contenido envio={e} />
          </li>
        ))}
      </ul>
    </div>
  )
}

// El archivo vive en `archivos/{id}`; se descarga al mostrar cada envío.
function Contenido({ envio }) {
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getDoc(doc(db, 'archivos', envio.id))
      .then((snap) => (snap.exists() ? setDatos(snap.data().datos) : setError(true)))
      .catch(() => setError(true))
  }, [envio.id])

  if (error) return <p className="vacio">No se pudo cargar el archivo.</p>
  if (!datos) return <div className="cargando-archivo" />

  return envio.tipo === 'foto' ? (
    <a href={datos} download={`foto-${envio.id}.jpg`}>
      <img src={datos} alt={`Foto de ${envio.nombre || envio.email}`} />
    </a>
  ) : (
    <audio controls src={datos} />
  )
}
