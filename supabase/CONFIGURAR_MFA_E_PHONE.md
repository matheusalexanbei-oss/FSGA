# 🔐 Guia Completo: Configurar MFA e Phone no Supabase

## 📋 Visão Geral

No Supabase, há **duas seções diferentes** para autenticação:

1. **"Sign In / Providers"** - Métodos de login inicial (Email, Phone, OAuth, etc.)
2. **"Multi-Factor"** - Métodos de autenticação de segundo fator (TOTP, SMS MFA, etc.)

⚠️ **IMPORTANTE:** O TOTP não está em "Providers", mas sim na seção **"Multi-Factor"**!

---

## 🔑 Parte 1: Configurar TOTP (MFA)

### Onde Encontrar TOTP

O TOTP está na seção **"Multi-Factor"**, não em "Providers"!

### Passo a Passo:

1. **Acesse a seção Multi-Factor:**
   - No menu lateral, vá em **"Authentication"** → **"Multi-Factor"**
   - Ou acesse diretamente: `https://supabase.com/dashboard/project/[seu-project]/auth/mfa`

2. **Habilitar TOTP:**
   - Procure por **"TOTP"** ou **"Time-based One-Time Password"**
   - Ative a opção **"Enable TOTP"** ou **"Allow TOTP"**
   - Clique em **"Save"**

3. **Configurar no App:**
   - Os usuários precisarão usar um app autenticador (Google Authenticator, Authy, 1Password, etc.)
   - O app gera códigos de 6 dígitos que mudam a cada 30 segundos
   - Os usuários inserem o código após fazer login com email/senha

### Apps Autenticadores Compatíveis:
- ✅ Google Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ Microsoft Authenticator
- ✅ Qualquer app compatível com TOTP (RFC 6238)

---

## 📱 Parte 2: Configurar Phone (SMS) como Provider

### O que é Phone como Provider?

Phone como Provider permite que usuários façam login usando **SMS OTP** (código enviado por SMS) como método principal de autenticação, sem precisar de senha.

### Pré-requisitos:

⚠️ **IMPORTANTE:** Para usar Phone como Provider, você precisa configurar um provedor de SMS:

1. **Twilio** (Recomendado - mais popular)
2. **MessageBird**
3. **Vonage** (antigo Nexmo)
4. **Outros provedores compatíveis**

### Opção 1: Configurar com Twilio (Recomendado)

#### Passo 1: Criar Conta Twilio

1. Acesse [https://www.twilio.com](https://www.twilio.com)
2. Crie uma conta gratuita (ganha créditos para testar)
3. Anote suas credenciais:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (número Twilio para enviar SMS)

#### Passo 2: Configurar no Supabase

1. **Acesse "Sign In / Providers":**
   - No menu lateral, vá em **"Authentication"** → **"Sign In / Providers"**
   - Ou acesse: `https://supabase.com/dashboard/project/[seu-project]/auth/providers`

2. **Ativar Phone:**
   - Encontre **"Phone"** na lista de providers
   - Clique no provider **"Phone"**
   - Ative o toggle **"Enable Phone provider"**

3. **Configurar Twilio:**
   - Na seção de configuração do Phone, você verá campos para:
     - **Twilio Account SID**: Cole seu Account SID do Twilio
     - **Twilio Auth Token**: Cole seu Auth Token do Twilio
     - **Twilio Phone Number**: Cole o número do Twilio (formato: +1234567890)
   - Clique em **"Save"**

4. **Configurar Rate Limits (Opcional):**
   - Para evitar abuso, configure rate limits:
     - **SMS OTP Rate Limit**: Limite de SMS por hora/IP
     - **Verification Code Expiry**: Tempo de expiração do código (padrão: 60 segundos)

### Opção 2: Configurar com MessageBird

1. Crie uma conta no [MessageBird](https://www.messagebird.com)
2. Obtenha suas credenciais (API Key)
3. No Supabase, em "Phone" provider, configure:
   - **MessageBird API Key**: Sua chave da API
   - **MessageBird Originator**: Número ou nome do remetente

### Opção 3: Configurar com Vonage

1. Crie uma conta no [Vonage](https://www.vonage.com)
2. Obtenha suas credenciais (API Key e API Secret)
3. No Supabase, em "Phone" provider, configure:
   - **Vonage API Key**: Sua chave da API
   - **Vonage API Secret**: Seu secret da API

---

## 🔒 Parte 3: Configurar Phone como MFA (Segundo Fator)

### O que é Phone como MFA?

Phone como MFA é um **segundo fator de autenticação**. O usuário faz login com email/senha e depois recebe um código SMS como verificação adicional.

### Status Atual:

⚠️ **ATENÇÃO:** Atualmente, o Supabase pode não ter suporte nativo para **SMS MFA** (Phone como segundo fator). O MFA disponível é principalmente via **TOTP**.

### Verificar Disponibilidade:

1. Acesse **"Authentication"** → **"Multi-Factor"**
2. Verifique se há opção para **"SMS MFA"** ou **"Phone MFA"**
3. Se não houver, o Supabase ainda não suporta SMS como segundo fator

### Alternativa: Usar TOTP + Phone Provider

Se SMS MFA não estiver disponível, você pode:
1. ✅ Habilitar **TOTP** como MFA (disponível)
2. ✅ Habilitar **Phone** como Provider (disponível)
3. Os usuários podem escolher usar Phone como login principal OU usar Email + TOTP como MFA

---

## 🎯 Resolvendo o Warning "Insufficient MFA Options"

Para resolver o warning do Security Advisor, você precisa habilitar **pelo menos 2 opções de MFA**:

### Opção 1: TOTP (Recomendado - Mais Fácil)

1. Acesse **"Authentication"** → **"Multi-Factor"**
2. Ative **"TOTP"**
3. ✅ Isso já resolve o warning (TOTP conta como 1 opção)

### Opção 2: TOTP + Email MFA (Se disponível)

1. Acesse **"Authentication"** → **"Multi-Factor"**
2. Ative **"TOTP"**
3. Verifique se há opção para **"Email MFA"** e ative também
4. ✅ Isso resolve o warning (2 opções de MFA)

### Opção 3: TOTP + SMS MFA (Se disponível)

1. Acesse **"Authentication"** → **"Multi-Factor"**
2. Ative **"TOTP"**
3. Verifique se há opção para **"SMS MFA"** e ative também
4. ⚠️ **Nota:** SMS MFA requer configuração de Twilio/MessageBird (veja Parte 2)
5. ✅ Isso resolve o warning (2 opções de MFA)

---

## 📊 Diferença: Phone Provider vs Phone MFA

### Phone como Provider (Login Principal):
- ✅ Usuário faz login **apenas com número de telefone**
- ✅ Recebe código SMS
- ✅ Insere código e entra
- ✅ **Não precisa de senha**
- ⚠️ Requer configuração de Twilio/MessageBird
- 📍 Localização: **"Authentication"** → **"Sign In / Providers"** → **"Phone"**

### Phone como MFA (Segundo Fator):
- ✅ Usuário faz login com **email + senha**
- ✅ Depois recebe código SMS
- ✅ Insere código SMS para completar login
- ✅ **Adiciona camada extra de segurança**
- ⚠️ Pode não estar disponível no Supabase ainda
- 📍 Localização: **"Authentication"** → **"Multi-Factor"** → **"SMS MFA"** (se disponível)

---

## 🧪 Testar Configuração

### Testar TOTP:

1. **No App:**
   - Faça login com email/senha
   - Configure TOTP no app autenticador (escanear QR code)
   - Na próxima vez que fizer login, será solicitado o código TOTP

2. **Verificar:**
   - O código TOTP deve ser aceito
   - O login deve completar com sucesso

### Testar Phone Provider:

1. **No App:**
   - Tente fazer login com número de telefone
   - Deve receber código SMS
   - Insira o código e faça login

2. **Verificar:**
   - O código SMS deve ser enviado
   - O código deve ser aceito
   - O login deve completar com sucesso

---

## 💰 Custos

### TOTP:
- ✅ **GRATUITO** - Não há custos adicionais
- ✅ Não requer configuração externa
- ✅ Funciona offline (app autenticador)

### Phone Provider (SMS):
- ⚠️ **PAGO** - Custo por SMS enviado
- 💰 **Twilio:** ~$0.0075 por SMS (varia por país)
- 💰 **MessageBird:** ~$0.005 por SMS (varia por país)
- 💰 **Vonage:** ~$0.006 por SMS (varia por país)
- ⚠️ **Nota:** Custo varia por país e volume

---

## ✅ Checklist de Configuração

### Para Resolver Warning "Insufficient MFA Options":

- [ ] Acessar **"Authentication"** → **"Multi-Factor"**
- [ ] Ativar **"TOTP"** (obrigatório)
- [ ] Verificar se há **"Email MFA"** e ativar (opcional)
- [ ] Verificar se há **"SMS MFA"** e ativar (opcional, requer Twilio)
- [ ] Salvar configurações
- [ ] Verificar no Security Advisor se o warning desapareceu

### Para Configurar Phone como Provider (Opcional):

- [ ] Criar conta no Twilio/MessageBird/Vonage
- [ ] Obter credenciais (Account SID, Auth Token, etc.)
- [ ] Acessar **"Authentication"** → **"Sign In / Providers"**
- [ ] Ativar **"Phone"** provider
- [ ] Configurar credenciais do provedor SMS
- [ ] Configurar rate limits (recomendado)
- [ ] Salvar configurações
- [ ] Testar envio de SMS

---

## 🔗 Links Úteis

- [Supabase MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)
- [Supabase Phone Auth Documentation](https://supabase.com/docs/guides/auth/phone-login)
- [Twilio Documentation](https://www.twilio.com/docs)
- [MessageBird Documentation](https://developers.messagebird.com)
- [Vonage Documentation](https://developer.vonage.com)

---

## 🆘 Troubleshooting

### "TOTP não aparece na seção Multi-Factor"
- Verifique se você está na seção correta: **"Authentication"** → **"Multi-Factor"** (não "Providers")
- Atualize a página (F5)
- Verifique se seu projeto tem a versão mais recente do Supabase

### "Phone Provider não envia SMS"
- Verifique se as credenciais do Twilio/MessageBird estão corretas
- Verifique se você tem créditos no provedor SMS
- Verifique os logs do Supabase para erros
- Teste enviar SMS diretamente do Twilio/MessageBird

### "Warning 'Insufficient MFA Options' não desaparece"
- Certifique-se de que **TOTP** está ativado na seção **"Multi-Factor"**
- Aguarde alguns minutos para o Security Advisor atualizar
- Tente re-executar o advisor clicando em "Rerun linter"

---

## 🎉 Pronto!

Após configurar:

✅ **TOTP habilitado** como MFA  
✅ **Warning resolvido** (se TOTP contar como opção suficiente)  
✅ **Phone configurado** como Provider (se necessário)  
✅ **Sistema mais seguro** com autenticação de dois fatores

---

**Dúvidas?** Consulte a documentação do Supabase ou peça ajuda! 🚀

