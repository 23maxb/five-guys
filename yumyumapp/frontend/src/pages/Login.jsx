import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { login as apiLogin } from '../lib/api'

const styles = {
    page: {
        minHeight: '100vh',
        background: '#f5f8ff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 420,
        background: '#fff',
        borderRadius: 18,
        border: '1px solid #e4e7ec',
        boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
        padding: '40px 36px',
        display: 'grid',
        gap: 18,
    },
    headingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 24,
        fontWeight: 600,
        color: '#0b162a',
    },
    arrow: {
        fontSize: 28,
    },
    subtext: {
        fontSize: 15,
        color: '#55607a',
        marginTop: -8,
    },
    fieldGroup: {
        display: 'grid',
        gap: 6,
    },
    label: {
        fontWeight: 500,
        color: '#1f2937',
    },
    input: (focused) => ({
        height: 52,
        borderRadius: 14,
        border: focused ? '2px solid #1d4ed8' : '1px solid #d0d5dd',
        padding: '0 18px',
        fontSize: 16,
        color: '#111827',
        background: '#fff',
        boxShadow: focused ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'inset 0 1px 2px rgba(15,23,42,0.08)',
        transition: 'border 120ms ease, box-shadow 120ms ease',
    }),
    button: (disabled) => ({
        height: 56,
        borderRadius: 16,
        border: 'none',
        background: disabled ? '#1e293b' : '#0b1224',
        color: '#fff',
        fontSize: 18,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 18px 30px rgba(15, 23, 42, 0.35)',
        transition: 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease',
        opacity: disabled ? 0.75 : 1,
    }),
    statusMessage: (isError) => ({
        fontSize: 14,
        fontWeight: 500,
        color: isError ? '#b91c1c' : '#15803d',
        marginTop: 4,
    }),
}

export default function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [focusedField, setFocusedField] = useState(null)

    const from = location.state?.from?.pathname || '/home'

    async function onSubmit(e) {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)
        try {
            const { token } = await apiLogin({ email, password })
            login(token)
            setSuccess('Log in successful')
            navigate(from, { replace: true })
        } catch (err) {
            setError(err?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <form onSubmit={onSubmit} style={styles.card}>
                <div style={styles.headingRow}>
                    <span style={styles.arrow}>→</span>
                    <span>Welcome to YumYumApp</span>
                </div>
                <p style={styles.subtext}>Log in with your YumYumApp account to continue.</p>

                <label style={styles.fieldGroup}>
                    <span style={styles.label}>Email</span>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        type="email"
                        placeholder="test@test.com"
                        required
                        style={styles.input(focusedField === 'email')}
                    />
                </label>

                <label style={styles.fieldGroup}>
                    <span style={styles.label}>Password</span>
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        type="password"
                        placeholder="••••••••"
                        required
                        style={styles.input(focusedField === 'password')}
                    />
                </label>

                {error && <div style={styles.statusMessage(true)}>{error}</div>}
                {success && !error && <div style={styles.statusMessage(false)}>{success}</div>}

                <button disabled={loading} type="submit" style={styles.button(loading)}>
                    {loading ? 'Please wait…' : 'Continue'}
                </button>
            </form>
        </div>
    )
}
