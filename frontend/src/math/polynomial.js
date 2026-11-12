// Polinomial dengan koefisien bilangan bulat dan variabel huruf tunggal (x, y, a, ...).
// Satu polinomial disimpan sebagai Map: kunci monomial -> { coef, vars }.
//   contoh: 8x² + 12x  ->  { "x^2": {coef: 8, vars: {x: 2}}, "x": {coef: 12, vars: {x: 1}} }
// Modul ini murni JavaScript (tanpa React) agar mudah diuji.

export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function cleanVars(vars) {
  const out = {};
  for (const v of Object.keys(vars).sort()) {
    if (vars[v] !== 0) out[v] = vars[v];
  }
  return out;
}

export function keyOf(vars) {
  return Object.keys(vars)
    .sort()
    .filter((v) => vars[v] !== 0)
    .map((v) => (vars[v] === 1 ? v : `${v}^${vars[v]}`))
    .join('');
}

export function degreeOf(vars) {
  return Object.values(vars).reduce((s, p) => s + p, 0);
}

const SUPERSCRIPT = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const toSuperscript = (n) => String(n).split('').map((d) => SUPERSCRIPT[d]).join('');

export class Poly {
  constructor(terms = new Map()) {
    this.terms = terms;
  }

  static constant(n) {
    const t = new Map();
    if (n !== 0) t.set('', { coef: n, vars: {} });
    return new Poly(t);
  }

  static variable(name) {
    return Poly.term(1, { [name]: 1 });
  }

  static term(coef, vars) {
    const t = new Map();
    const clean = cleanVars(vars);
    if (coef !== 0) t.set(keyOf(clean), { coef, vars: clean });
    return new Poly(t);
  }

  termList() {
    return [...this.terms.entries()]
      .map(([key, t]) => ({ key, coef: t.coef, vars: t.vars }))
      .sort((a, b) => degreeOf(b.vars) - degreeOf(a.vars) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  }

  get size() {
    return this.terms.size;
  }

  isZero() {
    return this.terms.size === 0;
  }

  isMonomial() {
    return this.terms.size === 1;
  }

  isConstant(value) {
    if (value === 0) return this.isZero();
    if (this.terms.size !== 1 || !this.terms.has('')) return false;
    return value === undefined ? true : this.terms.get('').coef === value;
  }

  add(other) {
    const t = new Map();
    for (const [k, v] of this.terms) t.set(k, { coef: v.coef, vars: v.vars });
    for (const [k, v] of other.terms) {
      const cur = t.get(k);
      const coef = (cur ? cur.coef : 0) + v.coef;
      if (coef === 0) t.delete(k);
      else t.set(k, { coef, vars: v.vars });
    }
    return new Poly(t);
  }

  neg() {
    const t = new Map();
    for (const [k, v] of this.terms) t.set(k, { coef: -v.coef, vars: v.vars });
    return new Poly(t);
  }

  sub(other) {
    return this.add(other.neg());
  }

  mul(other) {
    let result = new Poly();
    for (const a of this.terms.values()) {
      for (const b of other.terms.values()) {
        const vars = { ...a.vars };
        for (const [v, p] of Object.entries(b.vars)) vars[v] = (vars[v] || 0) + p;
        result = result.add(Poly.term(a.coef * b.coef, vars));
      }
    }
    return result;
  }

  pow(n) {
    let result = Poly.constant(1);
    for (let i = 0; i < n; i++) result = result.mul(this);
    return result;
  }

  equals(other) {
    if (this.terms.size !== other.terms.size) return false;
    for (const [k, v] of this.terms) {
      const o = other.terms.get(k);
      if (!o || o.coef !== v.coef) return false;
    }
    return true;
  }

  // Bagi setiap suku dengan satu monomial. Mengembalikan null jika hasilnya tidak bulat
  // (koefisien pecahan atau pangkat negatif) — di luar cakupan kelas VII.
  divideByMonomial(m) {
    if (!m.isMonomial()) return null;
    const [d] = m.terms.values();
    let result = new Poly();
    for (const t of this.terms.values()) {
      if (t.coef % d.coef !== 0) return null;
      const vars = { ...t.vars };
      for (const [v, p] of Object.entries(d.vars)) {
        vars[v] = (vars[v] || 0) - p;
        if (vars[v] < 0) return null;
      }
      result = result.add(Poly.term(t.coef / d.coef, vars));
    }
    return result;
  }

  // Substitusi nilai variabel, mis. evaluateAt({ x: 3 }).
  evaluateAt(values) {
    let sum = 0;
    for (const t of this.terms.values()) {
      let prod = t.coef;
      for (const [v, p] of Object.entries(t.vars)) {
        if (!(v in values)) throw new Error(`Nilai ${v} belum diberikan`);
        prod *= values[v] ** p;
      }
      sum += prod;
    }
    return sum;
  }

  // Bentuk tampilan: 8x² + 12x, y² − 9, −5x
  toString() {
    if (this.isZero()) return '0';
    return this.termList()
      .map((t, i) => {
        const abs = Math.abs(t.coef);
        const varStr = Object.keys(t.vars)
          .sort()
          .map((v) => (t.vars[v] === 1 ? v : v + toSuperscript(t.vars[v])))
          .join('');
        const coefStr = varStr && abs === 1 ? '' : String(abs);
        const body = coefStr + varStr;
        if (i === 0) return (t.coef < 0 ? '−' : '') + body;
        return (t.coef < 0 ? ' − ' : ' + ') + body;
      })
      .join('');
  }
}

// FPB dari beberapa monomial: FPB koefisien × variabel dengan pangkat terkecil yang ada di semua suku.
export function fpbOfTerms(termList) {
  if (termList.length === 0) return null;
  let coef = 0;
  for (const t of termList) coef = gcd(coef, t.coef);
  const vars = {};
  for (const v of Object.keys(termList[0].vars)) {
    vars[v] = Math.min(...termList.map((t) => t.vars[v] || 0));
  }
  return Poly.term(coef, vars);
}

// Faktor persekutuan suku-suku sebuah polinomial (selalu positif).
export function contentOf(poly) {
  if (poly.isZero()) return null;
  return fpbOfTerms(poly.termList());
}

// Akar dari suku kuadrat sempurna (koefisien positif kuadrat, semua pangkat genap), atau null.
export function squareRootOfTerm(t) {
  if (t.coef <= 0) return null;
  const r = Math.round(Math.sqrt(t.coef));
  if (r * r !== t.coef) return null;
  const vars = {};
  for (const [v, p] of Object.entries(t.vars)) {
    if (p % 2 !== 0) return null;
    vars[v] = p / 2;
  }
  return Poly.term(r, vars);
}

// a² − b² dengan a, b monomial → { a, b }; selain itu null.
export function differenceOfSquares(poly) {
  if (poly.size !== 2) return null;
  const [t1, t2] = poly.termList();
  const pos = t1.coef > 0 ? t1 : t2;
  const negT = t1.coef > 0 ? t2 : t1;
  if (!(pos.coef > 0 && negT.coef < 0)) return null;
  const a = squareRootOfTerm(pos);
  const b = squareRootOfTerm({ ...negT, coef: -negT.coef });
  return a && b ? { a, b } : null;
}

// a² + b² (keduanya kuadrat sempurna, keduanya positif) → { a, b }; selain itu null.
export function sumOfSquares(poly) {
  if (poly.size !== 2) return null;
  const [t1, t2] = poly.termList();
  const a = squareRootOfTerm(t1);
  const b = squareRootOfTerm(t2);
  return a && b ? { a, b } : null;
}
