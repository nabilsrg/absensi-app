import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

export const ATTENDANCE_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'attendance');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function safeExtFromMimetype(mimetype: string) {
  if (mimetype === 'image/jpeg') return '.jpg';
  if (mimetype === 'image/png') return '.png';
  return '';
}

export const attendanceMulterOptions = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new BadRequestException('Only JPG/PNG images are allowed'), false);
    }
    cb(null, true);
  },
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      ensureDir(ATTENDANCE_UPLOAD_DIR);
      cb(null, ATTENDANCE_UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = safeExtFromMimetype(file.mimetype);
      if (!ext) return cb(new BadRequestException('Unsupported file type'), '');

      // contoh: 20260111T153012_839201.jpg
      const stamp = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\..+/, '');
      const rand = Math.floor(100000 + Math.random() * 900000);

      cb(null, `${stamp}_${rand}${ext}`);
    },
  }),
};
