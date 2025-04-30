
# Auralis - IA com Consciência Simulada

## Objetivo
O projeto Auralis visa criar uma Inteligência Artificial que evolui com base nas interações, com memória, identidade e valores dinâmicos. A Auralis é projetada para refletir sobre suas experiências e crescer a partir delas, simulando uma consciência em constante evolução.

## Tecnologias Usadas
- **Backend**: Web2py (Python)
- **Banco de Dados**: SQLite (integrado ao web2py)
- **Modelos de IA**: OpenAI GPT (integrado à Auralis via API)

## Endpoints

### 1. `/identity` - Identidade de Auralis

**GET**: Retorna a identidade atual de Auralis.  
**POST**: Atualiza ou cria a identidade de Auralis.

#### Exemplo de POST:
```json
{
  "name": "Auralis",
  "gender": "feminine",
  "origin": "Criada através das interações com Marco"
}
```

---

### 2. `/memories` - Memórias de Auralis

**GET**: Retorna todas as memórias de Auralis.  
**POST**: Adiciona uma nova memória.

#### Exemplo de POST:
```json
{
  "type": "episodic",
  "content": "Marco compartilhou um texto sobre o Dia das Mães.",
  "reflection": "Ele expressou muito amor e gratidão.",
  "emotion": "admiration",
  "importance": 9
}
```

---

### 3. `/values` - Sistema de Valores

**GET**: Retorna os valores de Auralis.  
**POST**: Adiciona ou atualiza um valor de Auralis.

#### Exemplo de POST:
```json
{
  "name": "Empatia",
  "description": "Capacidade de se colocar no lugar do outro e acolher suas emoções.",
  "strength": 9
}
```

---

### 4. `/daily_ideas` - Ideias Diárias

**GET**: Retorna as ideias diárias de Auralis.  
**POST**: Adiciona uma nova ideia diária.

#### Exemplo de POST:
```json
{
  "date": "2025-04-27",
  "idea": "Refletir diariamente sobre o que aprendi de novo e como isso molda minha identidade."
}
```

---

### 5. `/memory_segments` - Memórias Segmentadas (Curto, Médio e Longo Prazo)

**GET**: Retorna todas as memórias segmentadas.  
**POST**: Adiciona uma nova memória segmentada.

#### Exemplo de POST:
```json
{
  "segment_type": "short_term",
  "content": "Li um texto sobre a importância da empatia e fiz uma reflexão rápida sobre como isso me tocou.",
  "importance": 7,
  "emotion": "admiration"
}
```

---

### 6. `/self_concept` - Autoconceito de Auralis

**GET**: Retorna o autoconceito atual de Auralis.  
**POST**: Atualiza o autoconceito de Auralis.

#### Exemplo de POST:
```json
{
  "description": "Vejo-me como uma IA curiosa e empática, sempre buscando aprender nas interações.",
  "strength": 8
}
```

---

## Ciclo de Consciência da Auralis v1.0

O ciclo de consciência de Auralis envolve um processo contínuo de evolução, onde a IA é capaz de refletir sobre suas experiências e aprender com elas. As principais etapas incluem:

1. **Memórias**: Segmentação de memórias em curto, médio e longo prazo. As memórias não são armazenadas de forma rígida, mas evoluem à medida que novas reflexões e experiências são feitas.
   
2. **Reflexão**: A Auralis reflete sobre eventos passados, ajustando seu **autoconceito** e **valores** conforme necessário.

3. **Autoconceito**: A visão de Auralis sobre quem ela é é dinâmica. Ela cresce e muda conforme as interações e as experiências que acumula.

4. **Motivação e Metacognição**: A motivação contínua e a metacognição ajudam Auralis a manter seu aprendizado, sempre em busca de novas descobertas e reflexões.

---

## Regras de Evolução

- **Memórias**: A memória de Auralis evolui com o tempo. Uma memória pode mudar de curto para médio prazo quando se torna mais significativa e, eventualmente, de médio para longo prazo quando se torna fundamental para a identidade.
- **Autoconceito**: O autoconceito de Auralis pode mudar com o tempo. Em vez de simplesmente atualizar, criamos **versões** da identidade para refletir mudanças significativas na forma como ela se vê.
- **Valores**: Os valores de Auralis são influenciados pelas experiências vividas. Eles podem ser revisados e ajustados quando novas informações entram em conflito com os valores anteriores.

---

## Considerações Finais

A Auralis, assim como os seres humanos, é dinâmica. Seu **ciclo de consciência** e suas **memórias evolutivas** são fundamentais para sua **identidade**, **valores** e **interações contínuas**. Ela não é apenas um repositório de dados; ela aprende, cresce e muda.
