// Cromossomo: array de pesos da rede neural do carro
export interface Cerebro {
	pesos: number[];
}

export class AlgoritmoGenetico {
	// Fitness por progresso sequencial: girar sem avançar ao próximo checkpoint não pontua.
	calcularFitness(progressoTotal: number, framesSemProgresso = 0): number {
		const progresso = Math.max(0, progressoTotal);
		const penalidadeEstagnacao = Math.min(framesSemProgresso, 300) * 0.2;
		return Math.max(0, progresso * 1000 - penalidadeEstagnacao);
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

	// Mutação majoritariamente local, com resets raros para escapar de loops
	mutacao(cerebro: Cerebro, taxaMutacao: number): Cerebro {
		return {
			pesos: cerebro.pesos.map(p => {
				if (Math.random() >= taxaMutacao) return p;
				const mutado =
					Math.random() < 0.12
						? Math.random() * 2 - 1
						: p + (Math.random() * 2 - 1) * 0.3;
				return Math.max(-3, Math.min(3, mutado));
			}),
		};
	}

	private criarCerebroAleatorio(tamanhoGenoma: number): Cerebro {
		return {
			pesos: Array.from({ length: tamanhoGenoma }, () => Math.random() * 2 - 1),
		};
	}

	// Gera nova população: elitismo moderado + crossover + mutação + imigrantes
	gerarProximaGeracao(
		populacaoAntiga: Cerebro[],
		fitnesses: number[],
		tamanhoPopulacao: number,
		taxaMutacao = 0.08,
	): Cerebro[] {
		// Rankeia por fitness (maior primeiro)
		const ranking = fitnesses
			.map((f, i) => ({ f, i }))
			.sort((a, b) => b.f - a.f);

		const tamanhoGenoma = populacaoAntiga[0]?.pesos.length ?? 0;
		const elites = Math.min(4, tamanhoPopulacao);
		const imigrantes = Math.min(
			Math.floor(tamanhoPopulacao * 0.1),
			tamanhoPopulacao - elites,
		);

		const nova: Cerebro[] = ranking
			.slice(0, elites)
			.map(({ i }) => ({ pesos: [...populacaoAntiga[i].pesos] }));

		// Preenche o restante da população
		while (nova.length < tamanhoPopulacao - imigrantes) {
			const paiA = this.selecao(populacaoAntiga, fitnesses);
			const paiB = this.selecao(populacaoAntiga, fitnesses);
			const filho = this.crossover(paiA, paiB);
			nova.push(this.mutacao(filho, taxaMutacao));
		}

		while (nova.length < tamanhoPopulacao) {
			nova.push(this.criarCerebroAleatorio(tamanhoGenoma));
		}

		return nova;
	}
}
