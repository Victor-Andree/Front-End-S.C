'use client'

import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useDemoLogin } from '../hooks/use-demo-login'
export function Login() {
  const onLogin = useDemoLogin()
  const [showPassword, setShowPassword] = useState(false)
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
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onLogin()
            }}
          >
            <label>
              Usuario
              <input defaultValue="maria.garcia" autoComplete="username" />
            </label>
            <label>
              Contraseña
              <div className="input-icon">
                <input
                  type={showPassword ? 'text' : 'password'}
                  defaultValue="nexo1234"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </label>
            <button className="primary-button full" type="submit">
              Entrar <ArrowRight />
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
