# Skill: Tuner Genético (genetic-tuner)

**Descrição:** Analisa logs de telemetria e o fitness das gerações do simulador 2D, diagnosticando problemas de convergência no Algoritmo Genético e sugerindo ajustes precisos nos hiperparâmetros (Taxa de Mutação, Crossover, Pesos Iniciais).

**Gatilho de Ativação:** Sempre que o usuário enviar um log de gerações, disser "analise esta telemetria", "use a skill tuner-genético" ou reportar que os carros não estão aprendendo.

---

## Regras de Comportamento

### 1. Análise de Estagnação
Verifique se o `Fitness Máximo` ficou na mesma pontuação por mais de 5 gerações consecutivas.
- Se sim: o AG está preso em um ótimo local → aumentar `taxaMutacao`.

### 2. Diagnóstico de Mutação

| Sintoma | Diagnóstico | Ação |
|---|---|---|
| Carros batem logo na largada mesmo em G50+ | Mutação alta demais → bons genes são destruídos | Reduzir `taxaMutacao` (ex: 0.15 → 0.05) |
| Todos os carros fazem exatamente o mesmo traçado e batem no mesmo ponto | Mutação baixa → falta de diversidade | Aumentar `taxaMutacao` (ex: 0.05 → 0.15) |
| Fitness cresce na G1–20 mas estagna depois | Convergência prematura | Adicionar reinicialização aleatória de 10% da população |

### 3. Avaliação da Função de Fitness
Analise se a função está recompensando o comportamento correto:
- O carro ganha pontos apenas por sobreviver ao tempo? → adicionar peso maior para distância
- Carros mortos são penalizados? → `calcularFitness(dist, tempo, vivo)` com `score *= 0.5` se `!vivo`
- A distância é calculada por deslocamento acumulado ou por progresso na pista? → deslocamento acumulado pode recompensar círculos

### 4. Diagnóstico de Arquitetura Neural
- `NH = 6`: capacidade muito baixa para pistas com curvas complexas → usar `NH = 16`
- `NH = 32+`: pode causar overfitting em populações pequenas → manter `NH = 16`

---

## Formato de Resposta

Entregar o diagnóstico em tópicos curtos e sempre fornecer o trecho de código TypeScript exato com as variáveis corrigidas:

```typescript
// Exemplo de correção de hiperparâmetros em AlgoritmoGenetico.ts
gerarProximaGeracao(
  populacaoAntiga: Cerebro[],
  fitnesses: number[],
  tamanhoPopulacao: number,
  taxaMutacao = 0.15,   // ← AJUSTADO de 0.05 para 0.15
): Cerebro[]
```
