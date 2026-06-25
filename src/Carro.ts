// ─── Tipos de geometria compartilhados ────────────────────────────────────────
export type Ponto = { x: number; y: number };
export type Segmento = { a: Ponto; b: Ponto };

// ─── Arquitetura da rede neural embutida no carro ─────────────────────────────
// No topo do Carro.ts
const NI = 5; // entradas (sensores)
const NH = 16; // AUMENTE DE 6 PARA 16 (Dê mais neurônios para ela processar a curva)
const NO = 4; // saídas

export const TAMANHO_GENOMA = NI * NH + NH + NH * NO + NO;

// Número de pesos: (NI×NH + NH) + (NH×NO + NO) = 36 + 28 = 64

function sigmoid(x: number): number {
	return 1 / (1 + Math.exp(-x));
}

// Intersecção raio-segmento. Retorna t (distância) ou null se não há cruzamento.
function raioIntersecao(
	origem: Ponto,
	dir: Ponto,
	a: Ponto,
	b: Ponto,
): number | null {
	const dx = b.x - a.x,
		dy = b.y - a.y;
	const denom = dir.x * dy - dir.y * dx;
	if (Math.abs(denom) < 1e-10) return null;

	const t = ((a.x - origem.x) * dy - (a.y - origem.y) * dx) / denom;
	const u = ((a.x - origem.x) * dir.y - (a.y - origem.y) * dir.x) / denom;

	return t >= 0 && u >= 0 && u <= 1 ? t : null;
}

// ─── Classe Carro ─────────────────────────────────────────────────────────────
export class Carro {
	static imagemCarro: HTMLImageElement | null = null;

	x: number;
	y: number;
	angulo: number;
	velocidade = 0;

	readonly largura = 20;
	readonly comprimento = 35;

	// Estado do AG
	cerebro: number[] | null = null; // genes (pesos da rede)
	vivo = true;
	distanciaPercorrida = 0;
	tempoVivo = 0;

	// Leituras dos 5 sensores (0 = parede tocando · 1 = alcance máximo)
	sensores: number[] = new Array(NI).fill(1);

	private readonly ALCANCE_SENSOR = 200;
	private readonly ANGULOS_SENSOR = [
		-Math.PI / 2,
		-Math.PI / 4,
		0,
		Math.PI / 4,
		Math.PI / 2,
	] as const;
	private readonly aceleracao = 0.2;
	private readonly atrito = 0.05;
	private readonly velocidadeMaxima = 4;
	private readonly anguloVirada = 0.03;

	constructor(x: number, y: number, anguloInicial = 0) {
		this.x = x;
		this.y = y;
		this.angulo = anguloInicial;
	}

	// Atualiza as leituras dos sensores com raycasting contra os segmentos da pista
	atualizarSensores(segmentos: Segmento[]): void {
		for (let i = 0; i < this.ANGULOS_SENSOR.length; i++) {
			const ang = this.angulo + this.ANGULOS_SENSOR[i];
			const dir: Ponto = { x: Math.sin(ang), y: -Math.cos(ang) };
			let minT = this.ALCANCE_SENSOR;

			for (const seg of segmentos) {
				const t = raioIntersecao({ x: this.x, y: this.y }, dir, seg.a, seg.b);
				if (t !== null && t < minT) minT = t;
			}

			this.sensores[i] = minT / this.ALCANCE_SENSOR; // normalizado [0,1]
		}
	}

	// Feedforward da rede neural: sensores → controles booleanos
	private computarControles(): {
		frente: boolean;
		tras: boolean;
		esquerda: boolean;
		direita: boolean;
	} {
		const noop = {
			frente: false,
			tras: false,
			esquerda: false,
			direita: false,
		};
		if (!this.cerebro) return noop;

		const w = this.cerebro;

		// Camada oculta
		const hidden = Array.from({ length: NH }, (_, h) => {
			let sum = w[NI * NH + h]; // bias
			for (let i = 0; i < NI; i++) sum += this.sensores[i] * w[h * NI + i];
			return sigmoid(sum);
		});

		// Camada de saída
		const out = Array.from({ length: NO }, (_, o) => {
			let sum = w[NI * NH + NH + NH * NO + o]; // bias
			for (let h = 0; h < NH; h++)
				sum += hidden[h] * w[NI * NH + NH + o * NH + h];
			return sigmoid(sum) > 0.5;
		});

		return { frente: out[0], tras: out[1], esquerda: out[2], direita: out[3] };
	}

	// Física + IA por frame. Não faz nada se o carro já está morto.
	update(): void {
		if (!this.vivo) return;

		const ctrl = this.computarControles();

		if (ctrl.frente) this.velocidade += this.aceleracao;
		if (ctrl.tras) this.velocidade -= this.aceleracao;

		if (this.velocidade > this.velocidadeMaxima)
			this.velocidade = this.velocidadeMaxima;
		if (this.velocidade < -this.velocidadeMaxima / 2)
			this.velocidade = -this.velocidadeMaxima / 2;

		if (Math.abs(this.velocidade) > 0.001) {
			const sinal = this.velocidade > 0 ? 1 : -1;
			if (ctrl.esquerda) this.angulo -= this.anguloVirada * sinal;
			if (ctrl.direita) this.angulo += this.anguloVirada * sinal;
		}

		this.velocidade *= 1 - this.atrito;

		this.x += Math.sin(this.angulo) * this.velocidade;
		this.y -= Math.cos(this.angulo) * this.velocidade;

		this.distanciaPercorrida += Math.abs(this.velocidade);
		this.tempoVivo++;
	}

	// Retorna os 4 vértices do retângulo rotacionado (colisão e visualização)
	getPoligono(): Ponto[] {
		const rad = Math.hypot(this.largura, this.comprimento) / 2;
		const alpha = Math.atan2(this.largura, this.comprimento);

		return [
			{
				x: this.x - Math.sin(this.angulo - alpha) * rad,
				y: this.y - Math.cos(this.angulo - alpha) * rad,
			},
			{
				x: this.x - Math.sin(this.angulo + alpha) * rad,
				y: this.y - Math.cos(this.angulo + alpha) * rad,
			},
			{
				x: this.x - Math.sin(Math.PI + this.angulo - alpha) * rad,
				y: this.y - Math.cos(Math.PI + this.angulo - alpha) * rad,
			},
			{
				x: this.x - Math.sin(Math.PI + this.angulo + alpha) * rad,
				y: this.y - Math.cos(Math.PI + this.angulo + alpha) * rad,
			},
		];
	}

	desenhar(
		ctx: CanvasRenderingContext2D,
		mostrarSensores = false,
		segmentos?: Segmento[],
	): void {
		// Sensores (opcional: apenas para o melhor carro)
		if (mostrarSensores && segmentos) {
			for (let i = 0; i < this.ANGULOS_SENSOR.length; i++) {
				const ang = this.angulo + this.ANGULOS_SENSOR[i];
				const dist = this.sensores[i] * this.ALCANCE_SENSOR;
				const endX = this.x + Math.sin(ang) * dist;
				const endY = this.y - Math.cos(ang) * dist;
				const ratio = this.sensores[i]; // 1 = livre, 0 = parede

				ctx.strokeStyle = `rgba(${Math.round(255 * (1 - ratio))}, ${Math.round(255 * ratio)}, 0, 0.7)`;
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.moveTo(this.x, this.y);
				ctx.lineTo(endX, endY);
				ctx.stroke();
			}
		}

		if (!Carro.imagemCarro) {
			Carro.imagemCarro = new Image();
			Carro.imagemCarro.onerror = () => {
				Carro.imagemCarro = null;
			};
			Carro.imagemCarro.src = '/carro.png';
		}

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angulo);

		const largura = 30;
		const altura = 50;

		if (
			Carro.imagemCarro &&
			(Carro.imagemCarro.complete || Carro.imagemCarro.naturalWidth > 0)
		) {
			ctx.drawImage(
				Carro.imagemCarro,
				-largura / 2,
				-altura / 2,
				largura,
				altura,
			);
		} else {
			ctx.globalAlpha = this.vivo ? 1 : 0.25;
			ctx.fillStyle = this.vivo ? '#ff4d4f' : '#95a5a6';
			ctx.fillRect(-largura / 2, -altura / 2, largura, altura);
			ctx.fillStyle = '#1f1f1f';
			ctx.fillRect(-largura / 2 + 4, -altura / 2 + 8, largura - 8, 10);
			ctx.fillRect(-largura / 2 + 6, -altura / 2 + 18, 8, 12);
			ctx.fillRect(largura / 2 - 14, -altura / 2 + 18, 8, 12);
			ctx.fillStyle = '#111';
			ctx.beginPath();
			ctx.arc(-8, altura / 2 - 4, 4, 0, Math.PI * 2);
			ctx.arc(8, altura / 2 - 4, 4, 0, Math.PI * 2);
			ctx.fill();
		}

		if (mostrarSensores) {
			ctx.strokeStyle = 'yellow';
			ctx.lineWidth = 2;
			ctx.strokeRect(-largura / 2, -altura / 2, largura, altura);
		}

		ctx.restore();
	}
}
