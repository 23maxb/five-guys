import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { login as apiLogin } from '../lib/api'

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const from = location.state?.from?.pathname || '/home'


    async function onSubmit(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const { token } = await apiLogin({ email, password })
            login(token)
            navigate(from, { replace: true })
        } catch (err) {
            setError(err?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 24 }}>
            <form onSubmit={onSubmit} style={{ width: 360, display: 'grid', gap: 12 }}>
                <h1 style={{ margin: 0 }}>Sign in</h1>
                <label>
                    <div>Email</div>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
                <label>
                    <div>Password</div>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
                {error && <div style={{ color: 'crimson' }}>{error}</div>}
                <button disabled={loading} type="submit" style={{ padding: 10 }}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
                {/* <button 
                    type="button" 
                    onClick={() => navigate('/home')}
                    style={{ padding: 10, marginTop: 8 }}
                >
                    Go to Home Page
                </button> */}
            </form>
        </div>
    )
}