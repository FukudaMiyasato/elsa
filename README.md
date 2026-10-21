# Elsa

App web (React + Vite + Firebase) con login de Google y dos rutas:

- **`/` Chat**: dos botones grandes, *Enviar audio* (graba desde el micrófono; tocar de nuevo detiene y envía) y *Tomar foto* (abre la cámara en el celular).
- **`/receptor`**: registro en tiempo real de todas las fotos y audios enviados, con filtro por tipo.

Las fotos y audios se guardan directamente en Firestore (colección `archivos`, metadatos en `envios`), por eso cada envío está limitado a ~700 KB: las fotos se comprimen automáticamente y los audios duran como máximo 3 minutos.

## Configuración de Firebase

1. Crea un proyecto en https://console.firebase.google.com
2. **Authentication** → Sign-in method → habilita **Google**.
3. Crea **Firestore Database** (funciona en el plan gratuito Spark; no se usa Storage).
4. Configuración del proyecto → *Tus apps* → agrega una app **Web** y copia los valores.
5. `cp .env.example .env` y completa las variables.
6. Publica las reglas de seguridad (`firestore.rules`):

```bash
npx firebase-tools deploy --only firestore:rules
```

## Desarrollo

```bash
npm install
npm run dev
```

## Publicar (Firebase Hosting)

```bash
npm run build && npx firebase-tools deploy --only hosting
```

> El micrófono y la cámara requieren HTTPS (o `localhost`). Si publicas en otro dominio, agrégalo en Authentication → Settings → *Authorized domains*.
