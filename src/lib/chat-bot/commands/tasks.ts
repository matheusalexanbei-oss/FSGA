import { BotResponse, ParsedCommand, ConfirmationData } from '../types'
import { getLocalDateString, parseLocalDate } from '@/lib/utils'
import { extractRelativeDate } from '../date-patterns'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

/**
 * Cria uma tarefa
 */
async function createTask(data: {
  user_id: string
  title: string
  description?: string | null
  due_date?: string | null
  due_time?: string | null
}): Promise<any> {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: data.user_id,
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      due_time: data.due_time || null,
      is_completed: false
    })
    .select()
    .single()
  
  if (error) throw error
  return task
}

/**
 * Handler para criação de tarefa
 */
export async function handleCreateTask(
  command: ParsedCommand,
  userId: string
): Promise<BotResponse> {
  const { title, description, date, time } = command.entities
  
  if (!title) {
    return {
      message: `❓ Não consegui identificar o nome da tarefa. Qual é a tarefa que você quer criar?\n\n💡 Exemplos:\n• Reunião amanhã às 7h\n• Comprar papel higiênico\n• Fazer o serviço do Amadeu sexta-feira`,
      type: 'question',
      requiresInput: true,
      suggestions: ['Reunião amanhã às 7h', 'Comprar papel higiênico', 'Fazer o serviço do Amadeu']
    }
  }
  
  // Extrair título do comando se não foi detectado
  let taskTitle = title
  if (!taskTitle) {
    // Remover palavras-chave e datas/horas
    let cleanCommand = command.raw
      .replace(/tarefa|lembrar|lembre|lembre-me|agendar|agenda|compromisso/i, '')
      .replace(/\b(?:amanhã|amanha|hoje|depois|amanhã|sexta|segunda|terça|quarta|quinta|sábado|domingo)\b/gi, '')
      .replace(/\b(?:às|as|as|h|horas?|hora)\s*\d+/gi, '')
      .replace(/\d{1,2}[h:]\d{0,2}/gi, '')
      .trim()
    
    if (cleanCommand.length > 0) {
      taskTitle = cleanCommand.split(/\s+/).filter(p => p.length > 0).join(' ')
    }
  }
  
  taskTitle = taskTitle || 'Nova tarefa'
  
  // Processar data
  let taskDate: string | null = null
  if (date) {
    taskDate = date
  } else {
    // Tentar extrair data relativa do comando
    const relativeDate = extractRelativeDate(command.raw)
    if (relativeDate) {
      taskDate = relativeDate.toISOString().split('T')[0]
    }
  }
  
  // Processar hora
  let taskTime: string | null = null
  if (time) {
    // Normalizar formato de hora (HH:MM)
    const timeMatch = time.match(/(\d{1,2})[h:](\d{0,2})/)
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0')
      const minutes = timeMatch[2] || '00'
      taskTime = `${hours}:${minutes.padStart(2, '0')}`
    } else {
      taskTime = time
    }
  } else {
    // Tentar extrair hora do comando (ex: "às 7h", "as 7 horas", "7h")
    const timePatterns = [
      /(?:às|as|as)\s*(\d{1,2})[h:]?(\d{0,2})?/i,
      /(\d{1,2})[h:](\d{0,2})/i,
      /(\d{1,2})\s*(?:horas?|h)/i
    ]
    
    for (const pattern of timePatterns) {
      const match = command.raw.match(pattern)
      if (match) {
        const hours = match[1].padStart(2, '0')
        const minutes = (match[2] || '00').padStart(2, '0')
        taskTime = `${hours}:${minutes}`
        break
      }
    }
  }
  
  // Extrair descrição se houver
  let taskDescription = description || null
  
  // Criar confirmação
  const confirmationData: ConfirmationData = {
    type: 'task',
    title: taskTitle,
    description: taskDescription,
    date: taskDate || getLocalDateString(),
    time: taskTime,
    action: 'create'
  }
  
  let confirmationMessage = `✅ Tarefa criada!\n\n`
  confirmationMessage += `📋 **${taskTitle}**\n`
  if (taskDate) {
    const dateObj = parseLocalDate(taskDate)
    const dateStr = dateObj.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    confirmationMessage += `📅 ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}\n`
  }
  if (taskTime) {
    confirmationMessage += `🕐 ${taskTime}\n`
  }
  if (taskDescription) {
    confirmationMessage += `📝 ${taskDescription}\n`
  }
  
  try {
    await createTask({
      user_id: userId,
      title: taskTitle,
      description: taskDescription,
      due_date: taskDate,
      due_time: taskTime
    })
    
    // Disparar evento customizado para atualizar a UI
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('task-created'))
    }
    
    return {
      message: confirmationMessage,
      type: 'success',
      requiresInput: false
    }
  } catch (error: any) {
    console.error('Erro ao criar tarefa:', error)
    return {
      message: `❌ Erro ao criar tarefa: ${error.message || 'Erro desconhecido'}`,
      type: 'error',
      requiresInput: false
    }
  }
}


