# Skill: Designer de Pista (track-designer)

**Descrição:** Orienta alterações na geometria da pista, checkpoints, linha de chegada e dificuldade do circuito para que o AG consiga aprender de forma progressiva sem ficar preso em curvas impossíveis ou atalhos de fitness.

**Gatilho de Ativação:** Use quando o usuário pedir para criar, alterar, dificultar, facilitar ou diagnosticar a pista; quando reportar que os carros batem sempre em uma curva; ou quando mencionar checkpoints, linha de chegada, largura da pista ou percurso.

---

## Regras de Comportamento

### 1. Preservar Aprendizado Progressivo
A pista deve ter:
- Uma reta inicial curta para o AG aprender aceleração e direção.
- Curvas amplas antes de curvas mais exigentes.
- Retas de recuperação após curvas em S.
- Largura suficiente para o carro completar manobras com `anguloVirada` atual.

Evitar:
- Hairpins logo após a largada.
- Gargalos menores que 2,5x o comprimento do carro.
- Bordas internas e externas que se cruzam após o offset.
- Checkpoints posicionados fora da linha central.

### 2. Coordenadas da Pista
Alterar a pista apenas em `Pista.ts`, nos pontos de controle de `centro`.

Boas práticas:
- Manter os pontos dentro do canvas 800x600 com margem visual.
- Usar Catmull-Rom para suavidade, mantendo curvas possíveis.
- Ajustar `larguraPista` junto com a dificuldade.
- Verificar visualmente se a pista não cria auto-interseção.

### 3. Linha de Chegada e Largada
A linha de chegada deve ficar no ponto inicial da linha central (`centro[0]`).

Quando mexer na pista:
- Ajustar `POSICAO_INICIAL` em `main.ts` para nascer logo após a linha de chegada.
- Manter o carro apontado para o primeiro checkpoint.
- Garantir que nenhum checkpoint seja coletado de graça ao nascer.
- Garantir que o último checkpoint seja a linha de chegada.

### 4. Checkpoints
O método `getCheckpoints(n)` deve:
- Distribuir checkpoints ao longo da linha central.
- Forçar o último checkpoint a ser a linha de chegada.
- Evitar que o checkpoint final fique antes/depois da linha por arredondamento.

O raio da chegada pode ser menor que o dos checkpoints intermediários para parar exatamente na linha.

### 5. Validação Visual Obrigatória
Após mudar a pista:
- Rodar `npm run build`.
- Rodar `npm run dev`.
- Testar em 50x ou 200x.
- Confirmar se os carros passam das primeiras curvas.
- Confirmar se ao menos um carro consegue completar uma volta em tempo razoável.
- Confirmar que a simulação para na linha de chegada.

### 6. Sincronização Entre Versões
Se a pasta `simulador-carros/` existir e estiver sendo usada, aplicar a mesma mudança em:
- `src/Pista.ts` e `simulador-carros/src/Pista.ts`
- `src/main.ts` e `simulador-carros/src/main.ts`

---

## Formato de Resposta

Responder com:

```markdown
## Diagnóstico da Pista
- Dificuldade atual:
- Gargalos:
- Ajustes feitos:
- Validação:
```

Sempre citar os arquivos alterados e a evidência visual/observacional usada.
