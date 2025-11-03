# ImageKit – הגדרת העלאת תמונות

## יצירת חשבון וקריאות API
- התחברי ל‑ImageKit: `https://imagekit.io/login`
- קבלי מה‑Dashboard:
  - Public Key
  - Private Key
  - URL Endpoint (למשל: `https://ik.imagekit.io/<your_id>`)

## משתני סביבה (`server/.env`)
```
IMAGEKIT_PUBLIC_KEY=pk_xxxxxxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=sk_xxxxxxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your_id>
```

## הערות
- אין צורך ב‑SDK בצד לקוח לשינויי גודל בסיסיים – אפשר להוסיף פרמטרים ל‑URL או להשתמש ב‑`transformation` בצד השרת.
- קבצים נשמרים בענן של ImageKit ומוגשים דרך CDN.

