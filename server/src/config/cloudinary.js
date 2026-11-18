const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log('✅ [Workroom] Cloudinary configured successfully.');
} else {
  console.warn(
    '⚠️  [Workroom] Cloudinary credentials not fully configured in server/.env.\n' +
    'Local file storage fallback will be used for uploaded documents and QR codes.'
  );
}

// Upload buffer directly to Cloudinary or fallback to local disk
const uploadBuffer = async (buffer, originalname, folder = 'workroom', resourceType = 'auto') => {
  const targetFolder = folder.startsWith('workroom') ? folder : `workroom/${folder}`;
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolder,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format || path.extname(originalname).replace('.', ''),
            bytes: result.bytes,
            originalName: originalname,
            provider: 'cloudinary',
          });
        }
      );

      const stream = Readable.from(buffer);
      stream.pipe(uploadStream);
    });
  }

  // Fallback to local uploads
  const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const ext = path.extname(originalname);
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const filePath = path.join(uploadsDir, safeName);

  fs.writeFileSync(filePath, buffer);

  const localUrl = `/uploads/${safeName}`;
  return {
    url: localUrl,
    publicId: safeName,
    format: ext.replace('.', ''),
    bytes: buffer.length,
    originalName: originalname,
    provider: 'local',
  };
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadBuffer,
};
