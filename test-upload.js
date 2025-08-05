// Script de prueba para verificar la configuración de Cloudinary
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary (reemplaza con tus credenciales)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función de prueba
async function testCloudinary() {
  try {
    console.log('Probando configuración de Cloudinary...');
    
    // Verificar que las credenciales están configuradas
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Error: Faltan variables de entorno de Cloudinary');
      console.log('Asegúrate de configurar:');
      console.log('- CLOUDINARY_CLOUD_NAME');
      console.log('- CLOUDINARY_API_KEY');
      console.log('- CLOUDINARY_API_SECRET');
      return;
    }
    
    console.log('✅ Variables de entorno configuradas correctamente');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    
    // Probar conexión con Cloudinary
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión con Cloudinary exitosa:', result);
    
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:', error.message);
  }
}

// Ejecutar prueba
testCloudinary(); 