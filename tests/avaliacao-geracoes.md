# Avaliação das Gerações — Critérios de Validação do AG

## Como Executar

```bash
npm install && npm run dev
```

1. Pressione `+` repetidamente até atingir **50×** ou **200×** para acelerar.
2. Observe o HUD (canto superior esquerdo) e o comportamento dos carros.
3. Use os critérios abaixo para avaliar se o AG está convergindo corretamente.

---

## Critérios Observacionais por Faixa de Gerações

### Gerações 1–5: Comportamento Aleatório (esperado)
- [ ] A maioria dos carros colide em menos de 100 frames.
- [ ] O fitness máximo fica abaixo de 100.
- [ ] Os carros se movem em direções aleatórias — sem padrão visível.
- [ ] O indicador "Vivos" cai de 50 para 0 rapidamente.

### Gerações 10–30: Primeiros Sinais de Aprendizado
- [ ] Pelo menos 1–3 carros percorrem a primeira reta sem colidir.
- [ ] O fitness máximo cresce entre gerações consecutivas.
- [ ] Os raios de sensor do melhor carro mostram ajuste: ficam verdes (livres) nas retas.

### Gerações 50–100: Convergência Parcial
- [ ] Carros completam consistentemente a primeira curva.
- [ ] Recorde de fitness ultrapassa **500**.
- [ ] Comportamento visualmente diferente dos carros da G1 — traçado mais suave.
- [ ] Elitismo visível: o melhor carro da geração anterior repete seu traçado.

### Gerações 100+: Convergência Avançada
- [ ] Pelo menos 1 carro completa uma volta inteira sem colidir.
- [ ] Recorde de fitness ultrapassa **2000**.
- [ ] O melhor carro usa os sensores laterais para antecipar curvas.

---

## Tabela de Diagnóstico de Falhas

| Sintoma observado | Causa provável | Correção sugerida |
|---|---|---|
| Fitness estagnado por > 10 gerações | Mutação insuficiente → mínimo local | Aumentar levemente `taxaMutacao` ou ampliar a parcela de imigrantes aleatórios |
| Todos os carros batem no mesmo ponto da curva | Falta de diversidade genética | Aumentar `taxaMutacao`; adicionar reset total |
| Carros caóticos mesmo na G50+ (batem logo na largada) | Mutação alta demais → perde bons genes | Reduzir `taxaMutacao` para 0.02–0.05 |
| Fitness cresce mas carros não completam volta | Função de fitness recompensa movimento sem progresso | Usar progresso sequencial por checkpoints e matar carros sem avanço real |
| Geração nunca termina | Carro girando em círculo dentro da pista | Verificar `MAX_FRAMES_GERACAO` e reduzir `STAGNATION_FRAMES` |
| Crash TypeScript no build | NH alterado mas TAMANHO_GENOMA não atualizado | `TAMANHO_GENOMA = NI*NH + NH + NH*NO + NO` |

---

## Referência de Hiperparâmetros

| Parâmetro | Valor atual | Onde alterar |
|---|---|---|
| `TAMANHO_POPULACAO` | 50 | `src/main.ts` |
| `MAX_FRAMES_GERACAO` | 900 | `src/main.ts` |
| `STAGNATION_FRAMES` | 180 sem progresso real | `src/main.ts` |
| `taxaMutacao` | 0.08 | `src/AlgoritmoGenetico.ts` (padrão em `gerarProximaGeracao`) |
| `NI` (sensores) | 5 | `src/Carro.ts` |
| `NH` (neurônios ocultos) | 16 | `src/Carro.ts` |
| `NO` (outputs) | 4 | `src/Carro.ts` |
| `TAMANHO_GENOMA` | 164 | `src/Carro.ts` (calculado automaticamente) |
| Elitismo | top 4 + 10% imigrantes aleatórios | `src/AlgoritmoGenetico.ts` |

---

## Log de Experimentos

| Data | Geração máx. observada | Recorde fitness | Observação |
|---|---|---|---|
| 24/06/2026 | — | — | Implementação inicial — a preencher após testes |
| 25/06/2026 | 144 | 6000 | Fitness corrigido para progresso sequencial; população saiu da largada sem premiar giro parado |
| 25/06/2026 | 26 | 46149 | Pista substituída por circuito mais amplo; ao menos 1 volta observada em 200× |
| 25/06/2026 | 4 | 20000 | Simulação para ao completar 1 volta; HUD permanece em `Status: concluida` |
| 25/06/2026 | 56 | 20000 | Pista intermediária com curvas em S; último checkpoint fixado na linha de chegada |
