# Skill: Validador de Simulação (simulation-validator)

**Descrição:** Valida se o simulador AG 2D está pronto para entrega, combinando checagens técnicas (`build`, TypeScript, estrutura do harness) com validação visual/observacional do aprendizado no navegador.

**Gatilho de Ativação:** Use quando o usuário pedir "validar", "testar entrega", "ver se está pronto", "conferir requisitos", "rodar checklist", "avaliar gerações" ou antes de declarar uma versão como final.

---

## Regras de Comportamento

### 1. Validação Técnica Obrigatória
Execute e reporte:
- `npm run build` na raiz do projeto.
- Se a pasta `simulador-carros/` existir e ainda estiver sendo usada, também executar `npm run build` dentro dela.
- Verificar se não há dependências externas de física, ML ou simulação.
- Confirmar que `src/` contém os módulos principais: `main.ts`, `Carro.ts`, `Pista.ts`, `AlgoritmoGenetico.ts`.

### 2. Validação Visual
Rodar `npm run dev`, abrir o navegador e observar:
- Pista renderizada com bordas interna e externa.
- População inicial de 50 carros.
- HUD com geração, vivos, progresso/fitness, recorde, voltas, status e velocidade.
- Teclas `+` e `-` alterando a velocidade até 200x.
- Sensores visíveis no melhor carro.

### 3. Validação de Aprendizado
Em 50x ou 200x, observar e registrar:
- Se o fitness/progresso cresce ao longo das gerações.
- Se os carros deixam de bater logo na largada.
- Se ao menos um carro completa uma volta na pista atual.
- Se a simulação para com `Status: concluida` quando a volta é completada.
- Se o último checkpoint coincide visualmente com a linha de chegada.

### 4. Validação do Harness
Conferir existência e coerência de:
- `specs/projeto.md`
- `specs/requisitos.md`
- `specs/criterios-aceite.md`
- `.ai/context.md`
- `.ai/prompts.md`
- `.ai/agents/simulador-ag/agent.md`
- `.ai/skills/`
- `tests/avaliacao-geracoes.md`
- `docs/README.md`
- `AGENTS.md`
- `README.md`

### 5. Registro de Evidência
Ao final de uma validação relevante:
- Atualizar `tests/avaliacao-geracoes.md` com data, geração observada, recorde/progresso e resultado.
- Registrar o prompt e o resultado resumido em `.ai/prompts.md`.
- Se algum item falhar, indicar exatamente o arquivo/linha provável e a correção sugerida.

---

## Formato de Resposta

Entregar um checklist curto:

```markdown
## Validação
- Build raiz: passou/falhou
- Build simulador-carros: passou/falhou/não aplicável
- Visual: passou/falhou
- Aprendizado: passou/falhou
- Parada na chegada: passou/falhou
- Harness: passou/falhou

## Pendências
- ...
```
