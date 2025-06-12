// lib/api-utils.ts
import { NextResponse } from 'next/server';

function sanitizeBigInt(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeBigInt);
  } else if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      const value = obj[key];
      sanitized[key] =
        typeof value === 'bigint' ? value.toString() : sanitizeBigInt(value);
    }
    return sanitized;
  }
  return obj;
}

export function safeJsonResponse(data: any, options?: ResponseInit) {
  return NextResponse.json(sanitizeBigInt(data), options);
}
