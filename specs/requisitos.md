# Requisitos — Simulador AG 2D

## RF01 — Simulação Base

| ID | Requisito |
|---|---|
| RF01.1 | O sistema renderiza uma pista 2D fechada com bordas interna e externa em HTML5 Canvas (800×600 px). |
| RF01.2 | O sistema renderiza N carros (retângulos) que se movem de forma autônoma, sem input do usuário. |
| RF01.3 | A física inclui: aceleração, atrito, velocidade máxima e rotação angular proporcional à velocidade. |
| RF01.4 | A colisão é detectada por intersecção de segmentos + teste ponto-no-polígono. |
| RF01.5 | Um carro que colide é imobilizado (marcado como `vivo = false`) e renderizado em cinza translúcido. |

## RF02 — Sensores de Distância (Raycasting)

| ID | Requisito |
|---|---|
| RF02.1 | Cada carro possui 5 sensores de raycasting nos ângulos: −90°, −45°, 0°, +45°, +90° relativos ao heading. |
| RF02.2 | Cada sensor retorna a distância normalizada `[0, 1]` até a parede mais próxima (0 = tocando, 1 = alcance máximo de 200 px). |
| RF02.3 | Os raios do melhor carro vivo são renderizados na tela (gradiente vermelho→verde por proximidade). |

## RF03 — Rede Neural (Cérebro do Carro)

| ID | Requisito |
|---|---|
| RF03.1 | Cada carro possui uma rede neural feedforward com arquitetura **5 → 16 → 4** (função de ativação sigmoid). |
| RF03.2 | As 4 saídas correspondem a: `frente`, `trás`, `esquerda`, `direita` (output > 0.5 = ativado). |
| RF03.3 | O genoma (cromossomo) é um `number[]` de **164 pesos** representando todos os pesos e biases da rede. |

## RF04 — Algoritmo Genético

| ID | Requisito |
|---|---|
| RF04.1 | A população inicial tem 50 carros com genomas aleatórios em `[−1, 1]`. |
| RF04.2 | **Fitness:** progresso sequencial na pista (`checkpoints + fração até o próximo checkpoint`) com penalização leve por estagnação; distância girando no lugar não pontua. |
| RF04.3 | **Seleção:** torneio com k=5 candidatos aleatórios; o de maior fitness é selecionado. |
| RF04.4 | **Crossover:** ponto de corte único; o filho herda os genes do pai A até o ponto e do pai B a partir dele. |
| RF04.5 | **Mutação:** taxa de 8%; genes mutados recebem perturbação local, com resets aleatórios raros para escapar de mínimos locais. |
| RF04.6 | **Elitismo:** os 4 melhores indivíduos passam intactos; 10% da nova população entra como imigrantes aleatórios para preservar diversidade. |
| RF04.7 | Uma nova geração é gerada automaticamente quando todos os carros morrem ou após 900 frames; carros sem progresso real por 180 frames são eliminados. |

## RF05 — Interface e Controles

| ID | Requisito |
|---|---|
| RF05.1 | O HUD exibe: geração atual, carros vivos / total, progresso em checkpoints, melhor fitness da geração, recorde histórico e voltas completas. |
| RF05.2 | O usuário pode ajustar a velocidade da simulação via teclas `+` / `−` nos níveis: 1×, 3×, 10×, 50×, 200×. |
| RF05.3 | No modo 200×, as gerações são processadas em timelapse, executando até 200 passos de simulação por frame renderizado. |

## RNF — Não-Funcionais

| ID | Requisito |
|---|---|
| RNF01 | Stack exclusiva: TypeScript, Vite, HTML5 Canvas. Proibido usar libs de física, ML ou simulação externas. |
| RNF02 | O código TypeScript não deve apresentar erros em modo `strict`. |
| RNF03 | O loop de renderização (`requestAnimationFrame`) é desacoplado da lógica de evolução: N passos de simulação ocorrem antes de 1 render. |
| RNF04 | O projeto deve ser reproduzível com `npm install && npm run dev` sem configuração adicional. |
