// Netlify Function: proxy AI Learning Assistant di /api/ai/status dan /api/ai/chat.
// API key diisi di Netlify (Site configuration → Environment variables → AI_API_KEY), tidak pernah di kode.
// Seluruh logika ada di backend/src/webHandler.js (sudah diuji di backend/test).
import { createWebHandler } from '../../backend/src/webHandler.js';

let handle; // dibuat sekali per instans fungsi (pembatas laju tetap berlaku antarpermintaan)

export default async (request, context) => {
  handle ??= createWebHandler();
  return handle(request, context?.ip ?? request.headers.get('x-nf-client-connection-ip') ?? 'unknown');
};

export const config = { path: ['/api/ai/status', '/api/ai/chat'] };
