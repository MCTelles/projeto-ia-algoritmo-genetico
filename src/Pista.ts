import type { Ponto, Segmento } from './Carro';

function segmentosIntersectam(a: Ponto, b: Ponto, c: Ponto, d: Ponto): boolean {
	const dABx = b.x - a.x;
	const dABy = b.y - a.y;
	const dCDx = d.x - c.x;
	const dCDy = d.y - c.y;

	const denom = dABx * dCDy - dABy * dCDx;
	if (Math.abs(denom) < 1e-10) return false;

	const ACx = c.x - a.x;
	const ACy = c.y - a.y;

	const t = (ACx * dCDy - ACy * dCDx) / denom;
	const u = (ACx * dABy - ACy * dABx) / denom;

	return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

function catmullRom(
	p0: Ponto,
	p1: Ponto,
	p2: Ponto,
	p3: Ponto,
	t: number,
): Ponto {
	const t2 = t * t;
	const t3 = t2 * t;

	return {
		x:
			0.5 *
			(2 * p1.x +
				(-p0.x + p2.x) * t +
				(2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
				(-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
		y:
			0.5 *
			(2 * p1.y +
				(-p0.y + p2.y) * t +
				(2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
				(-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
	};
}

function suavizarFechado(pontos: Ponto[], amostrasPorTrecho: number): Ponto[] {
	const resultado: Ponto[] = [];
	const n = pontos.length;

	for (let i = 0; i < n; i++) {
		const p0 = pontos[(i - 1 + n) % n];
		const p1 = pontos[i];
		const p2 = pontos[(i + 1) % n];
		const p3 = pontos[(i + 2) % n];

		for (let j = 0; j < amostrasPorTrecho; j++) {
			const t = j / amostrasPorTrecho;
			resultado.push(catmullRom(p0, p1, p2, p3, t));
		}
	}

	return resultado;
}

function offsetFechado(pontos: Ponto[], distancia: number): Ponto[] {
	const resultado: Ponto[] = [];
	const n = pontos.length;

	for (let i = 0; i < n; i++) {
		const anterior = pontos[(i - 1 + n) % n];
		const proximo = pontos[(i + 1) % n];

		const dx = proximo.x - anterior.x;
		const dy = proximo.y - anterior.y;
		const len = Math.hypot(dx, dy) || 1;

		const nx = -dy / len;
		const ny = dx / len;

		resultado.push({
			x: pontos[i].x + nx * distancia,
			y: pontos[i].y + ny * distancia,
		});
	}

	return resultado;
}

function areaPoligono(pontos: Ponto[]): number {
	let area = 0;

	for (let i = 0; i < pontos.length; i++) {
		const a = pontos[i];
		const b = pontos[(i + 1) % pontos.length];
		area += a.x * b.y - b.x * a.y;
	}

	return area / 2;
}

function pontoEmPoligono(p: Ponto, poligono: Ponto[]): boolean {
	let dentro = false;

	for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
		const pi = poligono[i];
		const pj = poligono[j];

		const cruzaY = pi.y > p.y !== pj.y > p.y;
		if (!cruzaY) continue;

		const xIntersecao = ((pj.x - pi.x) * (p.y - pi.y)) / (pj.y - pi.y) + pi.x;
		if (p.x < xIntersecao) dentro = !dentro;
	}

	return dentro;
}

export class Pista {
	readonly bordaExterna: Ponto[];
	readonly bordaInterna: Ponto[];

	private readonly segmentos: Segmento[];
	private readonly centroSuave: Ponto[];

	private readonly centro: Ponto[] = [
		{ x: 430, y: 115 },
		{ x: 570, y: 115 },
		{ x: 690, y: 170 },
		{ x: 705, y: 275 },
		{ x: 665, y: 355 },
		{ x: 610, y: 415 },
		{ x: 530, y: 500 },
		{ x: 390, y: 480 },
		{ x: 300, y: 415 },
		{ x: 190, y: 445 },
		{ x: 110, y: 345 },
		{ x: 145, y: 245 },
		{ x: 250, y: 190 },
		{ x: 320, y: 135 },
	];

	constructor() {
		const larguraPista = 86;
		this.centroSuave = suavizarFechado(this.centro, 10);

		const ladoA = offsetFechado(this.centroSuave, larguraPista / 2);
		const ladoB = offsetFechado(this.centroSuave, -larguraPista / 2);

		if (Math.abs(areaPoligono(ladoA)) > Math.abs(areaPoligono(ladoB))) {
			this.bordaExterna = ladoA;
			this.bordaInterna = ladoB;
		} else {
			this.bordaExterna = ladoB;
			this.bordaInterna = ladoA;
		}

		this.segmentos = this.criarSegmentos();
	}

	private criarSegmentos(): Segmento[] {
		const segs: Segmento[] = [];

		for (const borda of [this.bordaExterna, this.bordaInterna]) {
			for (let i = 0; i < borda.length; i++) {
				segs.push({
					a: borda[i],
					b: borda[(i + 1) % borda.length],
				});
			}
		}

		return segs;
	}

	getSegmentos(): Segmento[] {
		return this.segmentos;
	}

	getCheckpoints(n: number): Ponto[] {
		const total = this.centroSuave.length;
		return Array.from({ length: n }, (_, i) => {
			if (i === n - 1) return this.centro[0];
			return this.centroSuave[Math.round(((i + 1) * total) / n) % total];
		});
	}

	pontoNaPista(p: Ponto): boolean {
		return (
			pontoEmPoligono(p, this.bordaExterna) &&
			!pontoEmPoligono(p, this.bordaInterna)
		);
	}

	verificarColisao(carro: { getPoligono(): Ponto[] }): boolean {
		const poli = carro.getPoligono();

		for (const parede of this.segmentos) {
			for (let i = 0; i < poli.length; i++) {
				const a = poli[i];
				const b = poli[(i + 1) % poli.length];

				if (segmentosIntersectam(parede.a, parede.b, a, b)) {
					return true;
				}
			}
		}

		for (const ponto of poli) {
			if (!this.pontoNaPista(ponto)) return true;
		}

		return false;
	}

	desenhar(ctx: CanvasRenderingContext2D): void {
		const { width, height } = ctx.canvas;

		ctx.fillStyle = '#2a5c1b';
		ctx.fillRect(0, 0, width, height);

		ctx.fillStyle = '#454545';
		ctx.beginPath();

		ctx.moveTo(this.bordaExterna[0].x, this.bordaExterna[0].y);
		for (let i = 1; i < this.bordaExterna.length; i++) {
			ctx.lineTo(this.bordaExterna[i].x, this.bordaExterna[i].y);
		}
		ctx.closePath();

		ctx.moveTo(this.bordaInterna[0].x, this.bordaInterna[0].y);
		for (let i = 1; i < this.bordaInterna.length; i++) {
			ctx.lineTo(this.bordaInterna[i].x, this.bordaInterna[i].y);
		}
		ctx.closePath();

		ctx.fill('evenodd');

		this.desenharBorda(ctx, this.bordaExterna, '#ffffff', 3);
		this.desenharBorda(ctx, this.bordaInterna, '#f1c40f', 3);

		this.desenharLinhaDeLargada(ctx);
	}

	private desenharLinhaDeLargada(ctx: CanvasRenderingContext2D): void {
		ctx.save();

		ctx.translate(430, 115);

		ctx.fillStyle = '#ffffff';
		ctx.fillRect(-3, -43, 6, 86);

		ctx.strokeStyle = '#111111';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(-12, -43);
		ctx.lineTo(-12, 43);
		ctx.stroke();

		ctx.restore();
	}

	private desenharBorda(
		ctx: CanvasRenderingContext2D,
		pts: Ponto[],
		cor: string,
		lw: number,
	): void {
		ctx.strokeStyle = cor;
		ctx.lineWidth = lw;
		ctx.beginPath();

		ctx.moveTo(pts[0].x, pts[0].y);
		for (let i = 1; i < pts.length; i++) {
			ctx.lineTo(pts[i].x, pts[i].y);
		}

		ctx.closePath();
		ctx.stroke();
	}
}
