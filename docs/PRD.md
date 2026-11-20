# PRD — TEA Sensorial 0.1.0

**Produto:** TEA Sensorial
**Pacote:** `com.teasensorial.app`
**Plataforma:** Android (Expo / React Native)
**Licença:** GPL-3.0-only
**Autor:** Valdenor
**Última atualização:** 2026-11-20

---

## 1. Contexto

O portfólio TEA já cobre comunicação, crise, rotina, antecipação e histórias sociais. O elo que falta é o aprendizado **depois** da experiência: registrar o ambiente, reconhecer recorrências e transformar isso em acomodações comunicáveis.

O `tea-mvp` tem um check-in com carga sensorial e gatilhos, mas o histórico é uma lista dos últimos 7 dias, sem agregação. A proposta aqui não é duplicar o check-in, e sim criar um instrumento de **perfil sensorial e acomodações**, com foco em ambiente, não em humor ou bateria social.

### Oportunidade

- Pessoas autistas frequentemente descobrem seus gatilhos por tentativa e erro, sem registro.
- A comunicação de necessidades em trabalho, escola e saúde depende de explicar algo invisível.
- Ferramentas de diário existentes são genéricas, exigem muita digitação e não geram um artefato compartilhável.
- Um app offline, leve e respeitoso fecha esse ciclo sem violar a privacidade.

---

## 2. Público e personas

### Persona primária — Adulto autista recém-diagnosticado ou em autoconhecimento
- 20–45 anos, usa o celular como principal ferramenta.
- Quer entender por que alguns ambientes esgotam e outros não.
- Pode ter baixa energia para preencher formulários longos.
- Precisa de linguagem sem julgamento e sem tom clínico.

### Persona secundária — Adulto autista com diagnóstico e necessidade de acomodações
- Já conhece parte dos próprios gatilhos.
- Precisa comunicar necessidades no trabalho, na faculdade ou em atendimentos.
- Quer um cartão curto, em primeira pessoa, que não pareça um laudo.

### Persona terciária — Familiar ou profissional de apoio
- Ajuda a pessoa a registrar e a interpretar o perfil.
- Não é o usuário principal; o app não coleta dados sobre terceiros.

### Não-persona
- Crianças pequenas como usuárias diretas (o app usa linguagem adulta; uma versão kids pode vir depois).
- Profissionais que buscam instrumento de avaliação clínica.

---

## 3. Jobs to be done

1. **Quando** saio de um ambiente que me sobrecarregou, **quero** registrar rapidamente o que aconteceu, **para** não perder o dado e entender meu padrão.
2. **Quando** tenho alguns registros, **quero** ver o que se repete, **para** me conhecer melhor e me antecipar.
3. **Quando** preciso explicar minhas necessidades, **quero** um cartão curto e editável, **para** não ter que explicar tudo do zero.
4. **Quando** não estou bem, **quero** que o app não me cobre, **para** não transformar autocuidado em mais uma tarefa.

---

## 4. Histórias de usuário e critérios de aceite

### US-01 — Registrar um evento sensorial
**Como** pessoa autista, **quero** registrar lugar, sentidos, intensidade e ajudas em menos de um minuto, **para** guardar o que aconteceu sem esforço.

Critérios:
- [ ] O formulário cabe em uma tela com rolagem e não exige digitação.
- [ ] Lugar é seleção única; sentidos e ajudas são seleção múltipla.
- [ ] Intensidade vai de 1 a 5 e começa em 3.
- [ ] Nota é opcional e limitada a 500 caracteres.
- [ ] Salvar sem lugar ou sem sentido exibe mensagem clara e não grava.
- [ ] Após salvar, o app volta ao início e o registro aparece no histórico.
- [ ] O tempo alvo de preenchimento é ≤ 45 segundos no teste com usuários.

### US-02 — Consultar e corrigir o histórico
**Como** usuário, **quero** ver meus registros por dia e corrigir erros, **para** confiar nos dados.

Critérios:
- [ ] Registros aparecem do mais recente para o mais antigo.
- [ ] Cada item mostra lugar, sentidos, intensidade e ajudas.
- [ ] É possível filtrar por lugar.
- [ ] Editar abre o formulário preenchido e salva as alterações.
- [ ] Excluir pede confirmação e remove o registro e suas relações.
- [ ] Estado vazio explica como começar, sem cobrança.

### US-03 — Ver o perfil
**Como** usuário, **quero** ver padrões depois de alguns registros, **para** entender o que mais me afeta e o que mais ajuda.

Critérios:
- [ ] O perfil só é exibido com pelo menos 5 registros.
- [ ] Abaixo disso, mostra “X de 5” e uma frase sem pressão.
- [ ] Exibe até 3 sentidos, 3 contextos e 3 ajudas mais frequentes.
- [ ] Cada item mostra contagem e total (“7 de 12 registros”).
- [ ] Não exibe scores, probabilidades ou causalidade.
- [ ] Inclui a nota: “Frequência não é causa.”

### US-04 — Criar e compartilhar o cartão
**Como** usuário, **quero** montar um cartão com o que me ajuda, **para** mostrar a outras pessoas.

Critérios:
- [ ] O cartão sugere as ajudas mais frequentes do perfil, mas permite escolher qualquer ajuda do catálogo.
- [ ] O nome é opcional e fica salvo no aparelho.
- [ ] A prévia mostra o texto final antes de compartilhar.
- [ ] Compartilhar abre a folha do sistema; nada é enviado automaticamente.
- [ ] Sem ajudas selecionadas, o botão explica o que falta.
- [ ] O texto inclui a ressalva de que não é diagnóstico nem laudo.

### US-05 — Ajustar o app
**Como** usuário, **quero** escolher tema, idioma e tamanho do texto, **para** usar o app confortavelmente.

Critérios:
- [ ] Tema claro, escuro ou automático, persistido.
- [ ] Idioma PT-BR, EN ou ES, persistido e aplicado imediatamente.
- [ ] Texto maior aumenta a escala interna sem quebrar layout.
- [ ] Exportação gera JSON e abre o compartilhamento do sistema.
- [ ] “Apagar todos os registros” pede confirmação e não apaga preferências.
- [ ] A tela de privacidade explica onde os dados ficam.

### US-06 — Usar com leitor de tela
**Como** usuário de TalkBack, **quero** operar todos os controles, **para** usar o app com autonomia.

Critérios:
- [ ] Botões têm `accessibilityRole`, rótulo e estado selecionado.
- [ ] Emojis decorativos não são lidos duas vezes.
- [ ] Alvos interativos têm no mínimo 48 dp.
- [ ] A ordem de foco segue a ordem visual.
- [ ] Nenhuma informação depende apenas de cor.
- [ ] Fluxo principal completo com fonte do sistema em 200%.

---

## 5. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Registrar evento com contexto, sentidos, intensidade, ajudas e nota | Must |
| RF-02 | Editar e excluir evento com confirmação | Must |
| RF-03 | Listar eventos por dia e filtrar por contexto | Must |
| RF-04 | Calcular perfil com mínimo de 5 registros | Must |
| RF-05 | Gerar cartão em texto e compartilhar | Must |
| RF-06 | Salvar tema, idioma, texto maior e nome | Must |
| RF-07 | Exportar JSON | Must |
| RF-08 | Apagar todos os registros | Must |
| RF-09 | Catálogo fixo de sentidos, contextos e ajudas | Must |
| RF-10 | Itens personalizados no catálogo | Could (v1.1) |
| RF-11 | Importar backup JSON | Could (v1.1) |
| RF-12 | PDF do cartão | Could (v1.1) |
| RF-13 | Widget “Registrar agora” | Could (v1.2) |
| RF-14 | Versão infantil | Won't (v1) |

## 6. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF-01 | Funcionar sem rede; build de distribuição sem permissão `INTERNET` |
| RNF-02 | Sem conta, backend, anúncios, analytics ou rastreamento |
| RNF-03 | Dados somente no SQLite privado do app; `allowBackup=false` |
| RNF-04 | Abertura e navegação sem animações agressivas |
| RNF-05 | Textos em PT-BR, EN e ES desde a v1 |
| RNF-06 | Contraste mínimo AA nos textos e controles |
| RNF-07 | Testes automatizados para banco e agregação |
| RNF-08 | Build reprodutível no F-Droid com JDK 17 |

---

## 7. Modelo de dados

### `events`
| Campo | Tipo | Regra |
|---|---|---|
| `id` | TEXT PK | Gerado no app |
| `created_at` | INTEGER | Epoch ms |
| `context` | TEXT | Chave do catálogo |
| `intensity` | INTEGER | 1–5 |
| `note` | TEXT | Até 500 caracteres |

### `event_senses`
`event_id` + `sense`, PK composta, FK com `ON DELETE CASCADE`.

### `event_helpers`
`event_id` + `helper`, PK composta, FK com `ON DELETE CASCADE`.

### `settings`
Linha única (`id = 1`): `language`, `theme`, `larger_text`, `name`.

### Regra de agregação
- Contar ocorrências por chave em todos os eventos.
- Ordenar por contagem decrescente; empate segue a ordem do catálogo.
- Retornar no máximo 3 itens por dimensão.
- `enough = total >= 5`.
- Não calcular média de intensidade nem qualquer score.

---

## 8. Diretrizes de copy

- Falar com a pessoa, não sobre ela: “o que ajudou”, “onde você estava”.
- Preferir “pode estar relacionado” a “é causado por”.
- Nunca usar “crise”, “surto”, “nível”, “pontuação” ou “diagnóstico” como resultado.
- Evitar urgência, culpa e gamificação: sem “você precisa registrar hoje”.
- Emojis apoiam a leitura, mas não substituem o texto.
- O cartão é escrito em primeira pessoa e pode ser editado.

---

## 9. Métricas de validação (sem telemetria)

Como o app não coleta dados, a validação é qualitativa e local:

| Métrica | Método | Meta |
|---|---|---|
| Tempo de registro | Cronômetro em teste moderado | ≤ 45 s |
| Conclusão sem ajuda | 5–8 adultos autistas | 5 de 8 na primeira tentativa |
| Compreensão do perfil | Entrevista curta | 5 de 6 explicam as frases corretamente |
| Percepção de respeito | Escala qualitativa | Nenhuma menção a tom clínico ou infantilizante |
| Acessibilidade | TalkBack + fonte 200% | Fluxo completo sem bloqueio |
| Retenção voluntária | Feedback espontâneo em 2 semanas | 3 de 8 usam mais de uma vez |

---

## 10. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Registro virar obrigação | Abandono | Pós-evento, opcional, sem streak |
| Poucos dados gerarem conclusões erradas | Danos | Mínimo de 5, contagens e ressalva |
| Aparência de avaliação clínica | Perda de confiança | Copy explícita e revisão por usuários |
| Cansaço no preenchimento | Dados pobres | 3 toques mínimos, detalhes opcionais |
| Sobreposição com `tea-mvp` | Confusão | Foco em ambiente e cartão; integração futura |
| Vazamento por compartilhamento | Privacidade | Prévia antes de compartilhar; sem envio automático |

---

## 11. Critérios de lançamento da 0.1.0

- [x] Base funcional implementada e navegável.
- [x] Testes de banco e de agregação passando.
- [x] Typecheck sem erros.
- [x] PT/EN/ES na interface.
- [x] Tema claro/escuro/automático.
- [ ] Teste em aparelho Android físico.
- [ ] Revisão de copy por pelo menos 2 pessoas autistas.
- [ ] Auditoria de TalkBack e fonte 200%.
- [ ] Metadados e build F-Droid.

## 12. Próximos passos

1. Instalar dependências e validar typecheck/testes no ambiente local.
2. Rodar em aparelho Android e ajustar layout com fonte ampliada.
3. Conduzir 5 entrevistas com protótipo funcional.
4. Revisar copy e catálogo com base no feedback.
5. Preparar capturas, metadados e receita F-Droid.
