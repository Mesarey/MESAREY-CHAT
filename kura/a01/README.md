# A01 · Inicio de sesión

Primera pantalla de KURA, recreada a partir del kit «KURA A01 · Kit morado» y de la referencia aprobada (`../diseno/A01/referencia.webp`).

## Cómo verla

Es una página estática: HTML, CSS y JavaScript sin paso de compilación. Hay que abrirla con un servidor local (los módulos de JavaScript no cargan con doble clic):

```bash
npx serve kura/a01
```

## Qué tiene

- **Escena**: fondo reconstruido, el grupo de los cinco guías y el logo oficial, colocados con las medidas del lienzo de referencia (899 × 1750).
- **Efectos (Three.js)**: estrellas que titilan, motas de luz que flotan, halos de los faroles, luciérnagas y destellos en el piso. Las luces se apartan del dedo o del cursor y estallan al tocar «Iniciar sesión».
- **Paralaje**: las capas se mueven con el cursor o con la inclinación del teléfono.
- **Título**: las letras aparecen una a una y un brillo las recorre cada pocos segundos.
- **Botón principal**: halo que respira, destellos arriba y abajo, reflejo que lo cruza, luz que sigue al dedo, efecto imán con el cursor y estallido de chispas al tocarlo.
- **Formulario**: validación de correo y contraseña con estado de error, mostrar u ocultar contraseña, estado de carga y estado de enfoque. Con el teclado abierto, el campo se centra y la ilustración se atenúa.
- **Sonido ambiente**: generado en el navegador (sin archivos de audio). Empieza con el primer toque y el botón de arriba lo silencia.
- **Responsive**: llena el ancho en teléfono; en tableta y escritorio se centra con el mismo mundo desenfocado a los lados.
- Respeta «reducir movimiento» del sistema.

## Pendiente

- No hay cuentas todavía: «Iniciar sesión» valida y muestra un aviso, pero no inicia sesión. «Continuar con Google», «Crear cuenta», «Olvidé mi contraseña», Términos y Privacidad muestran «próximamente».
- El fondo y el grupo son las reconstrucciones del kit, por lo que algunos detalles de los personajes difieren de la referencia aprobada.

## Créditos de recursos

- Three.js (MIT) en `vendor/`, GSAP 3.15.1 (licencia estándar gratuita de GreenSock) en `vendor/`.
- Playfair Display (SIL Open Font License) en `assets/fonts/`.
- Icono de Google: marca de Google, usada solo en su botón de inicio de sesión.
