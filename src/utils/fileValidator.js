// src/utils/fileValidator.js

const ALLOWED_IMAGE_TYPES = [
  { mime: 'image/jpeg', magic: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  magic: [0x89, 0x50, 0x4E, 0x47] }
];

const ALLOWED_VIDEO_TYPES = [
  { mime: 'video/mp4', magic: [0x00, 0x00, 0x00] } // ftyp box — verificación parcial
];

/**
 * Valida un archivo por magic bytes, MIME type y tamaño.
 * @param {Buffer} buffer
 * @param {string} mimetype - MIME declarado por multer
 * @param {'image'|'video'} type
 * @throws {Error} si no pasa validación
 */
function validateFile(buffer, mimetype, type = 'image') {
  if (!buffer || buffer.length === 0) throw { status: 400, message: 'Archivo requerido' };

  const maxMB = type === 'video'
    ? Number(process.env.MAX_VIDEO_SIZE_MB || 50)
    : Number(process.env.MAX_IMAGE_SIZE_MB || 5);

  const maxBytes = maxMB * 1024 * 1024;
  if (buffer.length > maxBytes) {
    throw { status: 400, message: `El archivo supera el límite de ${maxMB}MB` };
  }

  const allowed = type === 'video' ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
  const matchesMime = allowed.some(a => a.mime === mimetype);
  if (!matchesMime) {
    throw { status: 400, message: 'Tipo de archivo no permitido' };
  }

  // Verificar magic bytes
  const matchesMagic = allowed.some(a =>
    a.magic.every((byte, i) => buffer[i] === byte)
  );
  if (!matchesMagic) {
    throw { status: 400, message: 'El contenido del archivo no coincide con su tipo declarado' };
  }
}

module.exports = { validateFile };