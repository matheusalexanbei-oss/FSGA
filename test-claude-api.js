// Teste da API do Claude
const Anthropic = require('@anthropic-ai/sdk');

async function testClaudeAPI() {
  try {
    // Inicializar o cliente Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'sk-ant-sua-chave-aqui'
    });

    console.log('🤖 Testando API do Claude...');
    
    // Teste simples
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: "Olá! Você pode me ajudar com desenvolvimento de software?"
        }
      ]
    });

    console.log('✅ API funcionando!');
    console.log('📝 Resposta do Claude:', message.content[0].text);
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    console.log('💡 Verifique se:');
    console.log('   - A chave da API está correta');
    console.log('   - A variável de ambiente está configurada');
    console.log('   - Você tem créditos na conta Anthropic');
  }
}

testClaudeAPI();









