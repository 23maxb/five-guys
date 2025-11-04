import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../lib/api'

export default function RegisterPage() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function onSubmit(e) {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            await apiRegister({ name, email, password })
            navigate('/login')
        } catch (err) {
            setError(err?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 24 }}>
            <form onSubmit={onSubmit} style={{ width: 360, display: 'grid', gap: 12 }}>
                <h1 style={{ margin: 0 }}>Create an account</h1>
                <label>
                    <div>Name</div>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        placeholder="Your Name"
                        required
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
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
                        minLength={8}
                        style={{ width: '100%', padding: 8 }}
                    />
                </label>
                {error && <div style={{ color: 'crimson' }}>{error}</div>}
                <button disabled={loading} type="submit" style={{ padding: 10 }}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>
            </form>
        </div>
    )
}