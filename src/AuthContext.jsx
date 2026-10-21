import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from './firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // undefined = todavía cargando, null = sin sesión
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u ?? null)), [])

  const value = {
    user,
    login: () => signInWithPopup(auth, googleProvider),
    logout: () => signOut(auth),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
