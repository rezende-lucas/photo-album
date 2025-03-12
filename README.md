# Sistema de Identificação e Catalogação Tática (S.I.D.C.T.) - Documentação Técnica

## Sumário
1. [Visão Geral do Projeto](#visão-geral-do-projeto)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Interface do Usuário](#interface-do-usuário)
5. [Funcionalidades Principais](#funcionalidades-principais)
6. [Implementação Técnica](#implementação-técnica)
7. [Persistência de Dados](#persistência-de-dados)
8. [Fluxo de Trabalho de Implantação](#fluxo-de-trabalho-de-implantação)
9. [Segurança e Tratamento de Erros](#segurança-e-tratamento-de-erros)
10. [Design Responsivo](#design-responsivo)
11. [Personalização da Interface](#personalização-da-interface)
12. [Guia de Manutenção](#guia-de-manutenção)

## Visão Geral do Projeto

O Sistema de Identificação e Catalogação Tática (S.I.D.C.T.) é uma aplicação web moderna para gerenciamento de registros de pessoas, projetada com uma interface tática inspirada em sistemas de segurança. A aplicação permite catalogar, visualizar, editar e excluir registros de pessoas, com suporte para armazenamento de dados em nuvem através do Supabase ou localmente no navegador quando offline.

### Objetivos do Projeto
- Fornecer um sistema eficiente para catalogação e gestão de registros de pessoas
- Oferecer uma interface visualmente atraente com elementos táticos
- Implementar persistência de dados resiliente com suporte online e offline
- Garantir experiência de usuário responsiva em diferentes dispositivos

### Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: Flex/Grid Layout, CSS Variables, Animações CSS
- **Armazenamento**: Supabase (primário), LocalStorage (fallback)
- **Implantação**: GitHub Pages via GitHub Actions

## Arquitetura do Sistema

O S.I.D.C.T. segue uma arquitetura de aplicação web de página única (SPA) com uma implementação modular de JavaScript. A arquitetura incorpora:

### Componentes Principais
1. **Interface do Usuário**: Construída com HTML5 e estilizada com CSS3
2. **Lógica de Aplicação**: Implementada em JavaScript vanilla usando padrão de módulo IIFE
3. **Persistência de Dados**: Implementação dual com Supabase e LocalStorage
4. **Sistema de Notificação**: Toast notifications para feedback ao usuário
5. **Visualizações**: Suporte para modos de visualização em grade e lista

### Fluxo de Dados
```
[UI] ⟷ [Lógica da Aplicação] ⟷ [Camada de Persistência (Supabase/LocalStorage)]
```

O sistema usa uma abordagem de fallback para garantir funcionalidade mesmo quando desconectado:
1. Tentativa de conexão com Supabase
2. Em caso de falha, reversão para LocalStorage
3. Sincronização de dados quando a conexão é restabelecida

## Estrutura de Arquivos

```
/
├── .github/
│   └── workflows/
│       └── deploy.yml       # Fluxo de trabalho CI/CD para GitHub Pages
├── css/
│   └── styles.css           # Estilos da aplicação
├── js/
│   ├── config.js            # Configuração do Supabase (gerado no deploy)
│   └── script.js            # Lógica da aplicação
├── .gitignore               # Arquivos ignorados pelo Git
├── index.html               # Página principal da aplicação
```

## Interface do Usuário

A interface do S.I.D.C.T. foi projetada com um tema visual tático, inspirado em sistemas de vigilância e catalogação de alta segurança.

### Elementos de Interface
1. **Cabeçalho Tático**: Barra superior com efeito de listras animadas
2. **Barra Lateral**: Menu de navegação com opções de visualização e ações
3. **Área de Conteúdo Principal**: Exibição de registros em grade ou lista
4. **Modais**: Para detalhes, adição e edição de registros
5. **Notificações Toast**: Feedback visual sobre ações do usuário
6. **Radar Animado**: Elemento visual decorativo no canto inferior esquerdo
7. **Scan Lines**: Efeito visual sobreposto para estética tática

### Modos de Visualização
- **Grade**: Cartões visuais para cada registro com foto em destaque
- **Lista**: Visualização compacta focada em informações essenciais

### Tema Claro/Escuro
A aplicação suporta alternância entre temas escuro (padrão) e claro, com preferências salvas no LocalStorage.

## Funcionalidades Principais

### Gestão de Registros
- **Adição**: Cadastro de novos registros com dados pessoais e foto
- **Visualização**: Exibição de registros em grade ou lista com pesquisa
- **Edição**: Atualização de dados de registros existentes
- **Exclusão**: Remoção de registros com confirmação de segurança

### Recursos de Interface
- **Pesquisa**: Filtragem de registros por nome, filiação, endereço ou ID
- **Alternância de Visualização**: Mudança entre modos grade e lista
- **Tema Escuro/Claro**: Personalização da aparência da interface
- **Design Responsivo**: Adaptação a diferentes tamanhos de tela

### Recursos de Dados
- **Persistência**: Armazenamento primário no Supabase, fallback para LocalStorage
- **IDs de Registro**: Geração automática de identificadores formatados (REG-XXXXXXXX)
- **Armazenamento de Imagens**: Suporte para fotos codificadas em base64

## Implementação Técnica

### Estrutura JavaScript
A aplicação utiliza o padrão de módulo IIFE (Immediately Invoked Function Expression) para encapsulamento de código:

```javascript
(function() {
    // Estado da aplicação
    let people = [];
    let currentPersonId = null;
    let currentView = 'grid';
    let isDarkMode = false;
    let supabaseClient = null;
    
    // Funções da aplicação...
    
    // Inicialização quando o DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        // Inicialização da aplicação
    });
})();
```

### Abordagem de Desenvolvimento

1. **Encapsulamento**: Todo o código é encapsulado em uma IIFE para evitar poluição do escopo global
2. **Manipulação do DOM**: Abordagem baseada em referências cacheadas para elementos DOM frequentemente acessados
3. **Tratamento de Eventos**: Event listeners centralizados com delegação de eventos para elementos dinâmicos
4. **Gestão de Estado**: Estado da aplicação mantido em variáveis de módulo
5. **Renderização Dinâmica**: Interface atualizada baseada no estado da aplicação

### Estratégias de Performance
- **Animações CSS**: Preferência por animações CSS sobre JavaScript para melhor performance
- **Lazy Loading**: Carregamento de dados sob demanda
- **Delegação de Eventos**: Redução do número de event listeners
- **Renderização Seletiva**: Atualização apenas dos componentes necessários

## Persistência de Dados

### Integração com Supabase
O sistema utiliza o Supabase como backend primário para armazenamento de dados:

```javascript
// Criar cliente Supabase
function initializeSupabaseClient() {
    if (!checkSupabaseConfig()) {
        console.warn('⚠️ Configuração do Supabase inválida. Usando apenas armazenamento local.');
        return createMockSupabaseClient();
    }
    
    try {
        const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return client;
    } catch (error) {
        console.error("Erro ao inicializar cliente Supabase:", error);
        return createMockSupabaseClient();
    }
}
```

### Mecanismo de Fallback
A aplicação implementa um sistema de fallback para garantir funcionalidade offline:

1. **Cliente Mock do Supabase**: Implementação que emula a API do Supabase usando LocalStorage
2. **Detecção de Falhas**: Tratamento de erros durante operações de banco de dados
3. **Persistência Local**: Backup automático dos dados no LocalStorage

### Estrutura de Dados
Os registros de pessoas seguem esta estrutura:

```javascript
{
    id: "string",            // Identificador único
    name: "string",          // Nome da pessoa (obrigatório)
    filiation: "string|null", // Filiação
    address: "string|null",  // Endereço
    history: "string|null",  // Histórico/observações
    dob: "string|null",      // Data de nascimento (formato ISO)
    phone: "string|null",    // Telefone
    email: "string|null",    // Email
    photo: "string|null"     // Foto em base64
}
```

## Fluxo de Trabalho de Implantação

A aplicação utiliza GitHub Actions para implantação automática no GitHub Pages.

### Workflow de CI/CD
O arquivo `.github/workflows/deploy.yml` define o fluxo de trabalho de implantação:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write  # Permissão para publicação
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3
        
      - name: Create config.js with environment variables
        run: |
          # Criar o diretório js se não existir
          mkdir -p js
          
          # Criar o arquivo config.js com as variáveis do GitHub Secrets
          echo "const SUPABASE_URL = '${{ secrets.SUPABASE_URL }}';" > js/config.js
          echo "const SUPABASE_KEY = '${{ secrets.SUPABASE_KEY }}';" >> js/config.js
          
          # Remover js/config.js do .gitignore para permitir o deploy
          sed -i '/js\/config.js/d' .gitignore
          
      - name: Deploy to GitHub Pages
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: .  # Diretório a ser publicado
          branch: gh-pages  # Branch de destino
          clean: true  # Limpar arquivos existentes no branch gh-pages
```

### Gestão de Segredos
As credenciais do Supabase são gerenciadas como segredos no GitHub:
- `SUPABASE_URL`: URL da instância do Supabase
- `SUPABASE_KEY`: Chave de API do Supabase

O arquivo `config.js` é gerado dinamicamente durante o deploy, permitindo armazenar as credenciais de forma segura sem incluí-las no repositório.

## Segurança e Tratamento de Erros

### Gestão de Credenciais
- Credenciais do Supabase armazenadas como segredos no GitHub
- Geração dinâmica do arquivo de configuração durante o deploy
- Arquivo `config.js` ignorado pelo Git para evitar exposição de credenciais

### Tratamento de Erros
A aplicação implementa tratamento de erros abrangente:

1. **Verificação de Configuração**: Validação da configuração do Supabase antes de usar
2. **Try/Catch**: Bloco try/catch ao redor de operações críticas
3. **Fallback**: Reversão para LocalStorage em caso de falha na conexão com Supabase
4. **Feedback Visual**: Notificações toast para informar o usuário sobre erros
5. **Logging**: Registro de erros no console para depuração

### Detecção de Ambiente Offline
```javascript
// Verificar se a configuração do Supabase está disponível
function checkSupabaseConfig() {
    return typeof SUPABASE_URL !== 'undefined' && 
           typeof SUPABASE_KEY !== 'undefined' && 
           SUPABASE_URL !== '__SUPABASE_URL__' && 
           SUPABASE_KEY !== '__SUPABASE_KEY__' &&
           SUPABASE_URL !== '' && 
           SUPABASE_KEY !== '';
}
```

## Design Responsivo

A interface foi projetada para funcionar em diversos dispositivos, do desktop ao mobile.

### Breakpoints Principais
```css
/* Desktop grande (padrão) */
/* Estilos base aqui */

/* Desktop menor */
@media (max-width: 1200px) {
    .content-area {
        margin-left: 80px;
        padding: 0 0.5rem;
    }
    
    .photo-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
}

/* Tablet */
@media (max-width: 992px) {
    .sidebar {
        width: 0;
        opacity: 0;
    }
    
    .content-area {
        margin-left: 0;
    }
    
    .menu-toggle {
        display: block;
    }
}

/* Mobile grande */
@media (max-width: 768px) {
    .header {
        padding: 0 1rem;
    }
    
    .brand-name {
        display: none;
    }
    
    .content-header {
        flex-direction: column;
    }
}

/* Mobile pequeno */
@media (max-width: 576px) {
    .search-container {
        display: none;
    }
    
    .photo-grid {
        grid-template-columns: 1fr;
    }
}
```

### Adaptações Mobile
- **Menu Recolhível**: Barra lateral que se recolhe em telas menores
- **Simplificação de Interface**: Elementos não essenciais ocultados em telas pequenas
- **Layout Fluido**: Grid adaptável com minmax para ajuste automático
- **Touch Friendly**: Tamanho de elementos interativos adequado para toque

## Personalização da Interface

### Sistema de Cores com Variáveis CSS
```css
:root {
    /* Variáveis de cores - Tema escuro (padrão) */
    --bg-primary: #0e1419;
    --bg-secondary: #1a2129;
    --text-primary: #e6e9ed;
    --text-secondary: #93a7ba;
    --accent-primary: #2b6cb0;
    --accent-secondary: #c53030;
    --accent-tertiary: #2f855a;
    /* Mais variáveis... */
}

.light-mode {
    --bg-primary: #edf2f7;
    --bg-secondary: #ffffff;
    --text-primary: #1a202c;
    --text-secondary: #4a5568;
    --glass-bg: rgba(237, 242, 247, 0.8);
    --glass-border: rgba(203, 213, 224, 0.3);
}
```

### Elementos Visuais Especiais
1. **Efeito de Vidro (Glassmorphism)**:
   ```css
   .glass-element {
       background: var(--glass-bg);
       backdrop-filter: blur(10px);
       -webkit-backdrop-filter: blur(10px);
       border: 1px solid var(--glass-border);
   }
   ```

2. **Animações e Transições**:
   ```css
   @keyframes moveStripes {
       0% { background-position: 0 0; }
       100% { background-position: 50px 0; }
   }
   
   @keyframes pulse {
       0% {
           transform: scale(1);
           opacity: 1;
       }
       70% {
           transform: scale(1.5);
           opacity: 0;
       }
       100% {
           transform: scale(1);
           opacity: 0;
       }
   }
   ```

3. **Radar Animado SVG**:
   ```css
   @keyframes radarSweep {
       from { transform: rotate(0deg); }
       to { transform: rotate(360deg); }
   }
   
   @keyframes radarPing {
       0%, 100% {
           opacity: 0;
           r: 1;
       }
       50% {
           opacity: 1;
           r: 3;
       }
   }
   ```

## Guia de Manutenção

### Adição de Novos Campos
Para adicionar novos campos ao registro de pessoas:

1. Atualizar o HTML do formulário em `index.html`:
   ```html
   <div class="form-group">
       <label for="novo_campo" class="form-label">Novo Campo</label>
       <input type="text" class="form-control" id="novo_campo" name="novo_campo">
   </div>
   ```

2. Atualizar a função `savePerson()` em `script.js` para capturar o novo campo:
   ```javascript
   const personData = {
       // Campos existentes...
       novo_campo: emptyToNull(formData.get('novo_campo'))
   };
   ```

3. Atualizar os templates de renderização para exibir o novo campo:
   ```javascript
   // Em renderGridView() ou renderListView()
   // E em openPersonDetails()
   ```

### Personalização Visual
Para modificar o esquema de cores:

1. Editar as variáveis CSS no início de `styles.css`:
   ```css
   :root {
       --accent-primary: #novo-valor; /* Alterar cor primária */
       /* Outras variáveis... */
   }
   ```

2. Para temas adicionais, criar um novo conjunto de variáveis e aplicar via JavaScript:
   ```javascript
   function applyTheme(themeName) {
       document.body.className = themeName;
   }
   ```

### Configuração do Supabase
Para configurar o Supabase corretamente:

1. Criar uma nova tabela `people` no Supabase com a estrutura de dados apropriada
2. Definir permissões de acesso adequadas na tabela
3. Configurar os seguintes segredos no repositório GitHub:
   - `SUPABASE_URL`: URL da sua instância Supabase
   - `SUPABASE_KEY`: Chave anônima do Supabase

### Solução de Problemas Comuns

1. **Dados não persistem após recarregar**:
   - Verificar se o Supabase está configurado corretamente
   - Verificar console para erros de conexão
   - Confirmar se localStorage está funcionando no navegador

2. **Imagens não carregam**:
   - Verificar se a conversão base64 está funcionando corretamente
   - Confirmar se o tamanho das imagens não excede limites de armazenamento

3. **Interface quebrada em dispositivos específicos**:
   - Adicionar breakpoints CSS adicionais para o dispositivo problemático
   - Verificar suporte de navegador para recursos CSS avançados

4. **Erros na implantação do GitHub Pages**:
   - Verificar logs de Actions no GitHub
   - Confirmar se os segredos estão configurados corretamente
   - Verificar permissões do fluxo de trabalho

---
