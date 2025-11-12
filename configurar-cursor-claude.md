# 🔧 Como Configurar o Cursor para Usar Claude

## 📋 **Passo a Passo:**

### **1. Abrir Configurações do Cursor:**
- Clique no ícone de **engrenagem** (⚙️) no canto superior direito
- Ou use `Ctrl + ,` (vírgula)

### **2. Navegar para Modelos de IA:**
- Procure por **"AI"** ou **"Models"** no menu lateral
- Clique em **"AI Settings"** ou **"Model Selection"**

### **3. Selecionar Claude:**
- Desative **"Auto-select"** ou **"Automático"**
- Selecione **"Claude"** da lista de modelos
- Escolha a versão: **Claude 3.5 Sonnet** (recomendado)

### **4. Configurar API Key (se necessário):**
- Se aparecer campo para API Key, cole sua chave: `sk-ant-sua-chave-aqui`
- Ou deixe em branco se já configurou nas variáveis de ambiente

### **5. Salvar Configurações:**
- Clique em **"Save"** ou **"Aplicar"**
- Reinicie o Cursor se solicitado

## 🎯 **Configuração Via Arquivo (Alternativa):**

### **Arquivo de Configuração:**
```json
{
  "cursor.ai.model": "claude-3.5-sonnet",
  "cursor.ai.autoSelect": false,
  "cursor.ai.provider": "anthropic"
}
```

## 🔍 **Verificar se Funcionou:**

### **Teste Rápido:**
1. Abra um arquivo de código
2. Pressione `Ctrl + K` para abrir o chat
3. Digite: "Analise este código"
4. Verifique se a resposta vem do Claude

### **Indicadores Visuais:**
- ✅ **Nome do modelo** aparece no chat
- ✅ **Respostas em português** (se configurado)
- ✅ **Qualidade das respostas** melhorada

## 🚨 **Solução de Problemas:**

### **Se não conseguir encontrar as configurações:**
1. **Atualize o Cursor** para a versão mais recente
2. **Reinicie** o aplicativo
3. **Procure por** "AI", "Claude", "Model" nas configurações

### **Se a API Key não funcionar:**
1. **Verifique** se a chave está correta
2. **Configure** nas variáveis de ambiente:
   ```powershell
   $env:ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"
   ```
3. **Reinicie** o Cursor

### **Se ainda usar modelo automático:**
1. **Desative** completamente o auto-select
2. **Selecione** explicitamente Claude
3. **Salve** as configurações

## 💡 **Dicas:**

- ✅ **Claude 3.5 Sonnet** é o modelo mais avançado
- ✅ **Desative auto-select** para garantir uso do Claude
- ✅ **Configure API Key** se necessário
- ✅ **Reinicie** após mudanças

## 🎊 **Resultado Esperado:**

Após a configuração:
- ✅ Cursor usa **Claude** em vez de auto-select
- ✅ **Melhor qualidade** nas respostas
- ✅ **Suporte nativo** ao português
- ✅ **Análise mais precisa** de código

**Sua API do Claude será usada tanto no projeto quanto no próprio Cursor!** 🚀









