import { useState } from 'react'
import { useAuth } from '../AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [error, setError] = useState(null)

  const entrar = async () => {
    setError(null)
    try {
      await login()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="centrado login">
      <h1>Elsa</h1>
      <button className="google" onClick={entrar}>
        Entrar con Google
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  )
}
