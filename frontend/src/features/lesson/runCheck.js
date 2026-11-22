import { checkFactorization, checkEquivalent, checkDivision, checkQuotient, checkSimplified } from '../../math/index.js';

/**
 * Menjalankan pemeriksa mesin aljabar sesuai jenis soal di file konten.
 * Dipakai bersama oleh layar isian, contoh rumpang, dan kuis.
 *  - factor     : memfaktorkan (target, key)        → checkFactorization
 *  - division   : suku tunggal : suku tunggal       → checkDivision
 *  - quotient   : bentuk aljabar : suku tunggal     → checkQuotient
 *  - simplified : hasil harus bentuk paling sederhana → checkSimplified
 *  - equivalent : nilai setara (FPB, bilangan, model) → checkEquivalent
 */
export function runCheck(check, answer) {
  if (check.kind === 'factor') return checkFactorization(answer, check.target);
  if (check.kind === 'division') return checkDivision(answer, check.dividend, check.divisor);
  if (check.kind === 'quotient') return checkQuotient(answer, check.dividend, check.divisor);
  if (check.kind === 'simplified') return checkSimplified(answer, check.target);
  return checkEquivalent(answer, check.target);
}
