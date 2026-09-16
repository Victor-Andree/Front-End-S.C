'use client'

import { ApiError } from '@/lib/api/errors'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'
import { useAuth } from '../context/auth-context'

type FieldErrors = { username?: string; password?: string }

function getLoginError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Usuario o contraseña incorrectos.'
    if (error.status === 400)
      return 'Revisa los datos ingresados e inténtalo nuevamente.'
    if (error.status === 0)
      return 'No pudimos conectar con el servidor. Inténtalo nuevamente.'
  }
  return 'No pudimos iniciar sesión. Inténtalo nuevamente.'
}

export function Login() {
  const { login } = useAuth()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    const errors: FieldErrors = {}
    if (!username.trim()) errors.username = 'Ingresa tu usuario.'
    if (!password) errors.password = 'Ingresa tu contraseña.'
    setFieldErrors(errors)
    setFormError('')
    if (Object.keys(errors).length > 0) return

    setIsSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      router.replace('/inicio')
    } catch (error) {
      setFormError(getLoginError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="brand-mark">N</div>
        <div className="brand-word">Nexo</div>
        <div className="brand-copy">
          <h1>
            Tu negocio,
            <br />
            <em>conectado.</em>
          </h1>
          <p>
            Ventas, inventario y clientes
            <br />
            en un solo lugar.
          </p>
        </div>
        <div className="brand-footer">
          <span className="signal" />
          Diseñado para operar mejor
        </div>
      </section>
      <section className="login-form-wrap">
        <div className="mobile-brand">
          <div className="brand-mark">N</div>
          <b>Nexo</b>
        </div>
        <div className="login-form">
          <p className="eyebrow">Bienvenido de nuevo</p>
          <h2>Entra a tu cuenta</h2>
          <p className="muted">Continúa gestionando tu negocio.</p>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="username">
              Usuario
              <input
                id="username"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={
                  fieldErrors.username ? 'username-error' : undefined
                }
                disabled={isSubmitting}
              />
              {fieldErrors.username && (
                <span id="username-error" className="field-error">
                  {fieldErrors.username}
                </span>
              )}
            </label>
            <label htmlFor="password">
              Contraseña
              <div className="input-icon">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={
                    fieldErrors.password ? 'password-error' : undefined
                  }
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {fieldErrors.password && (
                <span id="password-error" className="field-error">
                  {fieldErrors.password}
                </span>
              )}
            </label>
            {formError && (
              <p className="form-error" role="alert">
                {formError}
              </p>
            )}
            <button
              className="primary-button full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="spin" /> Ingresando…
                </>
              ) : (
                <>
                  Entrar <ArrowRight />
                </>
              )}
            </button>
          </form>
          <p className="login-help">
            ¿Necesitas ayuda? <a href="#ayuda">Contacta al administrador</a>
          </p>
        </div>
      </section>
    </main>
  )
}
