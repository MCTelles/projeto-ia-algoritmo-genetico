# Projeto — Simulador AG 2D: Carros Autônomos

## Objetivo

Desenvolver uma simulação em 2D de veículos autônomos que aprendem a navegar em uma pista fechada utilizando um **Algoritmo Genético**.

## Problema Resolvido

Otimização de trajetórias e controle de direção em ambientes com obstáculos, dispensando a necessidade de programação explícita de regras de direção. O sistema descobre a melhor forma de dirigir de maneira evolutiva.

## Abordagem da IA

Cada carro possui um **cérebro** (rede neural feedforward 5→16→4) conectado a sensores de distância (raycasting). O Algoritmo Genético:

1. **Avalia** a população por progresso sequencial na pista (**checkpoints + fração até o próximo checkpoint**)
2. **Seleciona** os melhores indivíduos (torneio k=5)
3. Aplica **Crossover** (ponto único) e **Mutação** (taxa 8%, perturbação local com resets raros)
4. Gera a **próxima geração** com elitismo moderado (top 4 intactos) e 10% de imigrantes aleatórios
5. Repete até que a pista seja completada

## Stack Técnica

- **Linguagem:** TypeScript (strict mode)
- **Build:** Vite
- **Renderização:** HTML5 Canvas (800×600 px)
- **Restrição:** Zero bibliotecas externas de física ou ML

## Módulos de Desenvolvimento

| Módulo | Conteúdo | Status |
|---|---|---|
| 001 — Motor Físico | `Carro.ts`, `Pista.ts`, loop básico | ✅ Concluído |
| 002 — IA | `AlgoritmoGenetico.ts`, sensores, rede neural | ✅ Concluído |
| 003 — Timelapse | Controle de velocidade (1×→200×), HUD | ✅ Concluído |
