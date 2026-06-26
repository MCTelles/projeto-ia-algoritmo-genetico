**Data:** 24/06/2026
**Objetivo:** Criar o motor físico base do carro e da pista em TypeScript.

**Prompt utilizado:**
"Atue como um desenvolvedor especialista em TypeScript e simulações 2D.
Preciso do código base para a classe `Carro.ts` e `Pista.ts` rodando em um HTML5 Canvas padrão, sem bibliotecas externas de física (para manter o código simples e leve).

Requisitos do Carro:

- Deve ter posição (x, y), ângulo, velocidade e aceleração.
- Deve conseguir virar para a esquerda/direita e acelerar para frente.
- Deve ter uma função `update()` para calcular a física a cada frame.
- Deve ter os limites (bounding box) calculados para detecção de colisão.

Requisitos da Pista:

- Deve ser composta por polígonos simples (bordas internas e externas).
- Deve ter uma função `verificarColisao(carro)` que retorna 'true' se os limites do carro cruzarem os limites da pista."

# Registro de Prompts (Harness)

**Data:** 24/06/2026
**Objetivo:** Implementar o motor físico base do simulador (Carro e Pista).
**Ferramenta:** Claude / Gemini
**Prompt:**

> Atue como um desenvolvedor especialista em TypeScript e simulações 2D.
> Preciso do código base para a classe `Carro.ts` e `Pista.ts` rodando em um HTML5 Canvas padrão, sem bibliotecas externas de física. O Carro deve ter posição, ângulo, velocidade, função update() e bounding box. A Pista deve ter polígonos simples e uma função verificarColisao(carro). Retorne código limpo e tipado.

---

**Data:** 24/06/2026
**Objetivo:** Implementar a lógica central do Algoritmo Genético (Avaliação, Seleção, Crossover e Mutação).
**Ferramenta:** Claude / Gemini
**Prompt:**

> Atue como um Engenheiro de IA especializado em Algoritmos Genéticos. Estamos desenvolvendo um simulador 2D em TypeScript puro onde carros aprendem a dirigir sozinhos.
>
> Escreva a classe `AlgoritmoGenetico.ts`. Ela não deve ter dependências de interface gráfica, apenas matemática e lógica de arrays.
>
> A classe deve conter:
>
> 1. Uma interface/tipo para o `Cerebro` (Cromossomo) do carro, que será basicamente um array de `number` (representando os pesos das decisões de direção).
> 2. O método `calcularFitness(distanciaPercorrida: number, tempoVivo: number): number`: que define a pontuação de um indivíduo.
> 3. O método `selecao(populacao: Cerebro[], fitnesses: number[]): Cerebro`: que escolhe um indivíduo para reprodução priorizando os maiores _fitness_ (use o método da roleta ou torneio).
> 4. O método `crossover(paiA: Cerebro, paiB: Cerebro): Cerebro`: que combina o array de pesos de dois pais para gerar o cérebro de um filho (pode ser ponto de corte único).
> 5. O método `mutacao(cerebro: Cerebro, taxaMutacao: number): Cerebro`: que percorre os pesos e, de acordo com a `taxaMutacao` (ex: 0.05), altera o valor aleatoriamente para garantir diversidade.
> 6. O método principal `gerarProximaGeracao(populacaoAntiga: Cerebro[], fitnesses: number[], tamanhoPopulacao: number): Cerebro[]`: que orquestra os métodos acima criando uma nova geração baseada nos melhores da geração anterior (elitismo opcional, mas recomendado manter o top 1 intacto).
> 
> Retorne apenas o código TypeScript, rigorosamente tipado e com comentários curtos explicando a lógica matemática de cada passo.

---

**Data:** 25/06/2026
**Objetivo:** Corrigir convergência indevida em que carros giravam no início e ainda acumulavam fitness.
**Ferramenta:** Codex
**Prompt:**

> O carro está em loop logo no início. Em uns 2 a 3 segundos o fitness está normal, porém, quando segue ele continua em loop no início, rodando, e começa a contar fitness. Após isso, os outros começam a achar que o correto é ficar rodando no início.

**Ajuste aplicado:**
Fitness passou a usar progresso sequencial por checkpoints (`checkpoints + fração até o próximo checkpoint`) em vez de distância acumulada. Carros sem progresso real por 180 frames são eliminados. O AG passou a usar elitismo top 4, taxa de mutação 0.08 e 10% de imigrantes aleatórios por geração para reduzir monocultura de trajetos ruins.

---

**Data:** 25/06/2026
**Objetivo:** Analisar gravação de tela com comportamento incorreto após ajuste anti-loop.
**Ferramenta:** Codex
**Prompt:**

> Analise o que está acontecendo de errado.

**Diagnóstico:**
A gravação vinha da cópia antiga em `simulador-carros/`, não do app raiz recém-ajustado. Essa cópia ainda usava `distanciaPercorrida + tempoVivo` como fitness e iniciava o carro em `{ x: 450, y: 100, angulo: -Math.PI / 2 }`, apontando para a esquerda. O AG era recompensado por movimento acumulado sem progresso sequencial e aprendia a girar/estagnar perto da largada.

**Ajuste aplicado:**
Sincronizada a pasta `simulador-carros/` com a lógica de checkpoints, progresso real, eliminação por estagnação, mutação 0.08, elitismo top 4 e 10% de imigrantes aleatórios. A duplicata antiga `simulador-carros/src/app.tsx` foi removida porque não era usada pelo `index.html` e quebrava o build com referências antigas.

---

**Data:** 25/06/2026
**Objetivo:** Substituir a pista por um circuito mais simples para facilitar a aprendizagem inicial.
**Ferramenta:** Codex
**Prompt:**

> Crie outra pista, acho que a pista está muito difícil para o carro, as curvas estão muito fechadas.

**Ajuste aplicado:**
A pista foi redesenhada com 11 pontos de controle, curvas amplas, largura de 96 px e largada reposicionada em `{ x: 450, y: 115, angulo: Math.PI / 2 }`. A mudança foi aplicada tanto no projeto raiz quanto em `simulador-carros/`. Em validação visual a 200×, a versão `simulador-carros/` atingiu geração 26 com pelo menos 1 volta completa observada.

---

**Data:** 25/06/2026
**Objetivo:** Parar a simulação quando um carro completar a volta e cruzar novamente a linha de chegada.
**Ferramenta:** Codex
**Prompt:**

> Ok, porém ao chegar na linha de chegada novamente deve parar.

**Ajuste aplicado:**
Adicionado estado `simulacaoEncerrada` e `vencedor` no loop principal. Quando um carro completa todos os checkpoints e incrementa `voltasCompletas`, a simulação congela, zera a velocidade dos carros, fixa o progresso em `20.00 CP`, atualiza o recorde do vencedor e mostra `Status: concluida` no HUD. A regra foi aplicada no projeto raiz e em `simulador-carros/`.

---

**Data:** 25/06/2026
**Objetivo:** Tornar a pista menos simples e corrigir o checkpoint final para coincidir com a linha de chegada.
**Ferramenta:** Codex
**Prompt:**

> Parou ali.. a pista está muito simples, deixe um pouco mais difícil, adicione algumas curvas que sejam possíveis do carro fazer. E também corrija, o último checkpoint deve ser a linha de chegada.

**Ajuste aplicado:**
A pista foi redesenhada com 14 pontos de controle, largura de 86 px, curvas em S suaves e retas de recuperação. `getCheckpoints()` agora força o último checkpoint a ser `centro[0]`, o mesmo ponto usado para desenhar a linha de chegada. O raio dos checkpoints comuns permanece em 40 px, mas a chegada usa raio de 28 px para concluir mais próximo da linha. Em validação visual a 200×, a versão `simulador-carros/` completou em G56 e parou com o checkpoint amarelo sobre a linha de chegada.

---

**Data:** 24/06/2026
**Objetivo:** Registrar o histórico inicial de prompts que levou à escolha do projeto, à decisão por uma simulação 2D com Algoritmo Genético e à criação da estrutura de documentação/harness.
**Ferramenta:** ChatGPT / Codex
**Origem:** Histórico manual fornecido pelo usuário.

**Prompts do usuário:**

1. Ideia inicial do projeto e referência ao PDF:

> Lhe envio as instruções no pdf também.
>
> A minha ideia é utilizar um algoritmo genético para fazer um carro em um modelo 3d andar por uma pista e completar a pista... é possivel?

2. Decisão por 2D e dúvida sobre melhor traçado:

> Sim, vamos fazer em 2D.
>
> Apenas antes, esses dias eu vi um em 3D me parece, onde o carro conseguia fazer o melhor traçado da pista... é o mesmo algoritmo?

3. Definição do caminho com AG:

> Ok, vamos fazer com AG então.. como podemos começar?

4. Pedido para estruturar critérios de aceite e contexto:

> Como estou esperando os tokens do claude voltar, vamos fazer esse: Critérios de Aceite e Contexto.

5. Confirmação para prosseguir:

> Sim por favor.

6. Dúvida sobre manter ou apagar conteúdo anterior em `prompts.md`:

> Para colar isso no prompts.md devo apagar oq antes haviamos colocado?

7. Dúvida sobre estrutura numerada de pastas/documentos:

> Ok, ele vai gerar para mim 001-pasta, 002-outrapasta? Para como se refizesse o projeto ele ter a base? É mais ou menos isso que entendi, se estiver errado me corrija.

8. Registro de necessidade futura:

> Ok, mas vou precisar fazer isso... então tenha em mente isso.

9. Sugestão de adicionar skills ao projeto:

> Não está especificado, mas seria bom se tivessemos skills no projeto.

10. Dúvida sobre o primeiro item da estrutura:

> Qual é o 001?

11. Dúvida sobre localização do item 001:

> 001 fica dentro de alguma pasta?

12. Pedido de prompt para continuar em outra ferramenta:

> Me envie um prompt agora do que exatamente estamos fazendo. Vou colocar no claude.

13. Pedido para exportar prompts em JSON:

> Consegue me entregar todos os prompts que te enviei aqui em json?

**Ajuste aplicado:**
Os prompts foram convertidos do JSON fornecido pelo usuário para um registro cronológico em Markdown, mantendo o texto original e adicionando contexto de objetivo, ferramenta e origem para atender à exigência de rastreabilidade do projeto.

---

**Data:** 24/06/2026
**Objetivo:** Registrar histórico complementar de prompts usados durante a tentativa inicial de criação da pista, migração para Vite, ajuste visual do canvas, correção da posição/orientação do carro, uso de sprite e diagnóstico de baixa convergência.
**Ferramenta:** ChatGPT / Codex / Claude
**Origem:** Histórico manual complementar fornecido pelo usuário.

**Prompts do usuário:**

1. Dúvida sobre alteração da pista a partir do código existente:

> import type { Ponto, Segmento } from './Carro'; // Intersecção segmento-segmento (usado em verificarColisao)... quero fazer uma pista diferente, não oval... como posso ajustar?

2. Uso de referência do Google Maps:

> Peguei essa imagem no maps, consigo fazer essa pista?

3. Problema de estrutura do projeto fora do Vite:

> Está tudo em um arquivo index.html... acho que era pra ser vite, mas a ia nao gerou.

4. Continuação após ajuste inicial:

> Ok, fiz isso, e agora?

5. Dúvida sobre posicionamento/estilo do canvas:

> E o css do canva agora? Não tem como colocar isso solto no meio do nada, me mostre como colocar.

6. Continuação após escolher a primeira opção:

> Fiz a opcao 1... e agora?

7. Envio de coordenadas da borda externa:

> main.ts:30 { x: 459, y: 230 }, ... (lista de coordenadas) ... ele em entregou a borda externa assim.

8. Novo envio de coordenadas da borda externa:

> main.ts:30 { x: 84, y: 497 }, ... (lista de coordenadas) ... borda externa.

9. Reforço da dúvida sobre CSS do canvas:

> E o css do canva agora?

10. Problemas de escala e orientação inicial:

> A pista ficou muito pequena, consegue aumentar o tamanho dela, e o carro está nascendo de lado.

11. Problemas de spawn, movimento e corte da pista:

> Está nascendo dentro da parede e nao está andando, sem contar que a pista está cortando.

12. Pedido para recriar os pontos da pista:

> Faça o seguinte, tente criar os pontos da pista para mim... eles estão muito pertos um do outro, tente fazer voce.

13. Apontamento visual sobre a pista criada:

> Olhe como voce fez.

14. Pedido para criar uma pista nova e mais difícil:

> Faça o seguinte, crie uma pista nova, bem dificil, nao siga essa que está criando.

15. Relato de estagnação na geração 127:

> Já está na geracao 127 e ele continua batendo no mesmo lugar sempre.

16. Pedido de verificação do código antes de assumir erro do AG:

> Fornecimento de código main.ts e Pista.ts: "primeiro verifique se não é a pista ou algo relacionado aos códigos que te mandei".

17. Comparação com exemplo do professor:

> Meu professor fez esse aqui... porque o meu não é parecido? (envio de código Python).

18. Pedido de correção das partes necessárias:

> Consegue corrigir para mim e me entregar as partes que precisam.

19. Envio de imagem para substituir o carro:

> Envio de imagem de carrinho (PNG) para usar no lugar do anterior.

20. Pedido para trocar o sprite do carro:

> Consegue fazer esse carrinho no lugar do que está?

21. Problema de orientação do sprite:

> O carro está de lado, a frente está para o lado esquerdo do carro.

22. Ajuste de rotação que fez o carro andar de ré:

> Ficou pra baixo... ctx.rotate(this.angulo - Math.PI / 1); assim ficou andando de ré.

23. Relato de baixa convergência até a geração 250:

> Ok. ele ainda não consegue ganhar, foi até 250 quando eu tirei e sempre batendo no mesmo local.

24. Pedido de exportação dos prompts em JSON:

> Consegue me entregar todos os prompts que eu te enviei em json?

**Ajuste aplicado:**
O histórico complementar foi registrado em Markdown mantendo a ordem dos prompts enviados. Itens que citam código, listas de coordenadas, imagens ou anexos foram preservados como descrições, pois o conteúdo completo desses anexos não estava presente no JSON fornecido nesta etapa.

---

**Data:** 25/06/2026
**Objetivo:** Consolidar a estrutura de pastas para que o projeto Vite, o repositório Git e a documentação do harness fiquem na mesma raiz.
**Ferramenta:** Codex
**Prompt:**

> Consegue ajustar para mim?

**Ajuste aplicado:**
Os arquivos e pastas `AGENTS.md`, `README.md`, `.ai/`, `specs/`, `docs/` e `tests/` foram movidos para dentro de `simulador-carros/`, que já continha `.git`, `package.json`, `index.html`, `tsconfig.json`, `public/` e `src/`. Com isso, a raiz real do projeto passou a ser `simulador-carros/`, evitando que a documentação fique fora do repositório versionado.
