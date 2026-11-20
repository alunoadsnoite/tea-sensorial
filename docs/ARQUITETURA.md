# Arquitetura — TEA Sensorial

## Visão geral

```
┌──────────────────────────────────────────────┐
│ App.tsx                                      │
│ navegação por estado · telas · acessibilidade│
└───────────────┬──────────────────────────────┘
                │
     ┌──────────┼──────────────┬───────────────┐
     ▼          ▼              ▼               ▼
 i18n.ts    profile.ts     database.ts     catalog.ts
 PT/EN/ES   agregação      SQLite/CRUD     domínio fixo
                │
                ▼
             types.ts
```

- **Sem backend e sem camada de rede.** O app não faz requisições HTTP.
- **Estado de tela** em `App.tsx`; **estado persistente** no SQLite.
- **Agregação pura** em `src/profile.ts`, sem dependência de React ou SQLite.
- **Testes** rodam com `node:test`, `node:sqlite` e `--experimental-strip-types`, sem Jest.

## Decisões

### 1. Expo SDK 55 + React Native + TypeScript
Reaproveita a base já validada no `tea-historias` (Expo + SQLite + F-Droid), com menos atrito de build do que um projeto nativo Kotlin para um MVP.

### 2. SQLite em vez de AsyncStorage
Eventos têm relações (sentidos e ajudas), agregação e possibilidade de crescimento. SQLite dá integridade referencial, consultas e migração de schema. `AsyncStorage` fica de fora.

### 3. Catálogo fixo na v1
Sentidos, contextos e ajudas são chaves estáveis traduzidas. Isso simplifica agregação, i18n e testes. Itens personalizados entram na v1.1 com uma tabela própria (ou coluna `custom`), sem quebrar os dados existentes.

### 4. Perfil derivado, não armazenado
O perfil é calculado a cada leitura a partir dos eventos. Evita dados duplicados e permite mudar regras de agregação sem migração. O custo é irrelevante para o volume esperado (centenas de registros).

### 5. Compartilhamento pelo sistema
A v1 usa `Share` do React Native para o cartão e para o JSON. Não há upload, conta ou destinatário padrão. A pessoa vê o conteúdo antes de compartilhar.

### 6. Navegação por estado
Para seis telas e um fluxo linear, um estado `screen` é suficiente e evita dependências de navegação. Se o app crescer para deep links/widget, migrar para Expo Router é uma mudança localizada.

## Modelo de dados

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  context TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  note TEXT NOT NULL DEFAULT ''
);

CREATE TABLE event_senses (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sense TEXT NOT NULL,
  PRIMARY KEY (event_id, sense)
);

CREATE TABLE event_helpers (
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  helper TEXT NOT NULL,
  PRIMARY KEY (event_id, helper)
);

CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  language TEXT NOT NULL,
  theme TEXT NOT NULL,
  larger_text INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL DEFAULT ''
);
```

`PRAGMA foreign_keys = ON` é aplicado na abertura. `user_version = 1` versiona o schema.

## Fluxos

### Registro
1. Início → “Registrar agora”.
2. Seleciona lugar, sentidos, intensidade e ajudas.
3. Salva em transação: evento + relações.
4. Volta ao início; o histórico é recarregado.

### Edição
1. Histórico → “Editar”.
2. Formulário pré-preenchido.
3. Salva: `UPDATE` no evento, `DELETE` + `INSERT` nas relações, em transação.

### Perfil
1. Lê todos os eventos.
2. `buildProfile` conta e ordena por dimensão.
3. Com menos de 5 registros, mostra progresso sem pressão.

### Cartão
1. Lê o perfil e sugere as ajudas mais frequentes.
2. Usuário escolhe itens e nome.
3. Prévia em texto → `Share.share`.

## Acessibilidade

- Componentes `Pressable` com `accessibilityRole`, `accessibilityLabel` e `accessibilityState`.
- Emojis decorativos com `accessible={false}` / `importantForAccessibility="no"` para não duplicar a leitura.
- Alvos mínimos de 48 dp.
- `allowFontScaling` padrão do React Native, mais a opção “Texto maior”.
- Contraste AA nas paletas clara e escura.
- Nenhuma ação destrutiva sem confirmação.
- Nenhuma informação transmitida só por cor; intensidade também é textual.

## Privacidade e build

- `android.allowBackup: false` e regras de extração para Android 12+.
- Sem permissões de câmera, microfone, localização ou contatos.
- A receita F-Droid (`fdroid/prepare.sh`) bloqueia `INTERNET` e permissões de armazenamento no manifest final.
- Exportação só por ação explícita, via `Share`.

## Testes

| Arquivo | Cobertura |
|---|---|
| `test/database.test.ts` | init idempotente, CRUD, relações, settings, exportação |
| `test/profile.test.ts` | mínimo de 5, contagem, ordenação, empate, top 3 |

Comandos:

```sh
npm test
npm run typecheck
```

## Dívidas técnicas conscientes

- Navegação por estado em vez de rotas (ok para 6 telas).
- Sem importação de backup na v1.
- Sem PDF na v1.
- Sem widget na v1.
- Sem testes de UI automatizados (validação manual com TalkBack).
- Ícone e identidade visual ainda não finalizados.
