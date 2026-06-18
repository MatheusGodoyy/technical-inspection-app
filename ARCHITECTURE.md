# Guia Completo da Estrutura do Projeto

## 📁 Visão Geral da Arquitetura

O projeto segue uma **arquitetura modular baseada em domínios**, onde cada pasta tem uma responsabilidade específica. Isso torna o código mais organizado, reutilizável e fácil de manter.

---

## 🎯 Cada Pasta Explicada

### 1. **`src/screens/`** - Telas da Aplicação
**O que é:** Componentes React Native que representam as páginas que o usuário vê.

**Arquivos:**
- `ListaRelatorios.tsx` - Dashboard principal com relatórios abertos e finalizados
- `SelecionarTipoInspecao.tsx` - Tela de escolha entre inspeção mecânica ou elétrica
- `FormularioRelatorioMecanicoCivil.tsx` - Formulário completo para inspeção mecânica/civil
- `FormularioRelatorioEletrico.tsx` - Formulário completo para inspeção elétrica
- `FormularioRelatorioUI.tsx` - Componente de UI reutilizável para renderizar os campos do formulário

**Exemplo de uso:**
```typescript
// App.tsx usa essas telas na navegação
<Stack.Screen 
  name={ROUTES.LISTA} 
  component={ListaRelatorios} 
/>
```

---

### 2. **`src/types/`** - Definições TypeScript
**O que é:** Interfaces, tipos e tipos customizados que definem a forma dos dados no projeto.

**Arquivos:**
- `relatorio.ts` - Types principais:
  - `TipoInspecao` (mecanica | eletrica)
  - `Relatorio` (estrutura completa do relatório)
  - `Escopo` (itens da inspeção com fotos e status)
  - `RelatorioFinalizadoSQLite` (dados salvos no banco)

- `inspecao.ts` - Types específicos de inspeção:
  - `DadosInspecao` (dados do formulário)
  - `PDFGenerationParams` (parâmetros para gerar PDF)

- `errors.ts` - Classes de erro customizadas:
  - `AppError` (base)
  - `ValidationError`
  - `StorageError`
  - `PDFGenerationError`
  - `SyncError`

**Por que usar tipos:**
```typescript
// ✅ BOM - TypeScript avisa se você errar
const relatorio: Relatorio = {...};
relatorio.tipoInspecao // ✓ sugestão automática

// ❌ RUIM - sem tipos é fácil errar
const relatorio: any = {...};
relatorio.tipoInspecao // sem ajuda
```

---

### 3. **`src/constants/`** - Constantes Globais
**O que é:** Valores que não mudam e são usados em vários lugares.

**Arquivos:**
- `routes.ts` - Nomes das telas (em vez de strings "Formulario"):
  ```typescript
  ROUTES.LISTA = "Lista"
  ROUTES.FORMULARIO_MECANICO = "FormularioMecanico"
  ROUTES.FORMULARIO_ELETRICO = "FormularioEletrico"
  ROUTES.SELECIONAR_TIPO = "SelecionarTipo"
  
  TIPO_INSPECAO.MECANICA = "mecanica"
  TIPO_INSPECAO.ELETRICA = "eletrica"
  ```

- `strings.ts` - Todos os textos da interface:
  ```typescript
  STRINGS.TITULO_INSPECAO = "Título da inspeção"
  STRINGS.BOTAO_SALVAR = "Salvar relatório"
  STRINGS.ERRO_VALIDACAO = "Campo obrigatório"
  ```

- `ui.ts` - Cores, tamanhos, espaçamentos:
  ```typescript
  COLORS.PRIMARY = "#7B3FE4" (roxo)
  COLORS.SECONDARY = "#E74C3C" (vermelho)
  SIZES.PADDING_BASE = 16
  FONT_SIZES.TITLE = 18
  ```

**Por que usar constants:**
```typescript
// ❌ RUIM - strings espalhadas pelo código
navigation.navigate("Formulario")
navigation.navigate("SelecionarTipo")
// Se mudar o nome, precisa mudar em 10 lugares!

// ✅ BOM - uma única fonte de verdade
navigation.navigate(ROUTES.FORMULARIO_MECANICO)
navigation.navigate(ROUTES.SELECIONAR_TIPO)
// Se mudar, muda só em um lugar
```

---

### 4. **`src/hooks/`** - Lógica Reutilizável
**O que é:** Funções React que encapsulam lógica de estado e efeitos.

**Arquivos:**
- `useRelatorios.ts` - Gerencia todos os relatórios:
  ```typescript
  const { 
    relatoriosAbertos,      // array de relatórios abertos
    relatoriosFinalizados,  // array de relatórios finalizados
    carregarRelatorios,     // função
    salvarRelatorio,        // função
    excluirRelatorio,       // função
    reabrirRelatorio        // função
  } = useRelatorios();
  ```

- `useAsync.ts` - Executa operações assíncronas com estado:
  ```typescript
  const { data, loading, error, execute } = useAsync();
  // Útil para requisições, cálculos pesados, etc
  ```

- `useFormValidation.ts` - Valida formulários:
  ```typescript
  const { errors, validate, clearErrors } = useFormValidation(rules);
  // Rastreia erros de cada campo
  ```

**Por que usar hooks:**
```typescript
// ❌ RUIM - código repetido em vários componentes
// ListaRelatorios.tsx
const [relatorios, setRelatorios] = useState([]);
useEffect(() => {...}, []);

// OutroComponente.tsx
const [relatorios, setRelatorios] = useState([]);
useEffect(() => {...}, []);

// ✅ BOM - lógica centralizada
const { relatorios, carregarRelatorios } = useRelatorios();
// Usa em qualquer componente
```

---

### 5. **`src/services/`** - Lógica de Negócio
**O que é:** Funções que fazem operações importantes (gerar PDF, sincronizar, etc).

**Subpastas:**
- `pdf/` - Geração de PDFs:
  - `pdfService.ts` - Função `gerarPDF()` que cria PDF a partir de dados
  - `types.ts` - Interface `PDFGenerationResult`

- `sync/` - Sincronização com servidor:
  - `syncService.ts` - Funções:
    - `sincronizar()` - Envia relatórios finalizados
    - `temInternet()` - Verifica conexão
    - `buscarPendentes()` - Relatórios não sincronizados

- `storage/` - Persistência de dados:
  - Usa o hook `useRelatorios` do hook

**Exemplo de fluxo:**
```typescript
// Na tela do formulário:
const resultado = await gerarPDF(relatorio);  // service/pdf
if (resultado.success) {
  await salvarRelatorio(relatorio);           // hook/useRelatorios
  const online = await temInternet();         // service/sync
  if (online) {
    await sincronizar();                      // service/sync
  }
}
```

---

### 6. **`src/database/`** - Banco de Dados Local
**O que é:** Setup e configuração do SQLite para armazenar relatórios finalizados.

**Arquivos:**
- `database.ts` - Inicializa SQLite e cria tabelas

**Dados salvos:**
```sql
CREATE TABLE inspecoes (
  id INTEGER PRIMARY KEY,
  titulo_inspecao TEXT,
  tipo_inspecao TEXT,
  data_inspecao TEXT,
  escopos TEXT,          -- JSON com fotos, status, observações
  path_pdf TEXT,         -- Caminho do arquivo PDF
  status_sync TEXT       -- 'pending', 'sending', 'synced', 'error'
)
```

---

### 7. **`src/utils/`** - Funções Auxiliares
**O que é:** Funções pequenas e reutilizáveis para tarefas comuns.

**Arquivos:**
- `validation.ts` - Valida dados:
  ```typescript
  isValidDate("12/01/2025")    // true/false
  isValidEmail("user@email")   // true/false
  isNotEmpty("texto")          // true/false
  ```

- `formatters.ts` - Formata dados para exibição:
  ```typescript
  formatDate(text)        // "12/01/2025"
  formatPhoneNumber("11987654321")  // "(11) 98765-4321"
  truncateText(long, 20)  // "Este é um texto lo..."
  ```

- `validators.ts` - Objetos de validação:
  ```typescript
  validators.required       // campo obrigatório
  validators.date          // valida data
  validators.email         // valida email
  ```

---

### 8. **`src/config/`** - Configuração Geral
**O que é:** Arquivo de configuração centralizado da aplicação.

**Arquivos:**
- `navigation.ts` - Títulos e opções de cada tela
- `env.ts` - Variáveis de ambiente (API URL, chaves, etc)

---

### 9. **`src/styles/`** - Estilos Globais
**O que é:** Estilos React Native usados em todo o app.

**Arquivos:**
- `styles.ts` - Estilos normais:
  ```typescript
  styles.container     // fundo, padding, flex
  styles.button        // botões
  styles.input         // campos de texto
  styles.escopoBox     // caixa de escopo
  ```

- `pdfStyles.ts` - Estilos para PDF em HTML/CSS

---

## 🔄 Fluxo de Dados (Como Tudo se Conecta)

```
┌─────────────────────────────────────────────────────────┐
│  src/screens/ListaRelatorios.tsx                        │
│  (Usuário clica em "Novo relatório")                    │
└────────────────────┬────────────────────────────────────┘
                     │ navigation.navigate(ROUTES.SELECIONAR_TIPO)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  src/screens/SelecionarTipoInspecao.tsx                 │
│  (Usuário escolhe tipo: MECANICA ou ELETRICA)           │
└────────────────────┬────────────────────────────────────┘
                     │ navigation.navigate(ROUTES.FORMULARIO_MECANICO, {...})
                     ▼
┌─────────────────────────────────────────────────────────┐
│  src/screens/FormularioRelatorioMecanicoCivil.tsx       │
│  - Usa: types/Relatorio                                 │
│  - Usa: constants/ROUTES, STRINGS                       │
│  - Usa: hooks/useRelatorios, useFormValidation          │
│  - Usa: styles/styles                                   │
│  - Renderiza: FormularioRelatorioUI                     │
└────────────────────┬────────────────────────────────────┘
                     │ salvarRelatorio()
                     ▼
┌─────────────────────────────────────────────────────────┐
│  src/hooks/useRelatorios.ts                             │
│  (Salva em AsyncStorage)                                │
└────────────────────┬────────────────────────────────────┘
                     │ (usuário finaliza e valida)
                     ▼
┌─────────────────────────────────────────────────────────┐
│  src/services/pdf/pdfService.ts                         │
│  (Gera PDF do relatório)                                │
└────────────────────┬────────────────────────────────────┘
                     │ salvarRelatorio() com status "finalizado"
                     ▼
┌─────────────────────────────────────────────────────────┐
│  src/database/database.ts                               │
│  (Salva em SQLite para sincronização)                   │
└────────────────────┬────────────────────────────────────┘
                     │ temInternet() → sincronizar()
                     ▼
┌─────────────────────────────────────────────────────────┐
│  src/services/sync/syncService.ts                       │
│  (Envia para o servidor Power Automate)                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Resumo Rápido

| Pasta | Tipo | O que faz | Exemplo |
|-------|------|----------|---------|
| **screens** | UI | Telas que o usuário vê | `ListaRelatorios.tsx` |
| **types** | Dados | Define forma dos dados | `Relatorio`, `Escopo` |
| **constants** | Config | Valores que não mudam | `ROUTES.LISTA`, `COLORS.PRIMARY` |
| **hooks** | Lógica | Lógica reutilizável | `useRelatorios()` |
| **services** | Negócio | Operações importantes | `gerarPDF()`, `sincronizar()` |
| **database** | Storage | Banco de dados local | SQLite |
| **utils** | Helpers | Funções pequenas | `formatDate()`, `isValidEmail()` |
| **config** | Setup | Configurações globais | Variáveis de ambiente |
| **styles** | Design | Cores, tamanhos, espaçamentos | `styles.button`, `COLORS.PRIMARY` |

---

## 💡 Quando Adicionar Coisas

**Adicione em `types/`:**
- Quando criar uma nova interface ou type

**Adicione em `constants/`:**
- Quando tiver um valor que repete em vários lugares

**Adicione em `hooks/`:**
- Quando tiver lógica (useState, useEffect) reutilizável

**Adicione em `services/`:**
- Quando tiver uma operação importante (API, processamento)

**Adicione em `utils/`:**
- Quando tiver uma função pequena e simples

---

## 🚀 Próximos Passos

1. **Entender os Types:**
   - Abra `src/types/relatorio.ts` e veja a estrutura de um `Relatorio`

2. **Explorar uma Tela:**
   - Abra `src/screens/ListaRelatorios.tsx` e veja como usa hooks, constants, styles

3. **Ver o Fluxo:**
   - Siga o fluxo acima quando fizer uma ação no app

4. **Testar:**
   - Rode `npm start` e veja tudo funcionando!

