# Configuración de Cloudinary para subida de imágenes

## Pasos para configurar Cloudinary:

1. **Crear cuenta en Cloudinary:**
   - Ve a https://cloudinary.com/
   - Regístrate para obtener una cuenta gratuita

2. **Obtener credenciales:**
   - Una vez registrado, ve a tu Dashboard
   - Copia los siguientes valores:
     - Cloud Name
     - API Key
     - API Secret

3. **Configurar variables de entorno:**
   Agrega estas variables a tu archivo `.env`:

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

4. **Para Render.com:**
   - Ve a tu proyecto en Render
   - En la sección "Environment Variables"
   - Agrega las tres variables de Cloudinary

## Funcionalidades implementadas:

- ✅ Subida de imágenes locales (hasta 5MB)
- ✅ Preview de imagen antes de subir
- ✅ Validación de tipo de archivo (solo imágenes)
- ✅ Optimización automática de imágenes
- ✅ Almacenamiento seguro en Cloudinary
- ✅ URL HTTPS para las imágenes subidas

## Uso en el panel de administrador:

1. **URL de imagen:** Puedes pegar una URL directa de imagen
2. **Subida local:** Puedes seleccionar una imagen de tu computadora
3. **Preview:** Verás la imagen antes de subirla
4. **Subida:** Al hacer clic en "Subir imagen", se subirá a Cloudinary
5. **URL automática:** La URL de Cloudinary se agregará automáticamente al campo de imagen

## Notas importantes:

- Las imágenes se optimizan automáticamente (máximo 800x800px)
- Se almacenan en la carpeta "riocuartocelulares" en tu cuenta de Cloudinary
- Las URLs son HTTPS y están listas para usar en producción
- El sistema es compatible con el panel de administrador existente 