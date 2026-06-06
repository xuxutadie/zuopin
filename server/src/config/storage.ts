import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function resolveUploadDir(): string {
  const configuredDir = process.env.UPLOAD_DIR?.trim();

  if (!configuredDir) {
    return path.resolve(process.cwd(), 'uploads');
  }

  return path.isAbsolute(configuredDir)
    ? configuredDir
    : path.resolve(process.cwd(), configuredDir);
}

export function getUploadDir(): string {
  return resolveUploadDir();
}

export function ensureUploadDir(): string {
  const uploadDir = resolveUploadDir();
  fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}

export function resolveUploadPath(filename: string): string {
  return path.join(resolveUploadDir(), filename);
}
