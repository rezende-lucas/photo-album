# Sistema de Identificação e Catalogação Tática (S.I.D.C.T.)

Um sistema web moderno para gerenciamento de registros de pessoas, com interface tática inspirada em sistemas de segurança.

## Visão Geral

O S.I.D.C.T. permite catalogar, visualizar, editar e excluir registros de pessoas, oferecendo:

- Interface visual tática com elementos animados
- Suporte para múltiplas fotografias por registro
- Persistência de dados em nuvem (Supabase) com fallback para armazenamento local
- Autenticação de usuários
- Visualização em grade e lista
- Design responsivo

## Tecnologias Principais

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Estrutura**: Arquitetura modular com padrão IIFE e módulos ES6
- **Armazenamento**: Supabase (primário), LocalStorage (fallback)
- **Implantação**: GitHub Pages via GitHub Actions
- **Autenticação**: Supabase Auth

## Arquitetura

O sistema utiliza uma arquitetura modular ES6:

```
js/
├── main.js                    # Ponto de entrada da aplicação
├── auth.js                    # Gerenciamento de autenticação (página de login)
├── components/
│   └── toast.js               # Componente de notificações toast
├── modules/
    ├── auth.js                # Funcionalidades de autenticação
    ├── events.js              # Gerenciamento de eventos e listeners
    ├── people.js              # Manipulação de registros de pessoas
    ├── photoManager.js        # Gerenciamento de múltiplas fotos
    ├── render.js              # Renderização de interfaces
    ├── storage.js             # Persistência de dados (Supabase/localStorage)
    └── ui.js                  # Manipulação de elementos de interface
```

## Funcionalidades Principais

### Gestão de Registros
- Cadastro de registros com múltiplas fotografias
- Visualização em grade ou lista com pesquisa e filtragem
- Edição e exclusão de registros
- Captura de fotos com câmera integrada

### Sistema de Autenticação
- Login/registro de usuários
- Recuperação de senha
- Proteção de rotas (requireAuth)
- Gestão de perfil de usuário

### Persistência de Dados
- Armazenamento primário no Supabase
- Fallback automático para LocalStorage quando offline
- Sincronização quando a conexão é restabelecida

## Configuração e Implantação

### Pré-requisitos
- Conta no Supabase para banco de dados e autenticação
- Repositório GitHub para implantação

### Configuração Inicial
1. Clone o repositório
2. Configure os seguintes segredos no GitHub:
   - `SUPABASE_URL`: URL da sua instância Supabase
   - `SUPABASE_KEY`: Chave anônima do Supabase

### Estrutura do Banco de Dados
A tabela `people` no Supabase deve conter os seguintes campos:
- `id`: Identificador único (string)
- `name`: Nome da pessoa
- `filiation`: Filiação (opcional)
- `address`: Endereço (opcional)
- `history`: Histórico/observações (opcional)
- `dob`: Data de nascimento (opcional)
- `phone`: Telefone (opcional)
- `email`: Email (opcional)
- `localPhotos`: Array de objetos contendo fotos

## Customização

### Tema Visual
- Edite as variáveis CSS em `styles.css` para personalizar cores e aparência
- A aplicação suporta tema claro/escuro via alternância dinâmica

### Campos de Registro
Para adicionar ou modificar campos:
1. Atualize o HTML do formulário em `index.html`
2. Modifique as funções de manipulação em `people.js`
3. Atualize os templates de renderização em `render.js`

## Melhorias Recentes

- Migração para arquitetura modular ES6
- Implementação de suporte para múltiplas fotografias
- Adição de sistema de autenticação
- Componente de câmera para captura de fotos

## Solução de Problemas

- **Erro na conexão Supabase**: Verifique as credenciais nos segredos do GitHub
- **Interface quebrada em dispositivos**: Ajustar os breakpoints em `styles.css`
- **Problemas no deploy**: Verificar logs nas GitHub Actions
