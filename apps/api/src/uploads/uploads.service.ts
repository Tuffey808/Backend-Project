import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadsService {
  publicUrl(filename: string): string {
    const base =
      process.env.API_PUBLIC_URL ||
      process.env.PUBLIC_API_URL ||
      `http://localhost:${process.env.PORT || 3001}`;
    return `${base}/uploads/${filename}`;
  }
}
