import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './pages/Login'
import Chat from './pages/Chat'
import Receptor from './pages/Receptor'

function Layout() {
  const { user, logout } = useAuth()

  if (user === undefined) return <div className="centrado">Cargando…</div>
  if (!user) return <Login />

  return (
    <div className="app">
      <header className="barra">
        <nav>
          <NavLink to="/" end>Chat</NavLink>
          <NavLink to="/receptor">Receptor</NavLink>
        </nav>
        <button className="salir" onClick={logout} title={user.email}>
          Salir
        </button>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Chat />} />
          <Route path="/receptor" element={<Receptor />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AuthProvider>
  )
}
