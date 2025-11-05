import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as apiRegister } from '../lib/api'

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
        maxWidth: 540,
        background: '#fff',
        borderRadius: 18,
        border: '1px solid #e4e7ec',
        boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
        padding: '44px 42px',
        display: 'grid',
        gap: 20,
    },
    headingRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 26,
        fontWeight: 600,
        color: '#0b162a',
    },
    icon: {
        fontSize: 28,
    },
    fieldGroup: {
        display: 'grid',
        gap: 6,
    },
    label: {
        fontWeight: 600,
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
    twoColumnRow: {
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    },
    helperText: {
        fontSize: 13,
        color: '#526079',
        marginTop: -6,
    },
    statusMessage: (isError) => ({
        fontSize: 14,
        fontWeight: 500,
        color: isError ? '#b91c1c' : '#15803d',
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
    footer: {
        textAlign: 'center',
        fontSize: 14,
        color: '#475569',
        marginTop: 4,
    },
    link: {
        color: '#1d4ed8',
        fontWeight: 600,
        textDecoration: 'none',
        marginLeft: 4,
    },
}

export default function RegisterPage() {
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [focusedField, setFocusedField] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    async function onSubmit(e) {
        e.preventDefault()
        setError(null)
        setSuccess(null)

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await apiRegister({ name: name.trim(), email: email.trim(), password })
            setSuccess('Account created! Redirecting to log in…')
            setTimeout(() => navigate('/login'), 900)
        } catch (err) {
            const message = err?.message || 'Registration failed'
            if (message.toLowerCase().includes('failed to fetch')) {
                setError('Unable to reach YumYumApp servers. Please try again shortly.')
            } else {
                setError(message)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.page}>
            <form onSubmit={onSubmit} style={styles.card}>
                <div style={styles.headingRow}>
                    <span style={styles.icon}>👤</span>
                    <span>Create your YumYum account</span>
                </div>

                <label style={styles.fieldGroup}>
                    <span style={styles.label}>Full Name</span>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        type="text"
                        placeholder="e.g., Alex Chen"
                        required
                        style={styles.input(focusedField === 'name')}
                    />
                </label>

                <label style={styles.fieldGroup}>
                    <span style={styles.label}>Email</span>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        type="email"
                        placeholder="you@example.com"
                        required
                        style={styles.input(focusedField === 'email')}
                    />
                </label>

                <div style={styles.twoColumnRow}>
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
                            minLength={8}
                            style={styles.input(focusedField === 'password')}
                        />
                    </label>

                    <label style={styles.fieldGroup}>
                        <span style={styles.label}>Confirm Password</span>
                        <input
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedField('confirm')}
                            onBlur={() => setFocusedField(null)}
                            type="password"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            style={styles.input(focusedField === 'confirm')}
                        />
                    </label>
                </div>

                <p style={styles.helperText}>Use 8+ characters with a mix of letters and numbers.</p>

                {error && <div style={styles.statusMessage(true)}>{error}</div>}
                {success && !error && <div style={styles.statusMessage(false)}>{success}</div>}

                <button disabled={loading} type="submit" style={styles.button(loading)}>
                    {loading ? 'Creating account…' : 'Create account'}
                </button>

                <div style={styles.footer}>
                    Already have an account?
                    <Link to="/login" style={styles.link}>
                        Log in
                    </Link>
                </div>
            </form>
        </div>
    )
}
