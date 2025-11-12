# Como Limpar Cache do Next.js

Execute estes comandos no terminal para limpar o cache e garantir que as bibliotecas sejam carregadas corretamente:

```bash
# Parar o servidor (Ctrl+C)

# Limpar cache do Next.js
rm -rf .next
# ou no Windows:
Remove-Item -Recurse -Force .next

# Limpar node_modules e reinstalar (opcional, se ainda houver problemas)
npm install

# Reiniciar servidor
npm run dev
```

Após limpar o cache, tente exportar novamente.

