import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { createWriteStream } from 'fs';
import axios from 'axios';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '@shared/errors';
import type { DocumentSourceType } from '@shared/types';
import { cleanText } from '@core/ai/textChunker';
import { logger } from '@shared/logger';
import Tesseract from 'tesseract.js';
// @ts-ignore
import * as pdf2img from 'pdf-img-convert';
import { pipeline } from 'stream/promises';
import { config } from '@shared/config';

const MIN_TEXT_LENGTH = 50;

async function extractTextFromFile(filePath: string, sourceType: DocumentSourceType): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  let rawText = '';

  switch (sourceType) {
    case 'pdf': {
      const result = await pdfParse(buffer);
      rawText = result.text;
      
      // If pdf-parse extracts very little text (e.g. < 50 chars), it's likely a scanned/image-based PDF.
      // Fallback to OCR.
      const tempCleaned = cleanText(rawText);
      if (tempCleaned.length < MIN_TEXT_LENGTH) {
        logger.info('PDF contains little extractable text, falling back to OCR...');
        try {
          const images = await pdf2img.convert(buffer, {
            base64: false,
            scale: 2.0 // Scale up to improve OCR quality
          });
          
          let ocrText = '';
          for (let i = 0; i < images.length; i++) {
            logger.info(`Running OCR on page ${i + 1}/${images.length}...`);
            const imgBuffer = images[i];
            const { data: { text } } = await Tesseract.recognize(Buffer.from(imgBuffer), 'eng');
            ocrText += text + '\n\n';
          }
          
          if (ocrText.trim().length > 0) {
            rawText = ocrText;
          }
        } catch (error) {
          logger.error('PDF OCR fallback failed:', error);
          // If OCR fails, we just keep whatever rawText we had (which will throw INSUFFICIENT_TEXT later)
        }
      }
      break;
    }
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value;
      break;
    }
    case 'txt': {
      rawText = buffer.toString('utf-8');
      break;
    }
    default:
      throw new AppError(`Unsupported file type: ${sourceType as string}`, 400, 'UNSUPPORTED_TYPE');
  }

  const cleaned = cleanText(rawText);

  if (cleaned.length < MIN_TEXT_LENGTH) {
    throw new AppError(
      'Document contains too little extractable text. Please check the file.',
      422,
      'INSUFFICIENT_TEXT',
    );
  }

  return cleaned;
}

async function downloadFileToTemp(fileUrl: string, sourceType: DocumentSourceType): Promise<string> {
  const response = await axios.get(fileUrl, {
    responseType: 'stream',
    timeout: 60_000,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  const extension = path.extname(new URL(fileUrl).pathname).toLowerCase() || `.${sourceType}`;
  const tempFilePath = path.join(
    config.upload.tempDir,
    `cloudinary-${Date.now()}-${crypto.randomUUID()}${extension}`,
  );

  await fsp.mkdir(config.upload.tempDir, { recursive: true });
  await pipeline(response.data, createWriteStream(tempFilePath));

  return tempFilePath;
}

export async function extractTextFromUrl(
  fileUrl: string,
  sourceType: DocumentSourceType,
): Promise<string> {
  if (!fileUrl.trim()) {
    throw new AppError('fileUrl is required', 400, 'MISSING_FILE_URL');
  }

  const tempFilePath = await downloadFileToTemp(fileUrl, sourceType);

  try {
    return await extractTextFromFile(tempFilePath, sourceType);
  } finally {
    await fsp.unlink(tempFilePath).catch(() => undefined);
  }
}

export function detectSourceType(filename: string): DocumentSourceType {
  const ext = path.extname(filename).toLowerCase();
  const typeMap: Record<string, DocumentSourceType> = {
    '.pdf': 'pdf',
    '.docx': 'docx',
    '.txt': 'txt',
  };

  const type = typeMap[ext];
  if (!type) {
    throw new AppError(
      `Unsupported file extension "${ext}". Allowed: .pdf, .docx, .txt`,
      400,
      'UNSUPPORTED_EXTENSION',
    );
  }

  return type;
}
