import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import ImageKit from 'imagekit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// שימוש בזיכרון; נעלה את הקובץ ישירות ל-ImageKit
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('רק קבצי תמונה מותרים'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// אתחול ImageKit עם משתני סביבה
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || ''
});

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'לא נבחרה תמונה' });
    }

    if (!imagekit.options || !imagekit.options.publicKey || !imagekit.options.privateKey || !imagekit.options.urlEndpoint) {
      return res.status(500).json({ error: 'חסרים משתני סביבה ל-ImageKit' });
    }

    const ext = path.extname(req.file.originalname || '') || '';
    const base = path.basename(req.file.originalname || 'image', ext).slice(0, 80) || 'image';
    const fileName = `${base}-${Date.now()}${ext}`;

    const uploadResult = await imagekit.upload({
      file: req.file.buffer, // Buffer
      fileName,
      // אפשר להוסיף תיקיה ב-ImageKit אם רוצים: folder: '/products'
    });

    // החזרת URL ציבורי. ניתן להוסיף פרמטרי טרנספורמציה לפי צורך
    // למשל: `${uploadResult.url}?tr=w-800,q-80`
    res.json({ imageUrl: uploadResult.url, provider: 'imagekit', fileId: uploadResult.fileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;