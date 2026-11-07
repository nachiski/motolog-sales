import { signInWithGoogle } from "./actions";

export function GoogleSignInPage() {
  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="brand-mark" aria-hidden="true">🏍</div>
        <p className="eyebrow">MOTOLOG</p>
        <h1>Tu negocio, en un solo lugar.</h1>
        <p>Inicia sesión con Google para consultar y administrar las ventas de MotoLog.</p>
        <form action={signInWithGoogle}>
          <button className="primary auth-button" type="submit">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" transform="translate(0 5)" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.91c-.57 2.96-2.24 5.47-4.73 7.16l7.65 5.94c4.47-4.13 7.15-10.2 7.15-17.57Z" />
              <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.2a23.9 23.9 0 0 0 0 21.58l7.98-6.2Z" transform="translate(0 3)" />
              <path fill="#34A853" d="M24 48c6.47 0 11.9-2.13 15.87-5.79l-7.65-5.94c-2.13 1.43-4.85 2.27-8.22 2.27-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.2C6.51 42.62 14.62 48 24 48Z" transform="translate(0 -5)" />
            </svg>
            Continuar con Google
          </button>
        </form>
        <small>El acceso está protegido con Google.</small>
      </section>
    </main>
  );
}
