// Parser bentuk aljabar yang diketik siswa.
// Menerima: 4x(2x+3), 4x·(2x + 3), 8x²+12x, 8x^2+12x, (y+3)(y−3), 8x² : 4x
// Menghasilkan pohon sintaks (AST) agar struktur jawaban (misalnya bentuk faktor) dapat diperiksa,
// lalu evaluate() mengubah AST menjadi Poly.

import { Poly } from './polynomial.js';

export class MathInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MathInputError';
  }
}

export function normalizeInput(raw) {
  return String(raw ?? '')
    .replace(/[−–—]/g, '-')
    .replace(/[×·∙⋅]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      if ((src[j] === '.' || src[j] === ',') && /[0-9]/.test(src[j + 1] ?? '')) {
        throw new MathInputError('Gunakan bilangan bulat saja, ya.');
      }
      tokens.push({ type: 'num', value: Number(src.slice(i, j)) });
      i = j;
    } else if (/[a-z]/.test(ch)) {
      tokens.push({ type: 'var', value: ch });
      i++;
    } else if ('+-*/^()'.includes(ch)) {
      tokens.push({ type: ch });
      i++;
    } else {
      throw new MathInputError(`Simbol "${ch}" belum bisa dibaca.`);
    }
  }
  return tokens;
}

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.pos = 0;
  }
  peek() {
    return this.tokens[this.pos];
  }
  next() {
    return this.tokens[this.pos++];
  }
  startsFactor(t) {
    return t && (t.type === 'num' || t.type === 'var' || t.type === '(');
  }

  // ekspresi := suku (('+' | '-') suku)*
  parseExpression() {
    const terms = [{ sign: 1, node: this.parseTerm() }];
    while (this.peek() && (this.peek().type === '+' || this.peek().type === '-')) {
      const sign = this.next().type === '+' ? 1 : -1;
      terms.push({ sign, node: this.parseTerm() });
    }
    return terms.length === 1 ? terms[0].node : { type: 'add', terms };
  }

  // suku := unary ( '*' unary | '/' rantai | unary-implisit )*
  parseTerm() {
    let factors = [this.parseUnary()];
    for (;;) {
      const t = this.peek();
      if (t && t.type === '*') {
        this.next();
        factors.push(this.parseUnary());
      } else if (t && t.type === '/') {
        this.next();
        // "8x²/4x" dibaca sebagai 8x² : (4x), sesuai kebiasaan siswa.
        const right = this.parseImplicitChain();
        const left = factors.length === 1 ? factors[0] : { type: 'mul', factors };
        factors = [{ type: 'div', left, right }];
      } else if (this.startsFactor(t)) {
        factors.push(this.parsePower());
      } else {
        break;
      }
    }
    return factors.length === 1 ? factors[0] : { type: 'mul', factors };
  }

  parseImplicitChain() {
    const factors = [this.parseUnary()];
    while (this.startsFactor(this.peek())) factors.push(this.parsePower());
    return factors.length === 1 ? factors[0] : { type: 'mul', factors };
  }

  parseUnary() {
    const t = this.peek();
    if (t && t.type === '-') {
      this.next();
      return { type: 'neg', arg: this.parseUnary() };
    }
    if (t && t.type === '+') {
      this.next();
      return this.parseUnary();
    }
    return this.parsePower();
  }

  parsePower() {
    let base = this.parsePrimary();
    while (this.peek() && this.peek().type === '^') {
      this.next();
      const e = this.next();
      if (!e || e.type !== 'num') throw new MathInputError('Pangkat harus berupa bilangan bulat.');
      if (e.value > 12) throw new MathInputError('Pangkatnya terlalu besar.');
      base = { type: 'pow', base, exp: e.value };
    }
    return base;
  }

  parsePrimary() {
    const t = this.next();
    if (!t) throw new MathInputError('Jawabanmu belum lengkap.');
    if (t.type === 'num') return { type: 'num', value: t.value };
    if (t.type === 'var') return { type: 'var', name: t.value };
    if (t.type === '(') {
      if (this.peek() && this.peek().type === ')') throw new MathInputError('Kurungnya masih kosong.');
      const expr = this.parseExpression();
      const close = this.next();
      if (!close || close.type !== ')') throw new MathInputError('Ada kurung yang belum ditutup.');
      return { type: 'group', expr };
    }
    if (t.type === ')') throw new MathInputError('Ada kurung tutup yang berlebih.');
    throw new MathInputError('Ada tanda yang letaknya kurang tepat.');
  }
}

export function parse(raw) {
  const src = normalizeInput(raw);
  if (src === '') throw new MathInputError('Jawabanmu masih kosong.');
  const parser = new Parser(tokenize(src));
  const ast = parser.parseExpression();
  if (parser.pos < parser.tokens.length) {
    const t = parser.peek();
    throw new MathInputError(t.type === ')' ? 'Ada kurung tutup yang berlebih.' : 'Ada tanda yang letaknya kurang tepat.');
  }
  return ast;
}

export function evaluate(node) {
  switch (node.type) {
    case 'num':
      return Poly.constant(node.value);
    case 'var':
      return Poly.variable(node.name);
    case 'group':
      return evaluate(node.expr);
    case 'neg':
      return evaluate(node.arg).neg();
    case 'add':
      return node.terms.reduce((acc, t) => {
        const v = evaluate(t.node);
        return t.sign === 1 ? acc.add(v) : acc.sub(v);
      }, new Poly());
    case 'mul':
      return node.factors.reduce((acc, f) => acc.mul(evaluate(f)), Poly.constant(1));
    case 'pow':
      return evaluate(node.base).pow(node.exp);
    case 'div': {
      const divisor = evaluate(node.right);
      if (divisor.isZero()) throw new MathInputError('Tidak bisa membagi dengan nol.');
      if (!divisor.isMonomial()) throw new MathInputError('Pembagian hanya bisa dengan satu suku, misalnya 4x.');
      const result = evaluate(node.left).divideByMonomial(divisor);
      if (!result) throw new MathInputError('Hasil pembagiannya tidak bulat. Periksa lagi, ya.');
      return result;
    }
    default:
      throw new MathInputError('Bentuk ini belum bisa dibaca.');
  }
}

export function toPoly(raw) {
  return evaluate(parse(raw));
}
