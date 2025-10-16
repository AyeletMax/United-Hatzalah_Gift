import { pingDatabase } from '../src/db.js';

const ok = await pingDatabase();
console.log(ok ? '[db:ping] OK' : '[db:ping] FAILED');


