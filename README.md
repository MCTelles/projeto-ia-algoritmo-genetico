# Simulador AG 2D — Carros Autônomos

Simulação no navegador onde uma população de carros autônomos aprende a completar uma pista usando **Algoritmo Genético** e redes neurais simples.

Projeto desenvolvido para a disciplina de **Inteligência Artificial 2026/01** — Faculdade Antonio Meneghetti (AMF).

## Como Rodar

**Pré-requisitos:** Node.js 18+

```bash
npm install
npm run dev   # abre em http://localhost:5173
```

**Controles em tela:**
| Tecla | Ação |
|---|---|
| `+` | Aumenta velocidade da simulação |
| `-` | Diminui velocidade |
| Níveis | 1× → 3× → 10× → 50× → 200× |

## Como Funciona

### O Ciclo de Aprendizado

```
Geração N (50 carros com genomas) →
  cada carro lê 5 sensores de distância →
    rede neural calcula controles →
      física move o carro →
        colisão? → morre →
          todos mortos → AlgoritmoGenetico.gerarProximaGeracao() →
Geração N+1 (mais inteligente)
```

### Rede Neural (por carro)

```
[sensor L90] ─┐
[sensor L45] ─┤
[sensor F  ] ─┼─ 16 neurônios ocultos (sigmoid) ─→ [frente]
[sensor R45] ─┤                                  ─→ [trás]
[sensor R90] ─┘                                  ─→ [esquerda]
                                                  ─→ [direita]
```
Genoma = 164 pesos (floats em [-1, 1])

### Algoritmo Genético

| Etapa | Estratégia |
|---|---|
| **Fitness** | progresso sequencial: checkpoints + fração até o próximo checkpoint |
| **Seleção** | Torneio k=5 |
| **Crossover** | Ponto único |
| **Mutação** | 8% — perturbação local com resets aleatórios raros |
| **Elitismo** | Top 4 intactos + 10% de imigrantes aleatórios |

## Estrutura do Projeto

```
/
├── src/
│   ├── Carro.ts              # física, 5 sensores raycasting, rede neural 5→16→4
│   ├── Pista.ts              # track Catmull-Rom suavizado, colisão por segmentos
│   ├── AlgoritmoGenetico.ts  # seleção, crossover, mutação, elitismo
│   └── main.ts               # loop rAF, gestão de população, HUD, timelapse
├── specs/
│   ├── projeto.md            # objetivo e abordagem da IA
│   ├── requisitos.md         # requisitos funcionais e não-funcionais
│   └── criterios-aceite.md   # checklist de validação
├── .ai/
│   ├── context.md            # orientações para o par-programador IA
│   ├── prompts.md            # histórico de prompts
│   ├── agents/simulador-ag/  # definição do agente de desenvolvimento
│   └── skills/tuner-generico/# skill de diagnóstico do AG
├── tests/
│   └── avaliacao-geracoes.md # critérios de validação observacional
├── docs/
│   └── README.md             # documentação técnica aprofundada
├── AGENTS.md                 # mapa de entrada para o assistente IA
├── index.html
├── package.json
└── tsconfig.json
```

## Harness de Desenvolvimento

O projeto usa **Harness/Context Engineering**: um conjunto estruturado de arquivos que orienta o assistente IA durante o desenvolvimento.

- `.ai/context.md` — responde "como a IA deve se comportar?"
- `.ai/prompts.md` — registro de todos os prompts relevantes
- `specs/` — especificações que definem o que deve ser construído
- `tests/` — critérios que definem como validar o que foi construído

Ver [`AGENTS.md`](AGENTS.md) para o mapa completo.
