// Puntos de integración de autenticación.
// Aún no hay servidor: estas funciones responden con un estado de demo honesto.
// Para conectar, reemplazar el cuerpo por el proveedor real (Supabase, Firebase, etc.).
export const auth = {
  connected: false,
  // Respuestas: { ok: true } → suena «acceso concedido»; { ok: false, reason: 'invalid' | 'network' } → «acceso fallido».
  /** @returns {Promise<{ ok: boolean, reason?: 'demo' | 'invalid' | 'network' }>} */
  async signInWithEmail(_email, _password) {
    await new Promise((r) => setTimeout(r, 1300));
    return { ok: false, reason: 'demo' };
  },
  async signInWithGoogle() { return { ok: false, reason: 'demo' }; },
  /** Registro con correo (A02). Al responder ok se abriría la bienvenida con Alaira (A06). */
  async signUpWithEmail(_email, _password) {
    await new Promise((r) => setTimeout(r, 1300));
    return { ok: false, reason: 'demo' };
  },
};
