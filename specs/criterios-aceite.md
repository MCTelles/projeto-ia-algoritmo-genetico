# Critérios de Aceite - Simulador Genético 2D

O projeto será considerado concluído e validado quando os seguintes critérios forem atendidos:

## 1. Simulação Base (Ambiente)

- [x] O sistema renderiza uma pista em 2D fechada (com bordas internas e externas) utilizando HTML5 Canvas.
- [x] O sistema renderiza "carros" (retângulos) que se movem de forma autônoma.
- [x] A detecção de colisão está funcional: se um carro toca as bordas da pista, ele é imobilizado (considerado "morto" naquela geração).

## 2. Implementação da IA (Algoritmo Genético)

- [x] O sistema instancia uma população inicial de carros (ex: 50 a 100) com redes neurais ou pesos de direção aleatórios.
- [x] Cada carro possui sensores de distância (raycasting) que detectam as paredes da pista para alimentar suas decisões de direção.
- [x] O algoritmo calcula o _Fitness_ (Aptidão) de cada carro baseado na distância percorrida ou _checkpoints_ alcançados antes de colidir.
- [x] O sistema executa o _Crossover_ (cruzamento dos melhores indivíduos) e _Mutação_ (pequenas variações aleatórias) para gerar a próxima geração automaticamente após todos os carros da geração atual colidirem.

## 3. Validação de Aprendizado

- [x] Deve ser observável uma melhora no desempenho geral da população ao longo de sucessivas gerações (os carros começam a fazer as primeiras curvas sem bater).

## 4. Requisitos de Entrega (Harness)

- [x] A estrutura de diretórios respeita a documentação do projeto (specs/, .ai/, src/, tests/, docs/).
