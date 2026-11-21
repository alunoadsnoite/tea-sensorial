# TEA Sensorial

**Reconheça padrões sensoriais e comunique suas necessidades.**

`React Native · Expo · SQLite`

[Reportar problema](https://github.com/alunoadsnoite/tea-sensorial/issues) · [Licença](LICENSE)

<img src="fastlane/metadata/android/pt-BR/images/icon.png" alt="Ícone do TEA Sensorial" width="104">

**Seu mapa sensorial, no seu ritmo.**

Aplicativo Android offline para pessoas autistas registrarem como o ambiente as afeta, reconhecerem padrões com o tempo e criarem um **cartão de acomodações** que possam mostrar no trabalho, na escola, em consultas ou para a família.

> Status: **MVP em desenvolvimento (0.2.0)**. A base funcional já está implementada; a validação com usuários e a publicação no F-Droid são as próximas etapas.

---

## O problema

Os apps TEA existentes cobrem bem três momentos: comunicação imediata (`tea_fala`), crise e regulação (`tea-mvp` / `tea-mvp-childs`) e preparação para eventos conhecidos (`TEADescomplica`, `tea-historias`). Falta fechar o ciclo **depois do evento**:

- O que, no ambiente, costuma afetar a pessoa?
- Em quais contextos isso se repete?
- O que comprovadamente ajuda?
- Como comunicar essas necessidades a terceiros sem depender de um laudo?

O TEA Autonomia já registra carga sensorial e gatilhos e apresenta um resumo dos últimos sete dias. O TEA Sensorial complementa esse fluxo com registros pós-evento, um perfil por sentidos e contextos e um cartão de acomodações. O TEA Sensorial nasce para ser o app do **autoconhecimento sensorial e da comunicação de acomodações** — não mais um app de crise.

## O que o app faz

1. **Registro rápido pós-evento** — em menos de um minuto, com o mínimo de digitação: lugar, sentidos afetados, detalhes opcionais, intensidade e o que ajudou.
2. **Histórico simples** — registros por dia, com filtro por lugar, edição e exclusão.
3. **Meu perfil** — após 5 registros, mostra os sentidos, detalhes do catálogo, contextos e ajudas mais frequentes, em linguagem descritiva, sem pontuação e sem causalidade.
4. **Meu cartão de acomodações** — seleção das ajudas, texto em primeira pessoa, prévia e compartilhamento pelo próprio usuário.
5. **Ajustes** — tema, idioma (PT/EN/ES), texto maior, nome no cartão, exportação JSON, exclusão de dados e contato.

## Princípios inegociáveis

- Funciona **100% offline**, sem conta, servidor, anúncios ou analytics.
- **Nenhum dado sai do aparelho** sem uma ação explícita de compartilhamento.
- **Não é diagnóstico, terapia ou avaliação clínica.** É uma ferramenta de autoconhecimento.
- Baixa carga cognitiva: uma ação principal por tela, sem streaks, metas ou alertas ansiosos.
- Acessibilidade desde o primeiro commit: TalkBack, escala de fonte, contraste, alvos de 48 dp e textos claros.
- Código aberto sob **GPL-3.0-only**.

## Fora do escopo da v1

- Diagnóstico, escalas clínicas, laudos ou recomendações médicas.
- Gráficos complexos, scores, previsões ou IA.
- Sincronização, conta, nuvem ou mapa de lugares.
- Substituir o cartão de crise, a CAA ou as histórias sociais.
- PDF sofisticado (a v1 compartilha texto; PDF entra na v1.1 se fizer sentido).

## Telas

| Tela | Função |
|---|---|
| Início | Acesso a registrar, perfil, cartão, histórico e ajustes |
| Novo registro | Lugar, sentidos, intensidade, ajudas e nota opcional |
| Histórico | Registros agrupados por dia, filtro por lugar, editar e excluir |
| Meu perfil | Frequências por sentido, contexto e ajuda |
| Meu cartão | Seleção de ajudas, nome e compartilhamento em texto |
| Ajustes | Tema, idioma, texto maior, nome, exportação, exclusão e privacidade |

## Arquitetura

- **Expo SDK 55 + React Native + TypeScript**
- **SQLite local** via `expo-sqlite` (eventos, sentidos, ajudas e preferências)
- **Sem backend, sem rede em tempo de execução**
- Agregação do perfil em função pura e testável (`src/profile.ts`)
- Testes de banco com `node:sqlite` e testes de agregação com `node:test`
- Base de projeto alinhada ao `tea-historias`, com as convenções de acessibilidade do `tea-mvp`

## Estrutura

```
tea-sensorial/
├── App.tsx                 # inicialização, navegação e estado compartilhado
├── src/
│   ├── screens/            # telas separadas por funcionalidade
│   ├── ui/                 # contexto, estilos e componentes compartilhados
│   ├── config.ts           # versão do app e contato
│   ├── catalog.ts          # sentidos, contextos e ajudas
│   ├── database.ts         # schema, CRUD, preferências e exportação
│   ├── i18n.ts             # PT, EN, ES
│   ├── profile.ts          # agregação pura do perfil
│   ├── theme.ts            # paletas clara e escura
│   └── types.ts            # tipos de domínio
├── test/
│   ├── database.test.ts
│   └── profile.test.ts
├── docs/
│   ├── PRD.md
│   └── ARQUITETURA.md
├── fdroid/                 # metadados e receita de build
└── app.json
```

## Desenvolver

Requisitos: Node.js 24+, JDK 17 e Android SDK configurado em `ANDROID_HOME`.

```sh
npm install
npm run typecheck
npm test

# Rodar no Android (gera a pasta nativa)
npx expo prebuild --platform android
npm run android
```

Para gerar um APK de teste:

```sh
npx expo prebuild --platform android --no-install
cd android
JAVA_HOME=/caminho/para/jdk17 ./gradlew :app:assembleRelease
```

O APK de debug não embute o bundle JS; use `assembleRelease` para instalar no aparelho.

## Privacidade

- Banco SQLite privado do aplicativo.
- `android:allowBackup="false"` e regras de exclusão para cópia em nuvem.
- Sem permissão de internet no build de distribuição (a receita do F-Droid bloqueia `INTERNET`).
- Exportação apenas por ação do usuário, via compartilhamento do sistema.
- Nenhuma telemetria, analytics, publicidade ou SDK de rastreamento.

## Roteiro

| Etapa | Entrega |
|---|---|
| 0.1.0 | Base funcional: registrar, histórico, perfil, cartão, ajustes, testes |
| 0.2.0 | Detalhes por sentido, novas opções de ajuda e ícone com S. Validação com usuários pendente |
| 0.3.0 | Auditoria de acessibilidade (TalkBack, fonte 200%, tema escuro) |
| 1.0.0 | Metadados F-Droid, build reprodutível, capturas e publicação |

## Documentação

- [PRD](docs/PRD.md) — requisitos, histórias de usuário, critérios de aceite e métricas.
- [Arquitetura](docs/ARQUITETURA.md) — decisões técnicas, modelo de dados e limites.

## Desenvolvedor

Valdenor — valdenor.sa@proton.me

## Licença

GPL-3.0-only. Consulte [LICENSE](LICENSE).

## Como contribuir

Sugestões, traduções e relatos de problemas são bem-vindos. Abra uma issue com o contexto e o comportamento esperado. Para alterações de código, explique a mudança e os testes realizados no pull request. Use dados fictícios nos exemplos e nas capturas.

## Verificações automáticas

O GitHub Actions executa checagem de tipos, testes de banco e perfil e exportação do bundle Android nos pushes e pull requests.

## Identidade visual

O ícone usa a letra **S** com o infinito entrelaçado, no mesmo estilo do TEA Passos. A imagem original aprovada está em `assets/icon-source.png`; as versões do lançador Android e dos catálogos em português e inglês derivam dela. O ícone adaptável inclui margem para as máscaras dos lançadores.
