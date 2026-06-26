# Contexto de Desenvolvimento (Harness)

**Disciplina:** Sistemas de Informação - Inteligência Artificial 2026/01
**Stack Técnica:** TypeScript, Vite, HTML5 Canvas (Sem bibliotecas de física de terceiros para manter a simplicidade).

## Respostas de Orientação para a IA:

**Qual é o objetivo do projeto?**
Criar uma simulação 2D no navegador onde carros autônomos aprendem a completar uma volta em uma pista utilizando um Algoritmo Genético.

**Qual problema a solução resolve?**
A otimização de trajetórias e o controle autônomo de direção em ambientes fechados utilizando evolução computacional em vez de regras _hardcoded_.

**Como a IA deve se comportar ao auxiliar o desenvolvimento?**
A IA atuará como _pair programmer_ fullstack web. Deve gerar códigos em TypeScript limpos e modulares, priorizando lógica matemática simples para colisão e raycasting em vez de introduzir dependências externas. As respostas devem ir direto ao ponto.

**Que contexto ela precisa conhecer?**
O projeto deve ser construído rápido, utilizando Vite para a estrutura e Canvas API para renderização. O foco de avaliação é a implementação do Algoritmo Genético (População, Seleção, Crossover e Mutação).

**Que restrições técnicas devem ser respeitadas?**

- O loop de renderização (requestAnimationFrame) deve ser separado da lógica de evolução da IA.
- A física pode ser simplificada (apenas aceleração, rotação e bounding boxes).

**Como validar se uma resposta, código ou solução está correta?**
O código TypeScript gerado não deve apresentar erros de tipagem no VSCode, deve renderizar corretamente no navegador via Vite e a lógica de colisão deve imobilizar o objeto corretamente no Canvas.

**Como outra pessoa poderia reproduzir ou continuar o projeto?**
Clonando o repositório, rodando `npm install` e `npm run dev`. Toda a lógica central da IA estará isolada no arquivo `AlgoritmoGenetico.ts` e a física no `Carro.ts`.
