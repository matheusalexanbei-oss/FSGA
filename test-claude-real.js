// Teste da API do Claude real (com créditos pagos)
const Anthropic = require('@anthropic-ai/sdk');

async function testClaudeReal() {
  try {
    console.log('🤖 Testando Claude API com créditos...');
    
    // Verificar se a chave está configurada
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY não encontrada nas variáveis de ambiente');
      console.log('💡 Configure com: $env:ANTHROPIC_API_KEY="sk-ant-sua-chave-aqui"');
      return;
    }
    
    console.log('✅ Chave da API encontrada');
    
    // Inicializar cliente
    const anthropic = new Anthropic({
      apiKey: apiKey
    });
    
    console.log('🔄 Testando conexão...');
    
    // Teste básico
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Analise esta pergunta: 'Qual é o melhor smartphone para 2024?' e responda em português brasileiro."
        }
      ]
    });
    
    console.log('✅ Claude funcionando!');
    console.log('📝 Resposta:', message.content[0].text);
    console.log('💰 Tokens usados:', message.usage);
    
    // Teste de visão (se tivermos uma imagem)
    console.log('\n🔍 Testando Claude Vision...');
    console.log('💡 Para testar visão, use a interface web em /products/new?ai=true');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    
    if (error.message.includes('credit balance')) {
      console.log('💰 Problema: Saldo de créditos insuficiente');
      console.log('💡 Solução: Adicione créditos em https://console.anthropic.com/');
    } else if (error.message.includes('API key')) {
      console.log('🔑 Problema: Chave da API inválida');
      console.log('💡 Solução: Verifique se a chave está correta');
    } else {
      console.log('🔧 Problema: Erro desconhecido');
      console.log('💡 Solução: Verifique a conexão com a internet');
    }
  }
}

testClaudeReal();



