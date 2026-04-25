import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { AppError } from '@shared/errors';
import type { DocumentSourceType } from '@shared/types';
import { cleanText } from '@core/ai/textChunker';

const MIN_TEXT_LENGTH = 50;

export async function extractText(
  filePath: string,
  sourceType: DocumentSourceType,
): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  let rawText = '';

  switch (sourceType) {
    case 'pdf': {
      const result = await pdfParse(buffer);
      rawText = result.text;
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
