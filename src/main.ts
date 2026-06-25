import './app.css';
import { Carro, TAMANHO_GENOMA } from './Carro';
import type { Segmento } from './Carro';
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
const MAX_FRAMES_GERACAO = 3000;
const POSICAO_INICIAL = { x: 450, y: 100, angulo: -Math.PI / 2 };

const pista = new Pista();
const ag = new AlgoritmoGenetico();
const segmentos: Segmento[] = pista.getSegmentos();

let geracao = 1;
let frameGeracao = 0;
let recordeFitness = 0;

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

let carros = criarCarros(
	Array.from({ length: TAMANHO_POPULACAO }, () => ({
		pesos: Array.from({ length: TAMANHO_GENOMA }, () => Math.random() * 2 - 1),
	})),
);

function passo(): void {
	frameGeracao++;

	if (frameGeracao >= MAX_FRAMES_GERACAO) {
		for (const c of carros) c.vivo = false;
	}

	for (const carro of carros) {
		if (!carro.vivo) continue;
		carro.atualizarSensores(segmentos);
		carro.update();
		if (pista.verificarColisao(carro)) carro.vivo = false;
	}

	if (carros.every(c => !c.vivo)) {
		const cerebrosAntigos = carros.map(c => ({ pesos: c.cerebro! }));
		const fitnesses = carros.map(c =>
			ag.calcularFitness(c.distanciaPercorrida, c.tempoVivo),
		);
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
	const melhorFit = Math.max(
		...carros.map(c => ag.calcularFitness(c.distanciaPercorrida, c.tempoVivo)),
	);

	renderCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
	renderCtx.fillRect(10, 10, 220, 110);

	renderCtx.fillStyle = '#ecf0f1';
	renderCtx.font = '14px monospace';
	renderCtx.fillText(`Geração    : ${geracao}`, 18, 32);
	renderCtx.fillText(`Vivos      : ${vivos} / ${TAMANHO_POPULACAO}`, 18, 52);
	renderCtx.fillText(`Melhor fit : ${melhorFit.toFixed(0)}`, 18, 72);
	renderCtx.fillText(`Recorde    : ${recordeFitness.toFixed(0)}`, 18, 92);

	const label = velocidade === 1 ? '1× (normal)' : `${velocidade}× ⚡`;
	renderCtx.fillStyle = velocidade > 10 ? '#f39c12' : '#2ecc71';
	renderCtx.fillText(`Velocidade : ${label}`, 18, 112);
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
		.sort((a, b) => b.distanciaPercorrida - a.distanciaPercorrida)[0];

	for (const carro of carros) {
		carro.desenhar(renderCtx, carro === melhorVivo, segmentos);
	}

	desenharHUD();

	requestAnimationFrame(loop);
}

loop();
