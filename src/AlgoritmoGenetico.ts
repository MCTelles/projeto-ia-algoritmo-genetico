// Cromossomo: array de pesos da rede neural do carro
export interface Cerebro {
	pesos: number[];
}

export class AlgoritmoGenetico {
	// Fitness: recompensa distância percorrida; tempo vivo é bônus leve
	calcularFitness(
		distanciaPercorrida: number,
		tempoVivo: number,
		vivo = true,
	): number {
		let score = distanciaPercorrida;

		if (!vivo) {
			score *= 0.5;
		}

		score += tempoVivo * 0.1;
		return score;
	}

	// Seleção por torneio: sorteia k candidatos e devolve o melhor
	selecao(populacao: Cerebro[], fitnesses: number[], k = 5): Cerebro {
		let melhorIdx = Math.floor(Math.random() * populacao.length);
		for (let i = 1; i < k; i++) {
			const idx = Math.floor(Math.random() * populacao.length);
			if (fitnesses[idx] > fitnesses[melhorIdx]) melhorIdx = idx;
		}
		return populacao[melhorIdx];
	}

	// Crossover de ponto único: divide o genoma de dois pais em um filho
	crossover(paiA: Cerebro, paiB: Cerebro): Cerebro {
		const ponto = Math.floor(Math.random() * paiA.pesos.length);
		return {
			pesos: [...paiA.pesos.slice(0, ponto), ...paiB.pesos.slice(ponto)],
		};
	}

	// Mutação com chance de alteração drástica em alguns pesos
	mutacao(cerebro: Cerebro, taxaMutacao: number): Cerebro {
		return {
			pesos: cerebro.pesos.map(p => {
				if (Math.random() < taxaMutacao) {
					return Math.random() < 0.5
						? Math.random() * 2 - 1
						: p + (Math.random() * 2 - 1) * 0.5;
				}
				return p;
			}),
		};
	}

	// Gera nova população: elitismo (top 2) + crossover + mutação
	gerarProximaGeracao(
		populacaoAntiga: Cerebro[],
		fitnesses: number[],
		tamanhoPopulacao: number,
		taxaMutacao = 0.15,
	): Cerebro[] {
		// Rankeia por fitness (maior primeiro)
		const ranking = fitnesses
			.map((f, i) => ({ f, i }))
			.sort((a, b) => b.f - a.f);

		const nova: Cerebro[] = [];

		// Elitismo: os 2 melhores passam intactos
		nova.push({ pesos: [...populacaoAntiga[ranking[0].i].pesos] });
		nova.push({ pesos: [...populacaoAntiga[ranking[1].i].pesos] });

		// Preenche o restante da população
		while (nova.length < tamanhoPopulacao) {
			const paiA = this.selecao(populacaoAntiga, fitnesses);
			const paiB = this.selecao(populacaoAntiga, fitnesses);
			const filho = this.crossover(paiA, paiB);
			nova.push(this.mutacao(filho, taxaMutacao));
		}

		return nova;
	}
}
