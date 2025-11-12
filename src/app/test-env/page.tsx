'use client'

export default function TestEnvPage() {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  const allNextPublicKeys = Object.keys(process.env)
    .filter(k => k.startsWith('NEXT_PUBLIC'))
    .map(key => ({
      key,
      value: process.env[key] ? `${process.env[key]?.substring(0, 30)}...` : 'undefined',
      exists: !!process.env[key]
    }))

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Teste de Variáveis de Ambiente</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_VAPID_PUBLIC_KEY</h2>
          <p className={vapidKey ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {vapidKey ? `✅ Configurada (${vapidKey.length} caracteres)` : '❌ Não encontrada'}
          </p>
          {vapidKey && (
            <p className="text-xs mt-2 font-mono break-all">
              {vapidKey.substring(0, 50)}...
            </p>
          )}
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_SUPABASE_URL</h2>
          <p className={supabaseUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {supabaseUrl ? `✅ Configurada` : '❌ Não encontrada'}
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_APP_URL</h2>
          <p className={appUrl ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {appUrl ? `✅ Configurada: ${appUrl}` : '❌ Não encontrada'}
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Todas as variáveis NEXT_PUBLIC_*</h2>
          <ul className="space-y-2 mt-2">
            {allNextPublicKeys.map(({ key, value, exists }) => (
              <li key={key} className="text-sm">
                <span className={exists ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {exists ? '✅' : '❌'}
                </span>
                {' '}
                <span className="font-mono">{key}</span>
                {exists && <span className="text-gray-600 dark:text-gray-400 ml-2">= {value}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold mb-2">💡 Informações</h3>
          <ul className="text-sm space-y-1">
            <li>• NODE_ENV: {process.env.NODE_ENV || 'undefined'}</li>
            <li>• Se VAPID Key não aparecer aqui, o problema está no carregamento do .env.local</li>
            <li>• Reinicie o servidor após alterar o .env.local</li>
          </ul>
        </div>
      </div>
    </div>
  )
}



