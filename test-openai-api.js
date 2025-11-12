// Teste da API do OpenAI (alternativa mais barata)
const OpenAI = require('openai');

async function testOpenAI() {
  try {
    // Inicializar o cliente OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-sua-chave-openai-aqui'
    });

    console.log('🤖 Testando API do OpenAI...');
    
    // Teste simples
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo mais barato
      messages: [
        {
          role: "user",
          content: "Olá! Você pode me ajudar com reconhecimento de imagens de produtos?"
        }
      ],
      max_tokens: 100
    });

    console.log('✅ API funcionando!');
    console.log('📝 Resposta do OpenAI:', response.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
    console.log('💡 Verifique se:');
    console.log('   - A chave da API está correta');
    console.log('   - Você tem créditos na conta OpenAI');
    console.log('   - A variável OPENAI_API_KEY está configurada');
  }
}

testOpenAI();









