import './app.css';
import { Carro, TAMANHO_GENOMA } from './Carro';
import type { Ponto, Segmento } from './Carro';
import { Pista } from './Pista';
import { AlgoritmoGenetico } from './AlgoritmoGenetico';
import type { Cerebro } from './AlgoritmoGenetico';

const canvasElement = document.getElementById('canvas');
if (!(canvasElement instanceof HTMLCanvasElement)) {
	throw new Error('Canvas não encontrado.');
}

const canvas = canvasElement;
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Contexto 2D não disponível.');
const renderCtx: CanvasRenderingContext2D = ctx;

canvas.width = 800;
canvas.height = 600;


const TAMANHO_POPULACAO = 50;
const MAX_FRAMES_GERACAO = 900;
const STAGNATION_FRAMES = 180;
const NUM_CHECKPOINTS = 20;
const RAIO_CHECKPOINT = 40;
const RAIO_CHEGADA = 28;
const MIN_PROGRESSO_REAL = 0.002;
const POSICAO_INICIAL = { x: 460, y: 115, angulo: Math.PI / 2 };

const pista = new Pista();
const ag = new AlgoritmoGenetico();
const segmentos: Segmento[] = pista.getSegmentos();
const checkpoints: Ponto[] = pista.getCheckpoints(NUM_CHECKPOINTS);

let geracao = 1;
let frameGeracao = 0;
let recordeFitness = 0;
let simulacaoEncerrada = false;
let vencedor: Carro | undefined;

const NIVEIS_VELOCIDADE = [1, 3, 10, 50, 200] as const;
let nivelVelocidade = 0;

document.addEventListener('keydown', e => {
	if (e.key === '+' || e.key === '=') {
		nivelVelocidade = Math.min(
			nivelVelocidade + 1,
			NIVEIS_VELOCIDADE.length - 1,
		);
	}
	if (e.key === '-' || e.key === '_') {
		nivelVelocidade = Math.max(nivelVelocidade - 1, 0);
	}
});

function criarCarros(cerebros: Cerebro[]): Carro[] {
	return cerebros.map(cb => {
		const c = new Carro(
			POSICAO_INICIAL.x,
			POSICAO_INICIAL.y,
			POSICAO_INICIAL.angulo,
		);
		c.cerebro = cb.pesos;
		return c;
	});
}

function totalCheckpoints(c: Carro): number {
	return c.voltasCompletas * NUM_CHECKPOINTS + c.checkpointAtual;
}

function clamp01(valor: number): number {
	return Math.max(0, Math.min(1, valor));
}

function distancia(a: Ponto, b: Ponto): number {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

function pontoReferenciaCheckpoint(c: Carro): Ponto {
	if (totalCheckpoints(c) === 0 && c.checkpointAtual === 0) {
		return POSICAO_INICIAL;
	}

	return checkpoints[(c.checkpointAtual - 1 + NUM_CHECKPOINTS) % NUM_CHECKPOINTS];
}

function progressoAteProximoCheckpoint(c: Carro): number {
	const alvo = checkpoints[c.checkpointAtual];
	const referencia = pontoReferenciaCheckpoint(c);
	const raioAlvo =
		c.checkpointAtual === NUM_CHECKPOINTS - 1 ? RAIO_CHEGADA : RAIO_CHECKPOINT;
	const distanciaReferencia = Math.max(1, distancia(referencia, alvo) - raioAlvo);
	const distanciaAtual = Math.max(
		0,
		distancia({ x: c.x, y: c.y }, alvo) - raioAlvo,
	);

	return clamp01(1 - distanciaAtual / distanciaReferencia);
}

function progressoTotal(c: Carro): number {
	return totalCheckpoints(c) + progressoAteProximoCheckpoint(c);
}

function atualizarProgresso(c: Carro): void {
	const progresso = progressoTotal(c);

	if (progresso > c.melhorProgressoTotal + MIN_PROGRESSO_REAL) {
		c.melhorProgressoTotal = progresso;
		c.framesSemProgresso = 0;
		return;
	}

	c.framesSemProgresso++;
	if (c.framesSemProgresso >= STAGNATION_FRAMES) c.vivo = false;
}

function fitnessCarro(c: Carro): number {
	return ag.calcularFitness(c.melhorProgressoTotal, c.framesSemProgresso);
}

function encerrarSimulacao(carro: Carro): void {
	simulacaoEncerrada = true;
	vencedor = carro;
	carro.melhorProgressoTotal = Math.max(
		carro.melhorProgressoTotal,
		carro.voltasCompletas * NUM_CHECKPOINTS,
	);
	const fitnessVencedor = fitnessCarro(carro);
	if (fitnessVencedor > recordeFitness) recordeFitness = fitnessVencedor;

	for (const c of carros) {
		c.velocidade = 0;
	}
}

let carros = criarCarros(
	Array.from({ length: TAMANHO_POPULACAO }, () => ({
		pesos: Array.from({ length: TAMANHO_GENOMA }, () => Math.random() * 2 - 1),
	})),
);

function passo(): void {
	if (simulacaoEncerrada) return;

	frameGeracao++;

	if (frameGeracao >= MAX_FRAMES_GERACAO) {
		for (const c of carros) c.vivo = false;
	}

		for (const carro of carros) {
			if (!carro.vivo) continue;
			carro.atualizarSensores(segmentos);
			carro.update();
			const cp = checkpoints[carro.checkpointAtual];
			const raioCheckpoint =
				carro.checkpointAtual === NUM_CHECKPOINTS - 1
					? RAIO_CHEGADA
					: RAIO_CHECKPOINT;

			if (Math.hypot(carro.x - cp.x, carro.y - cp.y) < raioCheckpoint) {
				carro.checkpointAtual++;
				carro.framesSemProgresso = 0;

				if (carro.checkpointAtual >= NUM_CHECKPOINTS) {
					carro.voltasCompletas++;
					carro.checkpointAtual = NUM_CHECKPOINTS - 1;
					encerrarSimulacao(carro);
					return;
				}
			}

			atualizarProgresso(carro);
			if (pista.verificarColisao(carro)) carro.vivo = false;
		}

	if (carros.every(c => !c.vivo)) {
		const cerebrosAntigos = carros.map(c => ({ pesos: c.cerebro! }));
		const fitnesses = carros.map(fitnessCarro);
		const melhor = Math.max(...fitnesses);
		if (melhor > recordeFitness) recordeFitness = melhor;

		carros = criarCarros(
			ag.gerarProximaGeracao(cerebrosAntigos, fitnesses, TAMANHO_POPULACAO),
		);
		geracao++;
		frameGeracao = 0;
	}
}

function desenharHUD(): void {
	const velocidade = NIVEIS_VELOCIDADE[nivelVelocidade];
	const vivos = carros.filter(c => c.vivo).length;
	const melhorProgresso = Math.max(...carros.map(c => c.melhorProgressoTotal));
	const melhorFit = Math.max(...carros.map(fitnessCarro));
	const melhorVoltas = Math.max(...carros.map(c => c.voltasCompletas));
	const status = simulacaoEncerrada ? 'concluida' : 'rodando';

	renderCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
	renderCtx.fillRect(10, 10, 250, 175);

	renderCtx.fillStyle = '#ecf0f1';
	renderCtx.font = '14px monospace';
	renderCtx.fillText(`Geração    : ${geracao}`, 18, 32);
	renderCtx.fillText(`Vivos      : ${vivos} / ${TAMANHO_POPULACAO}`, 18, 52);
	renderCtx.fillText(`Progresso  : ${melhorProgresso.toFixed(2)} CP`, 18, 72);
	renderCtx.fillText(`Melhor fit : ${melhorFit.toFixed(0)}`, 18, 92);
	renderCtx.fillText(`Recorde    : ${recordeFitness.toFixed(0)}`, 18, 112);
	renderCtx.fillText(`Voltas     : ${melhorVoltas}`, 18, 132);
	renderCtx.fillText(`Status     : ${status}`, 18, 152);

	const label = velocidade === 1 ? '1× (normal)' : `${velocidade}× ⚡`;
	renderCtx.fillStyle = velocidade > 10 ? '#f39c12' : '#2ecc71';
	renderCtx.fillText(`Velocidade : ${label}`, 18, 172);
}

function desenharCheckpoints(melhorVivo: Carro | undefined): void {
	for (let i = 0; i < checkpoints.length; i++) {
		const cp = checkpoints[i];
		const isProximo = melhorVivo !== undefined && i === melhorVivo.checkpointAtual;

		renderCtx.beginPath();
		renderCtx.arc(cp.x, cp.y, isProximo ? 10 : 5, 0, Math.PI * 2);
		renderCtx.fillStyle = isProximo ? '#f1c40f' : 'rgba(255,255,255,0.2)';
		renderCtx.fill();

		if (isProximo) {
			renderCtx.strokeStyle = '#f39c12';
			renderCtx.lineWidth = 2;
			renderCtx.stroke();
		}
	}
}

function loop(): void {
	const passos = NIVEIS_VELOCIDADE[nivelVelocidade];
	for (let i = 0; i < passos; i++) passo();

	const largura = canvas.width;
	const altura = canvas.height;
	renderCtx.clearRect(0, 0, largura, altura);
	pista.desenhar(renderCtx);

	const melhorVivo = carros
		.filter(c => c.vivo)
		.sort((a, b) => b.melhorProgressoTotal - a.melhorProgressoTotal)[0];
	const destaque = vencedor ?? melhorVivo;

	desenharCheckpoints(destaque);

	for (const carro of carros) {
		carro.desenhar(renderCtx, carro === destaque, segmentos);
	}

	desenharHUD();

	requestAnimationFrame(loop);
}

loop();
