# Documentação Técnica — Simulador AG 2D

## Física do Carro (`src/Carro.ts`)

### Movimento
A cada frame, `update()` aplica:
```
velocidade += aceleração   (se frente pressionado)
velocidade *= (1 - atrito) (decaimento por atrito)
x += sin(ângulo) × velocidade
y -= cos(ângulo) × velocidade
```
Convenção de ângulo: 0 = aponta para cima; cresce no sentido horário.

### Polígono de Colisão
Os 4 vértices do retângulo rotacionado são calculados via:
```
rad   = hypot(largura, comprimento) / 2
alpha = atan2(largura, comprimento)
```
Cada vértice = `(x - sin(ângulo ± alpha) × rad, y - cos(ângulo ± alpha) × rad)`.

### Sensores (Raycasting)
5 raios em ângulos `[-π/2, -π/4, 0, π/4, π/2]` relativos ao heading do carro.
Cada raio encontra a interseção mais próxima com os segmentos da pista:
```
t = ((A - P) × (D-C)) / (r × s)
u = ((A - P) × r)     / (r × s)
interseção se t ≥ 0 && u ∈ [0,1]
```
Resultado normalizado: `sensor[i] = distância / alcanceMaximo`.

---

## Pista (`src/Pista.ts`)

A pista é gerada proceduralmente a partir de **14 pontos de controle**:
1. **Catmull-Rom spline**: suaviza os pontos de controle com 10 amostras por trecho → polígono de `~140` pontos
2. **Offset paralelo**: expande e contrai o polígono central `±43 px` → bordas externa e interna
3. **Winding order**: a área do polígono (fórmula de Gauss) determina qual lado é externo

Isso gera uma pista intermediária, com curvas em S possíveis e retas de recuperação para o AG aprender progressivamente.

### Detecção de Colisão (dupla verificação)
1. **Intersecção de segmentos**: verifica se alguma aresta do polígono do carro cruza algum segmento de parede
2. **Ponto no polígono**: verifica se algum vértice do carro está fora da borda externa ou dentro da borda interna

---

## Rede Neural (`src/Carro.ts` — `computarControles()`)

Arquitetura feedforward com uma camada oculta:

```
Entradas (5)    Oculta (16)      Saídas (4)
sensor[0] ──┐                ┌── frente
sensor[1] ──┤  sigmoid(Wx+b) ├── trás
sensor[2] ──┤                ├── esquerda
sensor[3] ──┤                └── direita
sensor[4] ──┘
```

Estrutura do genoma (164 floats):
- `[0..79]` — pesos entrada→oculta (5×16)
- `[80..95]` — biases da camada oculta (16)
- `[96..159]` — pesos oculta→saída (16×4)
- `[160..163]` — biases da saída (4)

---

## Algoritmo Genético (`src/AlgoritmoGenetico.ts`)

### `calcularFitness(progressoTotal, framesSemProgresso)`
```
score = progressoTotal × 1000 - penalidadeEstagnacao
progressoTotal = checkpoints completos + fração até o próximo checkpoint
```
O fitness não usa distância acumulada, pois esse sinal recompensa carros que ficam girando no mesmo ponto.

### `selecao` — Torneio k=5
Sorteia 5 índices aleatórios e retorna o de maior fitness.
Vantagem sobre roleta: mais estável com fitnesses muito discrepantes.

### `crossover` — Ponto Único
```
filho.pesos = [...paiA.pesos[0..ponto], ...paiB.pesos[ponto..164]]
```

### `mutacao` — Perturbação local (taxa=8%)
Cada gene mutado recebe uma perturbação pequena; uma parcela rara dos genes sofre reset aleatório para manter diversidade genética.

### `gerarProximaGeracao` — Elitismo Top 4 + imigrantes
Os 4 melhores de cada geração são copiados intactos antes de gerar os demais.
Além disso, 10% da população nova é aleatória para evitar monocultura de trajetos ruins.

---

## Loop Principal (`src/main.ts`)

```
loop() {
  para cada passo (1..N):          ← N = nível de velocidade (1–200)
    para cada carro vivo:
      atualizarSensores(segmentos)
      update()
      atualizar progresso real até o próximo checkpoint
      se verificarColisao(): carro.vivo = false
    se todos mortos: gerarProximaGeracao()

  renderizar pista + carros + HUD
  requestAnimationFrame(loop)
}
```

O desacoplamento sim/render permite timelapse: `N=200` → 12.000 passos/s, geração concluída em ~0.25 s real.
