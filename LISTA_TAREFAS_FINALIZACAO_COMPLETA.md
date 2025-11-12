# 📋 Lista de Tarefas para Finalização do App - Fullstack Gestor AI

**Data de Criação:** 17/01/2025  
**Última Atualização:** 20/01/2025  
**Objetivo:** Finalizar todas as funcionalidades principais do app

---

## 📊 Status Geral do Projeto

### ✅ Funcionalidades Implementadas (100%)

#### Fase 1-5: Base do Sistema ✅
- ✅ Autenticação completa (Login, Registro, OAuth, Recuperação de senha)
- ✅ Database Schema (Tabelas, RLS, Migrations)
- ✅ Layout e Navegação (Sidebar, Header, Responsivo)
- ✅ CRUD Completo de Produtos (Cadastro, Edição, Exclusão, Listagem)
- ✅ Sistema de Categorias (CRUD completo)
- ✅ Upload de Imagens (Drag & drop, Supabase Storage)
- ✅ Busca e Filtros (Tempo real, por categoria, por nome)

#### Dashboard Financeiro (Parcialmente Implementado) ✅
- ✅ Página `/financial` criada
- ✅ Cards de métricas (Receita, Despesas, Lucro, Estoque)
- ✅ Gráficos implementados (Fluxo de caixa, Receitas vs Despesas, Breakdown)
- ✅ Transações financeiras (CRUD completo)
- ✅ Transações pendentes/agendadas
- ✅ Integração com produtos
- ✅ Métodos de pagamento (PIX, Cartão, Dinheiro)
- ✅ Campo de observações/notas
- ✅ Filtros avançados (período, tipo, categoria, método de pagamento)
- ✅ Busca nas transações
- ✅ Exportação de transações (parcialmente implementado)

#### Chat Bot AI (Parcialmente Implementado) ✅
- ✅ Estrutura base do chat-bot criada
- ✅ Parser de comandos avançado
- ✅ Integração com Claude AI
- ✅ Comandos básicos funcionando (vendas, compras, despesas, receitas)
- ✅ Sistema de variações de contexto
- ✅ Suporte completo para datas relativas e específicas
- ✅ Suporte completo para parcelamentos
- ✅ Suporte completo para recorrências
- ✅ Validação e tratamento de erros
- ✅ Testes realizados com sucesso
- ✅ Interface de chat flutuante implementada

#### Sistema de Exportação (Parcialmente Implementado) ✅
- ✅ UI de exportação criada
- ✅ Geração de catálogo PDF (layout grid funcionando)
- ✅ Template profissional com logo do negócio
- ✅ Opções de filtro (por categoria, por estoque)
- ✅ Opções de personalização (cores, fontes, bordas)
- ✅ Exportação de transações (parcialmente implementado)

#### Dark Mode ✅
- ✅ Modo escuro implementado e funcional
- ✅ Toggle de tema funcional
- ✅ Componentes adaptados ao dark mode
- ✅ Transições suaves entre temas
- ✅ Preferência do usuário salva

#### Sistema de Cadastro por IA ✅
- ✅ Cadastro por imagem funcionando
- ✅ Cadastro por texto funcionando
- ✅ Suporte a múltiplos produtos
- ✅ Preview e edição antes de salvar

---

## 🚧 Tarefas Pendentes para Finalização

### 🔴 PRIORIDADE ALTA - Funcionalidades Críticas

#### 1. 🤖 Chat Bot AI - Testes e Validação
**Status:** 90% implementado | **Estimativa:** 1-2 dias

**Progresso Atual:**
- ✅ Sistema base funcionando
- ✅ Testes básicos realizados
- ✅ Comandos principais validados
- ✅ Parcelamentos e recorrências funcionando

**Plano de Testes:**

**1.1 Testes Funcionais (Cenários de Uso Real)**
- [ ] **Teste 1: Vendas Simples**
  - [ ] "vendi um colar de pérolas"
  - [ ] "vendi 2 pulseiras por 150 reais"
  - [ ] "vendi produto X por Y reais"
  - [ ] Validar: estoque atualizado, transação criada, produto encontrado corretamente

- [ ] **Teste 2: Vendas com Agendamento**
  - [ ] "vendi um colar que será pago mês que vem"
  - [ ] "vendi produto X por Y reais, pagamento dia 15"
  - [ ] "vendi produto X, pagamento em 30 dias"
  - [ ] Validar: transação pendente criada, data correta, notificação agendada

- [ ] **Teste 3: Parcelamentos**
  - [ ] "vendi em 3x de 50 reais"
  - [ ] "vendi produto X em 6 parcelas mensais de 100 reais"
  - [ ] "vendi em 4x semanais de 25 reais"
  - [ ] Validar: múltiplas transações criadas, intervalos corretos, valores corretos

- [ ] **Teste 4: Recorrências**
  - [ ] "venda de 200 reais todo mês"
  - [ ] "receita de 500 reais mensal até dia 15"
  - [ ] "despesa de 100 reais semanal"
  - [ ] Validar: recorrência criada, datas futuras geradas, término respeitado

- [ ] **Teste 5: Compras**
  - [ ] "comprei matéria-prima por 300 reais"
  - [ ] "compra de produto X por Y reais"
  - [ ] Validar: estoque atualizado, transação de despesa criada

- [ ] **Teste 6: Despesas e Receitas**
  - [ ] "gastei 50 reais com transporte"
  - [ ] "recebi 200 reais de aluguel"
  - [ ] Validar: transação criada, categoria correta, tipo correto

- [ ] **Teste 7: Comandos Ambíguos**
  - [ ] "vendi algo" (sem especificar produto)
  - [ ] "comprei" (sem valor)
  - [ ] Validar: mensagem de erro clara, sugestões de comandos

- [ ] **Teste 8: Múltiplos Produtos Similares**
  - [ ] "vendi colar" (quando há vários colares)
  - [ ] Validar: lista de produtos similares apresentada, seleção por número funciona

**1.2 Testes de Performance**
- [x] Medir tempo de resposta para comandos simples (< 2s)
- [x] Medir tempo de resposta para comandos complexos (< 5s)
- [x] Testar com grande volume de produtos (1000+)
- [x] Testar com múltiplas requisições simultâneas

**1.3 Testes de Integração**
- [ ] Validar integração com banco de dados
- [ ] Validar atualização de estoque em tempo real
- [ ] Validar criação de transações financeiras
- [ ] Validar agendamento de notificações

**1.4 Testes de UX**
- [ ] Validar feedback visual durante processamento
- [ ] Validar mensagens de erro claras
- [ ] Validar sugestões quando comando não é entendido
- [ ] Validar histórico de conversas

**1.5 Testes de Edge Cases**
- [ ] Comando vazio
- [ ] Comando com caracteres especiais
- [ ] Comando muito longo (> 500 caracteres)
- [ ] Produto inexistente
- [ ] Valor inválido (negativo, zero, texto)
- [ ] Data inválida (passado muito distante, futuro muito distante)

**1.6 Documentação de Testes**
- [x] Criar planilha de testes com resultados
- [x] Documentar bugs encontrados
- [x] Documentar melhorias sugeridas
- [x] Criar guia de uso com exemplos

---

#### 2. 🔔 Sistema de Notificações - Transações Agendadas
**Status:** 80% implementado (MVP financeiro) | **Estimativa:** 1 dia para finalizar pendências

**O que já está pronto:**
- [x] Tabelas `push_subscriptions` e `notification_logs` com RLS e índices
- [x] Constraint de `notification_logs` atualizada para suportar notificações vencidas
- [x] Hook `useRealtimeNotifications` exibindo toasts (3 dias antes, 1 dia antes, no dia e vencidas)
- [x] Endpoint `GET /api/notifications/check` com cálculo de janelas e prevenção de duplicatas
- [x] Endpoint `POST /api/notifications/mark-sent` salvando logs e deduplicando envios
- [x] Endpoint `GET /api/notifications/upcoming` alimentando o dropdown
- [x] Endpoint `POST /api/notifications/process` com envio push (web-push) + fallback `GET` em dev
- [x] Componente `NotificationButton` com badge dinâmico, lista de próximas notificações e opt-in/out
- [x] Integração com Sonner + ação para abrir `/financial`
- [x] Documentação completa em `NOTIFICACOES_COMPLETO.md`

**Pendências imediatas do MVP financeiro:**
- [x] Configurar cron job em produção (Vercel ou serviço externo) para `/api/notifications/process`
  - ✅ Arquivo `vercel.json` criado com configuração de cron job (executa diariamente às 9h)
- [x] Popular Supabase com transações de teste para validação contínua
  - ✅ Script `scripts/create-test-transactions.ts` criado para gerar transações de teste
- [ ] Cobrir APIs com testes automatizados (unitários/integrados)
- [x] Ajustar tela de configurações para permitir toggles de notificações financeiras
  - ✅ Migration criada para adicionar preferências de notificações em `users_profile`
  - ✅ Hook `useNotificationPreferences` criado para gerenciar preferências
  - ✅ Componente `Switch` criado (shadcn/ui)
  - ✅ Tela de configurações atualizada com toggles de notificações financeiras
  - ✅ Endpoint `/api/notifications/check` atualizado para respeitar preferências do usuário
  - ✅ Badge de notificações corrigido para mostrar apenas notificações que devem ser exibidas hoje

**Backlog - Fase Estoque Baixo:**
- [ ] Criar tabela `low_stock_notifications`
- [ ] Criar tabela `notification_preferences` (thresholds e toggles por usuário)
- [ ] Função/trigger para identificar estoque baixo em tempo real
- [ ] Integração com movimentações de estoque (venda/compra/edição)
- [ ] UI com abas separadas (Estoque x Transações) e itens específicos por tipo
- [ ] Botão "Marcar como lida" por item e "Marcar todas" no dropdown
- [ ] Empty states e mensagem educativa quando não houver alertas
- [ ] Endpoint dedicado para estoque baixo (listar, marcar como lida, remover)

---

#### 3. 📤 Sistema de Exportação - Correções e Melhorias
**Status:** 60% implementado | **Estimativa:** 2-3 dias

**Problemas Identificados:**
1. Catálogo em lista não está funcionando (páginas em branco)
2. Opções de personalização não são recolhidas ao selecionar lista
3. Export de transações precisa de filtros antes da exportação
4. Formato precisa ser compatível com ERPs e webstores

**Plano de Correções:**

**3.1 Correção do Catálogo em Lista**
- [ ] Investigar função `generateProductCatalogPDF` em `src/lib/export/pdf.ts`
- [ ] Verificar lógica de renderização quando `layout === 'list'`
- [ ] Corrigir geração de páginas em branco
- [ ] Garantir que produtos sejam renderizados corretamente em lista
- [ ] Testar com diferentes quantidades de produtos
- [ ] Validar paginação em modo lista

**3.2 Recolhimento de Opções ao Selecionar Lista**
- [ ] Atualizar `ProductCatalogPDFModal.tsx`
- [ ] Adicionar lógica para esconder opções de personalização quando `layout === 'list'`
- [ ] Manter apenas opções essenciais (filtros de categoria, busca)
- [ ] Adicionar animação de recolhimento
- [ ] Mostrar mensagem explicativa: "Modo lista não suporta personalização visual"

**3.3 Filtros para Export de Transações**
- [ ] Criar componente `TransactionExportModal.tsx`
- [ ] Adicionar filtros:
  - [ ] Período (data inicial e final)
  - [ ] Tipo (receita/despesa)
  - [ ] Categoria
  - [ ] Método de pagamento
  - [ ] Status (pendente/pago)
  - [ ] Valor mínimo/máximo
- [ ] Adicionar preview de quantas transações serão exportadas
- [ ] Garantir compatibilidade com dark mode
- [ ] Garantir que dropdowns não sejam transparentes

**3.4 Formatos Compatíveis com ERPs e Webstores**
- [ ] **CSV para ERPs:**
  - [ ] Formato compatível com TOTVS, SAP, Oracle
  - [ ] Encoding UTF-8 com BOM
  - [ ] Separador: vírgula ou ponto-e-vírgula (configurável)
  - [ ] Formato de data: DD/MM/YYYY ou YYYY-MM-DD (configurável)
  - [ ] Formato de moeda: separador decimal configurável
  - [ ] Headers em português e inglês (opcional)

- [ ] **Excel (.xlsx):**
  - [ ] Formato .xlsx (não .xls)
  - [ ] Múltiplas abas (Transações, Produtos, Categorias)
  - [ ] Formatação de células (moeda, data, número)
  - [ ] Filtros automáticos nas colunas
  - [ ] Headers congelados

- [ ] **Formato para Webstores:**
  - [ ] CSV compatível com Shopify
  - [ ] CSV compatível com Nuvemshop
  - [ ] CSV compatível com Mercado Livre
  - [ ] Mapeamento de campos customizável
  - [ ] Validação de campos obrigatórios

**3.5 Melhorias de UX**
- [ ] Adicionar loading state durante exportação
- [ ] Mostrar progresso da exportação
- [ ] Adicionar toast de sucesso/erro
- [ ] Permitir cancelar exportação
- [ ] Adicionar preview antes de exportar

---

#### 4. 🛒 Integração Shopify e Nuvemshop
**Status:** 0% implementado | **Estimativa:** 5-7 dias

**Plano de Implementação:**

**4.1 Integração Shopify**

**4.1.1 Autenticação OAuth**
- [ ] Criar app no Shopify Partners
- [ ] Configurar OAuth flow
- [ ] Criar tabela `shopify_integrations`
  ```sql
  CREATE TABLE shopify_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shop_domain TEXT NOT NULL,
    access_token TEXT NOT NULL,
    scope TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] Criar página `/settings/integrations/shopify`
- [ ] Implementar fluxo de autorização
- [ ] Armazenar tokens de forma segura (criptografado)

**4.1.2 Sincronização de Produtos**
- [ ] **Sincronização Bidirecional:**
  - [ ] Sincronizar produtos do app para Shopify
  - [ ] Sincronizar produtos do Shopify para o app
  - [ ] Detectar conflitos e permitir resolução manual
  - [ ] Mapeamento de categorias (app ↔ Shopify)

- [ ] **Campos Sincronizados:**
  - [ ] Nome do produto
  - [ ] Descrição
  - [ ] Preço
  - [ ] Estoque
  - [ ] Imagens
  - [ ] SKU/Código
  - [ ] Categorias/Tags
  - [ ] Status (ativo/inativo)

- [ ] **Estratégia de Sincronização:**
  - [ ] Sincronização manual (botão)
  - [ ] Sincronização automática (configurável: diária, semanal)
  - [ ] Webhooks do Shopify para atualizações em tempo real
  - [ ] Log de sincronizações

**4.1.3 Sincronização de Estoque**
- [ ] Atualizar estoque no Shopify ao vender no app
- [ ] Atualizar estoque no app ao vender no Shopify (via webhook)
- [ ] Alertas quando estoque está desincronizado
- [ ] Opção de sincronização forçada

**4.1.4 Interface de Configuração**
- [ ] Página de configuração da integração
- [ ] Status da conexão
- [ ] Última sincronização
- [ ] Configurações de sincronização automática
  - [ ] Mapeamento de categorias
- [ ] Logs de sincronização
- [ ] Botão de desconectar

**4.2 Integração Nuvemshop**

**4.2.1 Autenticação OAuth**
- [ ] Criar app no Nuvemshop Developers
- [ ] Configurar OAuth flow
- [ ] Criar tabela `nuvemshop_integrations` (similar ao Shopify)
- [ ] Implementar fluxo de autorização
- [ ] Armazenar tokens de forma segura

**4.2.2 Sincronização de Produtos**
- [ ] Similar ao Shopify, adaptado para API da Nuvemshop
- [ ] Mapeamento de campos específicos da Nuvemshop
- [ ] Sincronização bidirecional
- [ ] Webhooks para atualizações

**4.2.3 Interface Unificada**
- [ ] Criar componente `IntegrationManager.tsx`
- [ ] Listar todas as integrações disponíveis
- [ ] Status de cada integração
- [ ] Configurações individuais

**4.3 Estrutura de Código**
- [ ] Criar pasta `src/lib/integrations/`
  - [ ] `shopify/client.ts` - Cliente Shopify
  - [ ] `shopify/sync.ts` - Lógica de sincronização
  - [ ] `nuvemshop/client.ts` - Cliente Nuvemshop
  - [ ] `nuvemshop/sync.ts` - Lógica de sincronização
  - [ ] `types.ts` - Tipos compartilhados

- [ ] Criar API routes:
  - [ ] `/api/integrations/shopify/auth`
  - [ ] `/api/integrations/shopify/callback`
  - [ ] `/api/integrations/shopify/sync`
  - [ ] `/api/integrations/nuvemshop/auth`
  - [ ] `/api/integrations/nuvemshop/callback`
  - [ ] `/api/integrations/nuvemshop/sync`

**4.4 Tratamento de Erros**
- [ ] Tratar erros de API (rate limits, timeouts)
- [ ] Retry automático com backoff exponencial
- [ ] Logs detalhados de erros
- [ ] Notificações ao usuário em caso de falha

---

### 🟡 PRIORIDADE MÉDIA - Funcionalidades Importantes

#### 5. 📄 Sistema de Notas Fiscais e MEI
**Status:** 0% implementado | **Estimativa:** 7-10 dias

**Requisitos:**
- Upload e armazenamento seguro de notas fiscais
- Geração de relatório do MEI
- Integração com sistema do MEI (se possível)
- Emissão de notas fiscais pelo app (se possível)

**Plano de Implementação:**

**5.1 Armazenamento de Notas Fiscais**
- [ ] Criar tabela `invoices`
  ```sql
  CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('entrada', 'saida')),
    supplier_name TEXT,
    customer_name TEXT,
    issue_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2),
    file_url TEXT NOT NULL, -- URL do arquivo no Supabase Storage
    file_name TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    transaction_id UUID REFERENCES financial_transactions(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
  ```

- [ ] Criar bucket no Supabase Storage: `invoices`
- [ ] Configurar RLS para acesso seguro
- [ ] Implementar upload de arquivos (PDF, imagem)
- [ ] Validação de tipo de arquivo
- [ ] Limite de tamanho (ex: 10MB)

**5.2 Interface de Upload**
- [ ] Criar componente `InvoiceUpload.tsx`
- [ ] Drag & drop de arquivos
- [ ] Preview de arquivo antes de upload
- [ ] Campos para preencher:
  - [ ] Número da nota fiscal
  - [ ] Tipo (entrada/saída)
  - [ ] Fornecedor/Cliente
  - [ ] Data de emissão
  - [ ] Valor total
  - [ ] Valor de impostos
  - [ ] Associar a transação financeira (opcional)
  - [ ] Observações

- [ ] OCR básico para extrair dados automaticamente (futuro)

**5.3 Listagem e Gerenciamento**
- [ ] Criar página `/financial/invoices`
- [ ] Lista de notas fiscais com filtros:
  - [ ] Por período
  - [ ] Por tipo
  - [ ] Por fornecedor/cliente
  - [ ] Por valor
- [ ] Visualização de PDF/imagem
- [ ] Download de arquivo
- [ ] Edição de informações
- [ ] Exclusão (com confirmação)

**5.4 Relatório do MEI**
- [ ] Criar função para gerar relatório mensal/anual
- [ ] Extrair dados de:
  - [ ] Notas fiscais de entrada
  - [ ] Notas fiscais de saída
  - [ ] Transações financeiras
- [ ] Calcular:
  - [ ] Receita bruta
  - [ ] Despesas dedutíveis
  - [ ] Impostos devidos
  - [ ] Saldo a pagar

- [ ] Gerar PDF do relatório
- [ ] Template profissional
- [ ] Exportar para Excel/CSV

**5.5 Integração com Sistema do MEI**

**5.5.1 Análise de Viabilidade**
- [ ] Pesquisar APIs disponíveis do governo para MEI
- [ ] Verificar se há API pública para emissão de notas fiscais
- [ ] Verificar requisitos legais e técnicos
- [ ] Avaliar complexidade de implementação

**5.5.2 Opções de Integração:**

**Opção A: Integração Direta (Se API Disponível)**
- [ ] Integração com API do governo (ex: API da Receita Federal)
- [ ] Autenticação com certificado digital
- [ ] Emissão de notas fiscais eletrônicas (NF-e)
- [ ] Consulta de status
- [ ] Download de XML

**Opção B: Integração via Serviços Terceirizados**
- [ ] Integração com serviços como:
  - [ ] NFe.io
  - [ ] Focus NFe
  - [ ] Bling
  - [ ] Outros serviços de emissão de NF-e
- [ ] OAuth com serviço terceirizado
- [ ] Sincronização de notas emitidas
- [ ] Emissão via API do serviço

**Opção C: Geração de Documento (Não Oficial)**
- [ ] Gerar documento PDF que simula nota fiscal
- [ ] Aviso claro de que não é oficial
- [ ] Link para emissão oficial no site do governo
- [ ] Template baseado em modelo oficial

**5.5.3 Recomendação:**
- **Fase 1:** Implementar armazenamento e relatório (Opção C)
- **Fase 2:** Avaliar integração com serviços terceirizados (Opção B)
- **Fase 3:** Se viável, integrar com API oficial (Opção A)

**5.6 Segurança**
- [ ] Criptografia de arquivos sensíveis
- [ ] Acesso restrito por RLS
- [ ] Logs de acesso
- [ ] Backup automático
- [ ] Conformidade com LGPD

---

#### 6. ⚡ Otimização e Performance
**Status:** 30% implementado | **Estimativa:** 3-4 dias

**Plano de Otimização:**

**6.1 Otimizações de Performance**

**6.1.1 Lazy Loading de Componentes**
- **O que é:** Carregar componentes apenas quando necessário, em vez de carregar tudo de uma vez
- **Como funciona:** O código do componente só é baixado quando o usuário acessa aquela parte do app
- **Benefício:** App carrega mais rápido inicialmente
- **Implementação:**
  - [ ] Usar `React.lazy()` para componentes grandes
  - [ ] Usar `dynamic()` do Next.js para páginas
  - [ ] Carregar modais apenas quando abertos
  - [ ] Carregar gráficos apenas quando visíveis

**6.1.2 Otimização de Imagens**
- **O que é:** Reduzir tamanho e melhorar qualidade das imagens
- **Como funciona:** Comprime imagens automaticamente e serve em tamanhos adequados
- **Benefício:** Páginas carregam mais rápido, menos uso de dados
- **Implementação:**
  - [ ] Usar `next/image` em todos os lugares (já parcialmente implementado)
  - [ ] Configurar tamanhos responsivos
  - [ ] Usar formatos modernos (WebP, AVIF)
  - [ ] Lazy loading de imagens fora da tela
  - [ ] Placeholder/blur enquanto carrega

**6.1.3 Code Splitting Avançado**
- **O que é:** Dividir o código JavaScript em pedaços menores
- **Como funciona:** Cada página/rota tem seu próprio arquivo JavaScript
- **Benefício:** Usuário só baixa o código necessário para a página atual
- **Implementação:**
  - [ ] Verificar bundle size atual
  - [ ] Identificar bibliotecas grandes
  - [ ] Dividir rotas em chunks separados
  - [ ] Remover código não utilizado (tree shaking)

**6.1.4 Estratégias de Cache**
- **O que é:** Armazenar dados temporariamente para evitar buscar novamente
- **Como funciona:** Quando você busca dados, eles são guardados. Na próxima vez, usa os dados guardados em vez de buscar de novo
- **Benefício:** App responde mais rápido, menos requisições ao servidor
- **Implementação:**
  - [ ] Implementar React Query ou SWR para cache de dados
  - [ ] Cache de produtos por categoria
  - [ ] Cache de transações por período
  - [ ] Invalidar cache quando dados mudam
  - [ ] Cache de imagens do Supabase Storage

**6.1.5 Minimizar Tamanho do Bundle**
- **O que é:** Reduzir o tamanho total do código JavaScript
- **Como funciona:** Remove código não usado e comprime o código
- **Benefício:** App carrega mais rápido
- **Implementação:**
  - [ ] Analisar bundle com `@next/bundle-analyzer`
  - [ ] Remover dependências não utilizadas
  - [ ] Usar versões menores de bibliotecas quando possível
  - [ ] Comprimir código (minificação)

**6.2 Otimizações de Banco de Dados**
- [ ] Adicionar índices em colunas frequentemente consultadas
- [ ] Otimizar queries lentas
- [ ] Usar paginação em listas grandes
- [ ] Cache de queries frequentes
- [ ] Limitar quantidade de dados retornados

**6.3 Otimizações de Rede**
- [ ] Implementar debounce em buscas
- [ ] Agrupar requisições quando possível
- [ ] Usar compression (gzip/brotli)
- [ ] Implementar retry com backoff exponencial
- [ ] Timeout em requisições

**6.4 Métricas e Monitoramento**
- [ ] Implementar Core Web Vitals
- [ ] Monitorar tempo de carregamento
- [ ] Monitorar tamanho de bundle
- [ ] Alertas para performance degradada

---

#### 7. 📚 Documentação
**Status:** 60% implementado | **Estimativa:** 2-3 dias

**Plano de Documentação:**

**7.1 Documentação do Usuário**

**7.1.1 Guia de Uso do BOT AI**
- [ ] Criar arquivo `docs/USER_GUIDE_BOT_AI.md`
- [ ] Documentar todos os comandos disponíveis
- [ ] Exemplos práticos de cada tipo de comando
- [ ] Dicas e truques
- [ ] Troubleshooting comum
- [ ] FAQ

**7.1.2 Guia de Exportação**
- [ ] Criar arquivo `docs/USER_GUIDE_EXPORT.md`
- [ ] Como exportar catálogo PDF
- [ ] Como exportar transações
- [ ] Formatos disponíveis
- [ ] Configurações de filtros
- [ ] Integração com ERPs

**7.1.3 Guia de Integrações**
- [ ] Como conectar Shopify
- [ ] Como conectar Nuvemshop
- [ ] Configurações de sincronização
- [ ] Troubleshooting

**7.1.4 Guia de Notas Fiscais**
- [ ] Como fazer upload
- [ ] Como gerar relatório MEI
- [ ] Como associar a transações
- [ ] Emissão de notas (se implementado)

**7.2 Documentação Técnica**

**7.2.1 Documentação de APIs**
- [ ] Criar arquivo `docs/API.md`
- [ ] Documentar todas as rotas de API
- [ ] Parâmetros de entrada
- [ ] Respostas esperadas
- [ ] Códigos de erro
- [ ] Exemplos de requisições

**7.2.2 Documentação de Banco de Dados**
- [ ] Criar arquivo `docs/DATABASE.md`
- [ ] Diagrama ER (Entity-Relationship)
- [ ] Descrição de todas as tabelas
- [ ] Relacionamentos
- [ ] Índices
- [ ] Políticas RLS

**7.2.3 Documentação de Componentes**
- [ ] Criar arquivo `docs/COMPONENTS.md`
- [ ] Documentar componentes principais
- [ ] Props e tipos
- [ ] Exemplos de uso
- [ ] Dependências

**7.2.4 Guia de Contribuição**
- [ ] Criar arquivo `CONTRIBUTING.md`
- [ ] Como configurar ambiente de desenvolvimento
- [ ] Padrões de código
- [ ] Como fazer pull request
- [ ] Processo de revisão

**7.3 Documentação Visual**

**7.3.1 README Atualizado**
- [ ] Descrição completa do projeto
- [ ] Tecnologias utilizadas
- [ ] Como instalar e rodar
- [ ] Links para documentação
- [ ] Screenshots do app
- [ ] Roadmap

**7.3.2 Vídeos e Tutoriais**
- [ ] Vídeo demo do app (5-10 min)
- [ ] Tutorial de uso do BOT AI (3-5 min)
- [ ] Tutorial de exportação (2-3 min)
- [ ] Tutorial de integrações (3-5 min)

**7.4 Documentação de Segurança**
- [ ] Criar arquivo `docs/SECURITY.md`
- [ ] Medidas de segurança implementadas
- [ ] Como reportar vulnerabilidades
- [ ] Política de privacidade
- [ ] Conformidade com LGPD

---

#### 8. 🚀 Deploy e CI/CD
**Status:** 0% implementado | **Estimativa:** 2-3 dias

**Plano de Deploy:**

**8.1 CI/CD (Continuous Integration/Continuous Deployment)**

**8.1.1 O que é CI/CD:**
- **CI (Continuous Integration):** Integração Contínua
  - **O que é:** Sistema que testa automaticamente o código toda vez que alguém faz uma alteração
  - **Como funciona:** Quando você envia código para o GitHub, o sistema roda testes automaticamente
  - **Benefício:** Descobre problemas rapidamente, antes de afetar usuários

- **CD (Continuous Deployment):** Deploy Contínuo
  - **O que é:** Sistema que coloca o app no ar automaticamente quando o código está pronto
  - **Como funciona:** Após testes passarem, o sistema faz deploy automaticamente
  - **Benefício:** Atualizações chegam aos usuários rapidamente, sem trabalho manual

**8.1.2 Implementação com GitHub Actions**
- [ ] Criar arquivo `.github/workflows/ci.yml`
- [ ] Configurar testes automáticos:
  - [ ] Rodar testes unitários
  - [ ] Rodar testes de lint (verificação de código)
  - [ ] Verificar tipos TypeScript
  - [ ] Rodar testes E2E (se implementados)

- [ ] Configurar deploy automático:
  - [ ] Deploy para ambiente de staging (teste) em cada PR
  - [ ] Deploy para produção quando código é mergeado na main
  - [ ] Notificações de sucesso/erro

**8.1.3 Deploy Preview por PR**
- **O que é:** Criar uma versão temporária do app para cada pull request
- **Como funciona:** Quando alguém cria um PR, o sistema cria uma URL temporária com as mudanças
- **Benefício:** Pode testar mudanças antes de aprovar, sem afetar produção
- **Implementação:**
  - [ ] Configurar Vercel para criar previews
  - [ ] Comentar URL do preview no PR automaticamente
  - [ ] Deletar preview quando PR é fechado

**8.2 Deploy Vercel**

**8.2.1 Configuração Inicial**
- [ ] Conectar repositório GitHub ao Vercel
- [ ] Configurar variáveis de ambiente:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] Outras variáveis necessárias

- [ ] Configurar domínio customizado (opcional)
- [ ] Configurar SSL/HTTPS (automático no Vercel)

**8.2.2 Edge Functions**
- [ ] Configurar Supabase Edge Functions no Vercel
- [ ] Variáveis de ambiente para Edge Functions
- [ ] Testar funções em produção

**8.2.3 Otimizações de Deploy**
- [ ] Configurar cache de build
- [ ] Otimizar tempo de build
- [ ] Configurar ISR (Incremental Static Regeneration) onde aplicável

**8.3 Monitoramento**

**8.3.1 Vercel Analytics**
- **O que é:** Ferramenta que mostra estatísticas do app
- **Como funciona:** Coleta dados sobre visitantes, páginas visitadas, tempo de carregamento
- **Benefício:** Entende como usuários usam o app, identifica problemas de performance
- **Implementação:**
  - [ ] Habilitar Vercel Analytics
  - [ ] Configurar eventos customizados
  - [ ] Dashboard de métricas

**8.3.2 Error Tracking (Sentry)**
- **O que é:** Ferramenta que captura erros que acontecem no app
- **Como funciona:** Quando algo dá errado, envia informações sobre o erro para análise
- **Benefício:** Descobre e corrige bugs rapidamente
- **Implementação:**
  - [ ] Criar conta no Sentry
  - [ ] Instalar SDK do Sentry
  - [ ] Configurar para capturar erros
  - [ ] Configurar alertas por email

**8.3.3 Performance Monitoring**
- **O que é:** Monitorar velocidade e performance do app
- **Como funciona:** Mede tempo de carregamento, tempo de resposta, etc.
- **Benefício:** Identifica problemas de performance antes que usuários reclamem
- **Implementação:**
  - [ ] Usar Vercel Analytics para métricas básicas
  - [ ] Implementar Core Web Vitals
  - [ ] Alertas para performance degradada

**8.3.4 User Analytics**
- **O que é:** Entender como usuários usam o app
- **Como funciona:** Rastreia ações dos usuários (cliques, navegação, etc.)
- **Benefício:** Melhora o app baseado em como usuários realmente o usam
- **Implementação:**
  - [ ] Implementar Google Analytics ou similar (com consentimento LGPD)
  - [ ] Eventos customizados para ações importantes
  - [ ] Dashboard de uso

---

### 🟢 PRIORIDADE BAIXA - Funcionalidades Opcionais

#### 9. 🔒 Plano de Segurança
**Status:** Planejamento | **Estimativa:** Contínuo

**9.1 Segurança de Dados**

**9.1.1 Autenticação e Autorização**
- [ ] Implementar autenticação de dois fatores (2FA)
- [ ] Rate limiting em endpoints de autenticação
- [ ] Expiração de sessões
- [ ] Logout automático após inatividade
- [ ] Histórico de logins suspeitos

**9.1.2 Proteção de Dados Sensíveis**
- [ ] Criptografia de dados sensíveis no banco
- [ ] Criptografia de arquivos (notas fiscais)
- [ ] Máscara de dados em logs
- [ ] Não armazenar senhas em texto plano (já implementado via Supabase)

**9.1.3 Row Level Security (RLS)**
- [ ] Revisar todas as políticas RLS
- [ ] Garantir que usuários só acessem seus próprios dados
- [ ] Testar políticas de segurança
- [ ] Documentar políticas implementadas

**9.2 Segurança de API**

**9.2.1 Validação de Entrada**
- [ ] Validar todos os inputs do usuário
- [ ] Sanitizar dados antes de salvar
- [ ] Proteção contra SQL Injection (já protegido pelo Supabase)
- [ ] Proteção contra XSS (Cross-Site Scripting)

**9.2.2 Rate Limiting**
- [ ] Implementar rate limiting em todas as APIs
- [ ] Limites diferentes por tipo de endpoint
- [ ] Retornar erro claro quando limite excedido

**9.2.3 CORS (Cross-Origin Resource Sharing)**
- [ ] Configurar CORS corretamente
- [ ] Permitir apenas origens confiáveis
- [ ] Não permitir credenciais de origens não confiáveis

**9.3 Segurança de Infraestrutura**

**9.3.1 Variáveis de Ambiente**
- [ ] Nunca commitar secrets no código
- [ ] Usar variáveis de ambiente para todas as chaves
- [ ] Rotacionar chaves periodicamente
- [ ] Usar diferentes chaves para dev/staging/prod

**9.3.2 Dependências**
- [ ] Manter dependências atualizadas
- [ ] Verificar vulnerabilidades regularmente (`npm audit`)
- [ ] Usar Dependabot ou similar para atualizações automáticas
- [ ] Remover dependências não utilizadas

**9.3.3 HTTPS e SSL**
- [ ] Garantir HTTPS em produção (automático no Vercel)
- [ ] Certificados SSL válidos
- [ ] HSTS (HTTP Strict Transport Security)

**9.4 Conformidade Legal**

**9.4.1 LGPD (Lei Geral de Proteção de Dados)**
- [ ] Política de privacidade clara
- [ ] Termos de uso
- [ ] Consentimento explícito para coleta de dados
- [ ] Direito ao esquecimento (deletar dados do usuário)
- [ ] Portabilidade de dados (exportar dados do usuário)
- [ ] Notificação de vazamentos de dados

**9.4.2 Auditoria e Logs**
- [ ] Logs de todas as ações sensíveis
- [ ] Retenção de logs por período adequado
- [ ] Logs não devem conter dados sensíveis
- [ ] Acesso a logs restrito

**9.5 Testes de Segurança**

**9.5.1 Testes Regulares**
- [ ] Testes de penetração (penetration testing)
- [ ] Análise de vulnerabilidades
- [ ] Revisão de código focada em segurança
- [ ] Bug bounty program (opcional)

**9.5.2 Monitoramento de Segurança**
- [ ] Alertas para atividades suspeitas
- [ ] Monitoramento de tentativas de acesso não autorizado
- [ ] Análise de padrões de uso anômalos

**9.6 Backup e Recuperação**

**9.6.1 Backups**
- [ ] Backups automáticos do banco de dados
- [ ] Backups de arquivos (Supabase Storage)
- [ ] Frequência adequada (diário, semanal)
- [ ] Testar restauração de backups regularmente

**9.6.2 Plano de Recuperação de Desastres**
- [ ] Documentar processo de recuperação
- [ ] Tempo de recuperação estimado (RTO)
- [ ] Ponto de recuperação (RPO)
- [ ] Testar plano regularmente

---

## 📖 Explicações Técnicas para Não-Programadores

### 🔧 Termos de Programação Explicados

#### **GitHub**
- **O que é:** Plataforma online onde desenvolvedores guardam e compartilham código
- **Analogia:** É como um Google Drive, mas especializado para código de programas
- **Por que usar:** Permite trabalhar em equipe, ver histórico de mudanças, voltar versões antigas se algo der errado
- **Conceitos importantes:**
  - **Repositório (repo):** Pasta que contém todo o código do projeto
  - **Commit:** Salvar uma versão do código com uma mensagem explicando o que mudou
  - **Branch:** Versão paralela do código para testar coisas sem afetar a versão principal
  - **Pull Request (PR):** Pedido para incorporar mudanças de uma branch na principal
  - **Merge:** Juntar mudanças de uma branch na outra

#### **Database (Banco de Dados)**
- **O que é:** Sistema que armazena e organiza informações de forma estruturada
- **Analogia:** É como uma planilha Excel gigante, mas muito mais poderosa e organizada
- **Tipos comuns:**
  - **PostgreSQL:** Banco de dados relacional (usa tabelas como Excel)
  - **MySQL:** Similar ao PostgreSQL, muito popular
  - **MongoDB:** Banco de dados não-relacional (armazena como documentos JSON)

#### **Supabase - É Seguro?**
- **O que é:** Plataforma que fornece banco de dados PostgreSQL + outras ferramentas
- **Segurança:**
  - ✅ **Criptografia:** Dados são criptografados em trânsito (HTTPS) e em repouso
  - ✅ **RLS (Row Level Security):** Cada usuário só acessa seus próprios dados
  - ✅ **Autenticação:** Sistema robusto de login/registro
  - ✅ **Backups:** Backups automáticos
  - ✅ **Compliance:** Conformidade com padrões de segurança (SOC 2, ISO 27001)
- **Alternativas:**
  - **Firebase (Google):** Similar ao Supabase, mas usa NoSQL
  - **PlanetScale:** Banco MySQL gerenciado
  - **Railway/Render:** Serviços que permitem hospedar seu próprio banco
  - **Self-hosted:** Hospedar seu próprio PostgreSQL (mais trabalho, mais controle)

#### **Como Reforçar Segurança do App**

**1. Autenticação Forte**
- Senhas fortes obrigatórias
- Autenticação de dois fatores (2FA)
- Limite de tentativas de login

**2. Proteção de Dados**
- Criptografar dados sensíveis
- Não armazenar informações desnecessárias
- Limpar dados antigos regularmente

**3. Validação de Entrada**
- Verificar todos os dados que usuários enviam
- Bloquear tentativas de injeção de código
- Limitar tamanho de uploads

**4. Monitoramento**
- Logs de atividades suspeitas
- Alertas para tentativas de acesso não autorizado
- Análise de padrões anômalos

**5. Atualizações**
- Manter dependências atualizadas
- Corrigir vulnerabilidades rapidamente
- Testar antes de fazer deploy

**6. Conformidade Legal**
- Seguir LGPD
- Política de privacidade clara
- Direito ao esquecimento

---

## 📊 Progresso Geral Atualizado

| Área | Status | Progresso |
|------|--------|-----------|
| **Autenticação** | ✅ Completo | 100% |
| **Produtos** | ✅ Completo | 100% |
| **Dashboard Financeiro** | 🟡 Parcial | 85% |
| **Chat Bot AI** | 🟡 Parcial | 90% |
| **Exportação** | 🟡 Parcial | 60% |
| **IA de Produtos** | ✅ Completo | 95% |
| **Dark Mode** | ✅ Completo | 95% |
| **Notificações** | 🔴 Pendente | 0% |
| **Integrações (Shopify/Nuvemshop)** | 🔴 Pendente | 0% |
| **Notas Fiscais/MEI** | 🔴 Pendente | 0% |
| **Otimização** | 🟡 Parcial | 30% |
| **Documentação** | 🟡 Parcial | 60% |
| **Deploy/CI/CD** | 🔴 Pendente | 0% |
| **Segurança** | 🟡 Parcial | 40% |

**Progresso Total Estimado: 72%**

---

## 🚀 Próximos Passos Imediatos

### Esta Semana:
1. ✅ Finalizar testes do BOT AI
2. 🔄 Implementar sistema de notificações de estoque baixo
3. 🔄 Corrigir catálogo PDF em modo lista
4. 🔄 Adicionar filtros ao export de transações

### Próxima Semana:
1. 🔄 Planejar integração Shopify/Nuvemshop
2. 🔄 Começar implementação de notas fiscais
3. 🔄 Melhorar documentação
4. 🔄 Começar otimizações de performance

### Depois:
1. 🔄 Implementar integrações completas
2. 🔄 Finalizar sistema de notas fiscais
3. 🔄 Configurar CI/CD
4. 🔄 Deploy em produção
5. 🔄 Implementar melhorias de segurança

---

## 📝 Notas Importantes

- ✅ Sistema funcional para uso básico
- ✅ BOT AI testado e funcionando bem
- ✅ Dark mode implementado e funcional
- ✅ Exportação parcialmente implementada (precisa correções)
- ⏳ Sistema de notificações precisa ser implementado
- ⏳ Integrações com e-commerces são próximas prioridades
- ⏳ Sistema de notas fiscais é funcionalidade importante para MEI
- 🔒 Segurança deve ser prioridade contínua

---

**Última atualização:** 20/01/2025  
**Próxima revisão:** Após completar testes do BOT AI e implementar notificações

**Mudanças Recentes:**
- ✅ Chat Bot AI: Testes realizados, sistema funcionando bem
- ✅ Dark Mode: Implementação completa e funcional
- ✅ Exportação: Catálogo PDF em grid funcionando, lista precisa correção
- ✅ Dashboard Financeiro: Métodos de pagamento, observações, filtros implementados
- ✅ Sistema de cadastro por IA: Texto e imagem funcionando
- 📋 Planejamento: Notificações, integrações, notas fiscais, segurança documentados
- 📋 Planejamento: Otimização, documentação, deploy e CI/CD planejados
