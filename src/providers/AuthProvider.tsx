import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { CredentialDTO, LoginDTO, RegisterDTO } from '../types/dto'
import axios, { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

interface IAuthProviderProps {
  children: ReactNode
}

interface IAuthContextType {
  isLoggedIn: boolean
  username: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  registerUser: (newUsername: string, newPassword: string, newName: string) => Promise<void>
}

const AuthContext = createContext<IAuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) throw new Error('useAuth must be used within AuthProvider')

  return context
}

const token = localStorage.getItem('token')
const user = localStorage.getItem('username')

const checkLoginStatus = async (token: string | null): Promise<boolean> => {
  if (typeof token !== 'string') return false
  try {
    const currentUser = await axios.get('http://localhost:8080/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (currentUser.status === 200) return true
  } catch (err) {
    if (err instanceof AxiosError && err.response?.status === 403) return false

    throw err
  }
  return false
}

const AuthProvider = ({ children }: IAuthProviderProps) => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedin] = useState<boolean>(false)
  const [username, setUsername] = useState<string | null>(user)

  useEffect(() => {
    checkLoginStatus(token).then((isLoggedInAlready) => {
      setIsLoggedin(isLoggedInAlready)
    })
  }, [])

  const login = async (username: string, password: string) => {
    const loginBody: LoginDTO = { username, password }

    try {
      const res = await axios.post<CredentialDTO>('http://localhost:8080/auth/login', loginBody, {
        headers: { 'Content-Type': 'application/json' },
      })

      localStorage.setItem('token', res.data.accessToken)
      localStorage.setItem('username', username)
      setIsLoggedin(true)
      setUsername(username)
    } catch (err) {
      throw new Error('Invalid username or password')
    }
  }

  const logout = async () => {
    setIsLoggedin(false)
    const url = 'http://localhost:8080/auth/logout'
    try {
      const token = localStorage.getItem('token')

      await axios.get(url, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      localStorage.clear()

      setUsername(null)

      navigate('/')
    } catch (error) {
      console.error(error)
      throw new Error('Invalid token')
    }
  }

  const registerUser = async (newUsername: string, newPassword: string, newName: string) => {
    const newUser: RegisterDTO = {
      username: newUsername,
      password: newPassword,
      name: newName,
    }

    try {
      const res = await axios.post<RegisterDTO>('http://localhost:8080/user', newUser, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log(res.data.name)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout, registerUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
