# AGENTS.md — Simulador AG 2D: Carros Autônomos

## Identidade do Projeto
Simulação 2D no navegador onde carros autônomos aprendem a completar uma pista usando Algoritmo Genético.
Disciplina: Inteligência Artificial 2026/01 — Faculdade Antonio Meneghetti (AMF).
Stack: TypeScript · Vite · HTML5 Canvas. **Zero dependências de física externas.**

## Para Reproduzir
```bash
npm install && npm run dev   # http://localhost:5173
# + / − para ajustar velocidade (1× → 200×)
```

## Mapa de Documentação
| Arquivo | Propósito |
|---|---|
| `specs/projeto.md` | Objetivo, problema resolvido, abordagem da IA |
| `specs/requisitos.md` | Requisitos funcionais (RF) e não-funcionais (RNF) |
| `specs/criterios-aceite.md` | Checklist final de validação da entrega |
| `.ai/context.md` | Contexto completo para o par-programador IA |
| `.ai/prompts.md` | Registro histórico de prompts utilizados |
| `.ai/agents/simulador-ag/agent.md` | Persona e regras do agente de desenvolvimento |
| `.ai/skills/tuner-generico/skill.md` | Skill para diagnóstico de convergência do AG |
| `.ai/skills/designer-pista/skill.md` | Skill para desenho, dificuldade e checkpoints da pista |
| `.ai/skills/validador-simulacao/skill.md` | Skill para validação técnica, visual e de entrega |
| `tests/avaliacao-geracoes.md` | Critérios de validação observacional por geração |
| `docs/README.md` | Documentação técnica aprofundada |

## Arquitetura do Código (`src/`)
```
main.ts               ← loop requestAnimationFrame · gestão de população · HUD · timelapse
Carro.ts              ← física · 5 sensores raycasting · rede neural 5→16→4 · genoma 164 pesos
Pista.ts              ← track Catmull-Rom · verificarColisao · getSegmentos · pontoNaPista
AlgoritmoGenetico.ts  ← calcularFitness · selecao (torneio) · crossover · mutacao · gerarProximaGeracao
```

## Hiperparâmetros Atuais do AG
| Parâmetro | Valor | Arquivo |
|---|---|---|
| `TAMANHO_POPULACAO` | 50 | `src/main.ts` |
| `MAX_FRAMES_GERACAO` | 900 | `src/main.ts` |
| `STAGNATION_FRAMES` | 180 sem progresso real | `src/main.ts` |
| `taxaMutacao` | 0.08 | `src/AlgoritmoGenetico.ts` |
| Arquitetura da rede | 5 → 16 → 4 | `src/Carro.ts` |
| `TAMANHO_GENOMA` | 164 pesos | `src/Carro.ts` |
| Elitismo | top 4 + 10% imigrantes aleatórios | `src/AlgoritmoGenetico.ts` |

## Regras para o Assistente IA
1. **Sem libs externas** — toda matemática é manual (intersecção de segmentos, raycasting, sigmoid).
2. **TypeScript strict** — o código não pode ter erros de tipagem.
3. **Separação de responsabilidades** — física em `Carro.ts`, colisão em `Pista.ts`, AG em `AlgoritmoGenetico.ts`.
4. **Registrar prompts** — toda sessão relevante deve ser adicionada em `.ai/prompts.md`.
5. **Validar visualmente** — rodar `npm run dev`, avançar até geração 50+ e confirmar melhora de fitness.
6. **Usar skills do harness** quando aplicável:
   - `tuner-generico`: problemas de convergência/aprendizado.
   - `designer-pista`: ajustes de pista, checkpoints e linha de chegada.
   - `validador-simulacao`: validação final, checklist e requisitos.

## Pontos de Extensão Futuros
- Visualização de gráfico de fitness por geração
- Salvar/carregar o melhor genoma em `localStorage`
- Aumentar população para 100+ e comparar convergência
