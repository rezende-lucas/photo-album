# Funcionalidade de Reconhecimento de Texto em Imagens (OCR)

Esta documentação descreve a implementação da funcionalidade de OCR (Reconhecimento Óptico de Caracteres) no Sistema de Identificação e Catalogação Tático (S.I.D.C.T.).

## Visão Geral

A funcionalidade de OCR permite extrair automaticamente texto de imagens de documentos e preencher os campos do formulário de cadastro. Isto agiliza o processo de entrada de dados, reduz erros de digitação e melhora a experiência do usuário.

## Como Funciona

1. O usuário faz upload de uma foto de documento (RG, CPF, etc.) ou captura uma imagem com a câmera
2. O sistema processa a imagem usando a biblioteca Tesseract.js para extrair o texto
3. O texto extraído é analisado e mapeado para os campos correspondentes do formulário
4. Os campos são preenchidos automaticamente com os dados extraídos
5. O usuário pode revisar e corrigir as informações antes de salvar

## Componentes Técnicos

### Bibliotecas Utilizadas

- **Tesseract.js**: Biblioteca de OCR JavaScript que funciona diretamente no navegador
- **Processamento de imagem**: Pré-processamento para melhorar a qualidade da extração

### Arquivos do Sistema

- `js/modules/ocr.js`: Módulo principal de OCR que gerencia a extração de texto
- `js/modules/photoManager.js`: Integração com o sistema de gerenciamento de fotos existente
- `css/ocr-styles.css`: Estilos específicos para a funcionalidade de OCR

## Funcionalidades Implementadas

### Extração de Texto

- Extração completa de texto de imagens
- Pré-processamento de imagens para melhorar a precisão (contraste, binarização)
- Indicador visual de progresso durante o processamento

### Análise e Mapeamento de Dados

- Identificação automática de padrões como CPF, RG, nomes, endereços
- Sistema de confiança que indica a precisão de cada campo extraído
- Visualização detalhada dos resultados para revisão

### Interface de Usuário

- Botão "Extrair Texto" para iniciar o processo de OCR
- Indicador de progresso durante o processamento
- Modal para revisar os dados extraídos antes de aplicar ao formulário
- Indicadores visuais de confiança nos campos preenchidos

## Como Usar

1. **Adicionar uma foto**: Faça upload de uma imagem ou use a câmera para capturar um documento
2. **Extrair texto**: Clique no botão "Extrair Texto" ou no ícone de texto na miniatura da foto
3. **Revisar os dados**: Verifique os dados extraídos no modal de resultados
4. **Confirmar**: Os dados serão aplicados aos campos do formulário
5. **Editar se necessário**: Corrija qualquer informação que não tenha sido extraída corretamente
6. **Salvar registro**: Complete o cadastro normalmente

## Indicadores de Confiança

Os campos preenchidos automaticamente pelo OCR são marcados com cores que indicam o nível de confiança:

- **Verde (alta confiança)**: Dados com alta probabilidade de estarem corretos
- **Amarelo (média confiança)**: Dados que podem precisar de verificação
- **Vermelho (baixa confiança)**: Dados com baixa precisão que provavelmente precisarão de correção manual

## Considerações Técnicas

### Performance

- O processamento OCR é executado assincronamente para não bloquear a interface
- As imagens são pré-processadas para otimizar a extração de texto
- Todo o processamento é realizado no lado do cliente, sem necessidade de servidor

### Privacidade e Segurança

- Todo o processamento é feito localmente no navegador do usuário
- As imagens não são enviadas para servidores externos
- Os dados extraídos são aplicados apenas temporariamente até que o usuário confirme o salvamento

## Limitações

- A precisão da extração depende da qualidade da imagem original
- Documentos com layouts muito diferentes do padrão podem não ser reconhecidos corretamente
- Textos manuscritos têm taxa de reconhecimento significativamente menor

## Solução de Problemas

### Texto Não Extraído Corretamente

- Verifique se a imagem está bem iluminada e focada
- Tente posicionar o documento sobre um fundo de cor contrastante
- Certifique-se que o texto está legível e não está desbotado ou danificado

### Baixo Desempenho

- O processamento OCR é intensivo em termos de CPU
- Em dispositivos de menor performance, o processo pode levar mais tempo
- Considere usar imagens de menor resolução para melhorar o desempenho

## Desenvolvimento Futuro

Possíveis melhorias para futuras versões:

- Suporte para reconhecimento de mais tipos de documentos
- Melhorias na precisão com modelos de OCR específicos para documentos brasileiros
- Capacidade de extrair informações de múltiplas imagens de um mesmo documento
