# 🧹 LIMPEZA DE COOKIES CORROMPIDOS

## **🚨 PROBLEMA IDENTIFICADO:**

O erro `Failed to parse cookie string: SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON` indica que os **cookies de autenticação estão corrompidos**.

## **✅ SOLUÇÃO:**

### **1. Execute este JavaScript no Console (F12):**

```javascript
// Limpar todos os dados de autenticação
console.log('🧹 Limpando dados de autenticação...')

// Limpar localStorage
localStorage.clear()
console.log('✅ localStorage limpo')

// Limpar sessionStorage
sessionStorage.clear()
console.log('✅ sessionStorage limpo')

// Limpar todos os cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('✅ Cookies limpos')

// Limpar cache do navegador
if ('caches' in window) {
  caches.keys().then(function(names) {
    for (let name of names) {
      caches.delete(name);
    }
  });
  console.log('✅ Cache limpo')
}

console.log('🎉 Limpeza completa! Recarregando página...')

// Recarregar a página
setTimeout(() => {
  location.reload()
}, 1000)
```

### **2. Após a limpeza:**

1. **Faça login novamente**
2. **Acesse:** `http://localhost:3000/products/new`
3. **Teste a criação de categoria**

## **🔍 LOGS ESPERADOS APÓS LIMPEZA:**

### **✅ SUCESSO:**
```
🧹 Limpando dados de autenticação...
✅ localStorage limpo
✅ sessionStorage limpo
✅ Cookies limpos
✅ Cache limpo
🎉 Limpeza completa! Recarregando página...
```

### **✅ APÓS LOGIN:**
```
🔍 Testando conexão com tabela categories...
✅ Usuário autenticado para carregar categorias: [ID]
📊 Resultado do select: {data: [], error: null}
✅ Categorias carregadas: 0
```

## **🚨 SE AINDA DER ERRO:**

### **Verificar RLS Policies:**
```sql
-- Execute no Supabase SQL Editor
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'categories';
```

### **Verificar Tabela Categories:**
```sql
-- Execute no Supabase SQL Editor
SELECT * FROM categories LIMIT 5;
```

---

**Execute o script de limpeza e teste novamente!** 🚀

