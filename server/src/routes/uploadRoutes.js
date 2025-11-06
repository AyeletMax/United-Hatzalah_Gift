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

// פונקציה שמאתחלת את ImageKit רק אם ה-ENV קיימים, כדי למנוע קריסה באתחול השרת
function getImageKitOrError() {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    return { error: 'חסרים משתני סביבה ל-ImageKit (IMAGEKIT_PUBLIC_KEY/PRIVATE_KEY/URL_ENDPOINT)' };
  }

  return {
    client: new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    })
  };
}

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'לא נבחרה תמונה' });
    }

    const { client, error } = getImageKitOrError();
    if (error) {
      return res.status(500).json({ error });
    }

    const ext = path.extname(req.file.originalname || '') || '';
    const base = path.basename(req.file.originalname || 'image', ext).slice(0, 80) || 'image';
    const fileName = `${base}-${Date.now()}${ext}`;

    const uploadResult = await client.upload({
      file: req.file.buffer, // Buffer
      fileName,
      folder: '/products'
    });

    // החזרת URL ציבורי. ניתן להוסיף פרמטרי טרנספורמציה לפי צורך
    // למשל: `${uploadResult.url}?tr=w-800,q-80`
    res.json({ imageUrl: uploadResult.url, provider: 'imagekit', fileId: uploadResult.fileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;