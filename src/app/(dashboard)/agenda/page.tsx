'use client'

import { useState, useEffect } from 'react'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Calendar, Clock, MoreVertical, Edit, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { useHybridAuth } from '@/hooks/useHybridAuth'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  due_time: string | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export default function AgendaPage() {
  const { user } = useHybridAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: ''
  })

  // Carregar tarefas
  const loadTasks = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('due_time', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao carregar tarefas:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        
        // Verificar se é erro de tabela não encontrada
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('table')) {
          toast.error('Tabela de tarefas não encontrada. Por favor, execute a migration no Supabase.', {
            duration: 10000,
            action: {
              label: 'Ver Migrations',
              onClick: () => {
                window.open('https://supabase.com/dashboard/project/_/sql', '_blank')
              }
            }
          })
          console.error('💡 Execute a migration: supabase/migrations/20250119000001_add_tasks_table.sql')
        } else {
          toast.error(`Erro ao carregar tarefas: ${error.message || 'Erro desconhecido'}`)
        }
        return
      }
      
      setTasks((data || []) as Task[])
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; details?: string; hint?: string; code?: string }
      console.error('Erro ao carregar tarefas:', {
        message: supabaseError?.message,
        details: supabaseError?.details,
        hint: supabaseError?.hint,
        code: supabaseError?.code,
        error
      })
      
      // Verificar se é erro de tabela não encontrada
      if (supabaseError?.code === '42P01' || supabaseError?.message?.includes('does not exist') || supabaseError?.message?.includes('relation') || supabaseError?.message?.includes('table')) {
        toast.error('Tabela de tarefas não encontrada. Por favor, execute a migration no Supabase.', {
          duration: 10000,
          action: {
            label: 'Ver Migrations',
            onClick: () => {
              window.open('https://supabase.com/dashboard/project/_/sql', '_blank')
            }
          }
        })
        console.error('💡 Execute a migration: supabase/migrations/20250119000001_add_tasks_table.sql')
      } else {
        toast.error(`Erro ao carregar tarefas: ${supabaseError?.message || 'Erro desconhecido'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [user?.id])

  // Desativar modo bulk quando não houver tarefas selecionadas
  useEffect(() => {
    if (isBulkMode && selectedTasks.length === 0) {
      setIsBulkMode(false)
    }
  }, [selectedTasks.length, isBulkMode])

  // Escutar eventos de criação de tarefa
  useEffect(() => {
    const handleTaskCreated = () => {
      loadTasks()
    }

    window.addEventListener('task-created', handleTaskCreated)
    return () => {
      window.removeEventListener('task-created', handleTaskCreated)
    }
  }, [user?.id])

  // Criar/editar tarefa
  const handleSaveTask = async () => {
    if (!user?.id || !taskForm.title.trim()) {
      toast.error('Título da tarefa é obrigatório')
      return
    }

    try {
      const supabase = createClient()
      
      if (editingTask) {
        // Editar tarefa existente
        const { error } = await supabase
          .from('tasks')
          .update({
            title: taskForm.title.trim(),
            description: taskForm.description.trim() || null,
            due_date: taskForm.due_date || null,
            due_time: taskForm.due_time || null
          })
          .eq('id', editingTask.id)

        if (error) throw error
        toast.success('Tarefa atualizada com sucesso!')
      } else {
        // Criar nova tarefa
        const { error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: taskForm.title.trim(),
            description: taskForm.description.trim() || null,
            due_date: taskForm.due_date || null,
            due_time: taskForm.due_time || null,
            is_completed: false
          })

        if (error) throw error
        toast.success('Tarefa criada com sucesso!')
      }

      setIsTaskModalOpen(false)
      setEditingTask(null)
      setTaskForm({ title: '', description: '', due_date: '', due_time: '' })
      loadTasks()
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; details?: string; hint?: string; code?: string }
      console.error('Erro ao salvar tarefa:', {
        message: supabaseError?.message,
        details: supabaseError?.details,
        hint: supabaseError?.hint,
        code: supabaseError?.code,
        error
      })
      
      // Verificar se é erro de tabela não encontrada
      if (supabaseError?.code === '42P01' || supabaseError?.message?.includes('does not exist') || supabaseError?.message?.includes('relation') || supabaseError?.message?.includes('table')) {
        toast.error('Tabela de tarefas não encontrada. Por favor, execute a migration no Supabase.', {
          duration: 10000,
          action: {
            label: 'Ver Migrations',
            onClick: () => {
              window.open('https://supabase.com/dashboard/project/_/sql', '_blank')
            }
          }
        })
      } else {
        toast.error(`Erro ao salvar tarefa: ${supabaseError?.message || 'Erro desconhecido'}`)
      }
    }
  }

  // Marcar tarefa como completa/incompleta
  const handleToggleComplete = async (taskId: string, isCompleted: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: !isCompleted,
          completed_at: !isCompleted ? new Date().toISOString() : null
        })
        .eq('id', taskId)

      if (error) throw error
      
      // Remover da seleção se estava selecionada
      setSelectedTasks(prev => prev.filter(id => id !== taskId))
      
      // Se estava em modo bulk e não há mais tarefas selecionadas, sair do modo bulk
      if (isBulkMode && selectedTasks.length <= 1) {
        setIsBulkMode(false)
      }
      
      loadTasks()
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; details?: string; code?: string }
      console.error('Erro ao atualizar tarefa:', {
        message: supabaseError?.message,
        details: supabaseError?.details,
        code: supabaseError?.code,
        error
      })
      toast.error(`Erro ao atualizar tarefa: ${supabaseError?.message || 'Erro desconhecido'}`)
    }
  }

  // Excluir tarefa
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      toast.success('Tarefa excluída com sucesso!')
      loadTasks()
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; details?: string; code?: string }
      console.error('Erro ao excluir tarefa:', {
        message: supabaseError?.message,
        details: supabaseError?.details,
        code: supabaseError?.code,
        error
      })
      toast.error(`Erro ao excluir tarefa: ${supabaseError?.message || 'Erro desconhecido'}`)
    }
  }

  // Ações em massa
  const handleBulkComplete = async () => {
    if (selectedTasks.length === 0) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .in('id', selectedTasks)

      if (error) throw error
      toast.success(`${selectedTasks.length} tarefa(s) marcada(s) como concluída(s)!`)
      setSelectedTasks([])
      setIsBulkMode(false)
      loadTasks()
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; details?: string; code?: string }
      console.error('Erro ao marcar tarefas:', {
        message: supabaseError?.message,
        details: supabaseError?.details,
        code: supabaseError?.code,
        error
      })
      toast.error(`Erro ao marcar tarefas: ${supabaseError?.message || 'Erro desconhecido'}`)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return
    if (!confirm(`Tem certeza que deseja excluir ${selectedTasks.length} tarefa(s)?`)) return

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', selectedTasks)

      if (error) throw error
      toast.success(`${selectedTasks.length} tarefa(s) excluída(s)!`)
      setSelectedTasks([])
      setIsBulkMode(false)
      loadTasks()
    } catch (error: unknown) {
      const supabaseError = error as { message?: string; details?: string; code?: string }
      console.error('Erro ao excluir tarefas:', {
        message: supabaseError?.message,
        details: supabaseError?.details,
        code: supabaseError?.code,
        error
      })
      toast.error(`Erro ao excluir tarefas: ${supabaseError?.message || 'Erro desconhecido'}`)
    }
  }

  // Abrir modal de edição
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setTaskForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      due_time: task.due_time || ''
    })
    setIsTaskModalOpen(true)
  }

  // Formatar data
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  // Filtrar tarefas
  const pendingTasks = tasks.filter(t => !t.is_completed)
  const completedTasks = tasks.filter(t => t.is_completed)

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Agenda
            </h1>
            <p className="text-muted-foreground text-lg">
              Gerencie suas tarefas e compromissos
            </p>
          </div>
          <div className="flex gap-2">
            {isBulkMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleBulkComplete}
                  disabled={selectedTasks.length === 0}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Marcar como concluída
                  {selectedTasks.length > 0 && (
                    <span className="ml-1 text-xs">({selectedTasks.length})</span>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={selectedTasks.length === 0}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                  {selectedTasks.length > 0 && (
                    <span className="ml-1 text-xs">({selectedTasks.length})</span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsBulkMode(false)
                    setSelectedTasks([])
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    console.log('🔘 Botão Selecionar clicado, ativando modo bulk')
                    setIsBulkMode(true)
                    setSelectedTasks([]) // Limpar seleção ao entrar no modo bulk
                  }}
                >
                  Selecionar
                </Button>
                <Button
                  onClick={() => {
                    setEditingTask(null)
                    setTaskForm({ title: '', description: '', due_date: '', due_time: '' })
                    setIsTaskModalOpen(true)
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova Tarefa
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Lista de Tarefas Pendentes */}
        <AnimatedCard delay={0.1}>
          <CardHeader>
            <CardTitle>Tarefas Pendentes</CardTitle>
            <CardDescription>
              {pendingTasks.length} tarefa(s) pendente(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                ))}
              </div>
            ) : pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma tarefa pendente
              </div>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors bg-card cursor-pointer group"
                    onClick={(e) => {
                      // Sempre permitir seleção clicando em qualquer lugar
                      const target = e.target as HTMLElement
                      // Não selecionar se clicar em botão ou checkbox diretamente
                      if (target.closest('button, [role="checkbox"]')) {
                        return
                      }
                      
                      // Se não estiver em modo bulk, ativar modo bulk e selecionar
                      if (!isBulkMode) {
                        setIsBulkMode(true)
                        setSelectedTasks([task.id])
                      } else {
                        // Se já estiver em modo bulk, alternar seleção
                        const isSelected = selectedTasks.includes(task.id)
                        const newSelection = isSelected 
                          ? selectedTasks.filter(id => id !== task.id)
                          : [...selectedTasks, task.id]
                        setSelectedTasks(newSelection)
                      }
                    }}
                  >
                    {isBulkMode ? (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => {
                            console.log('🔘 Checkbox clicado:', { taskId: task.id, checked, currentSelected: selectedTasks })
                            setSelectedTasks(prev => {
                              const isSelected = prev.includes(task.id)
                              if (checked === true && !isSelected) {
                                console.log('✅ Adicionando tarefa à seleção')
                                return [...prev, task.id]
                              } else if (checked === false && isSelected) {
                                console.log('❌ Removendo tarefa da seleção')
                                const newSelection = prev.filter(id => id !== task.id)
                                return newSelection
                              }
                              return prev
                            })
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleComplete(task.id, task.is_completed)
                        }}
                        className="flex-shrink-0"
                        type="button"
                        aria-label={task.is_completed ? "Desmarcar como concluída" : "Marcar como concluída"}
                      >
                        <Circle className="h-5 w-5 text-gray-400 hover:text-primary transition-colors" />
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.due_date)}
                          </div>
                        )}
                        {task.due_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.due_time}
                          </div>
                        )}
                      </div>
                    </div>
                    {!isBulkMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleToggleComplete(task.id, task.is_completed)}
                          >
                            {task.is_completed ? (
                              <>
                                <Circle className="h-4 w-4 mr-2" />
                                Reverter para pendente
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar como concluída
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </AnimatedCard>

        {/* Lista de Tarefas Concluídas */}
        {completedTasks.length > 0 && (
          <AnimatedCard delay={0.2}>
            <CardHeader>
              <CardTitle>Tarefas Concluídas</CardTitle>
              <CardDescription>
                {completedTasks.length} tarefa(s) concluída(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors bg-card opacity-75 cursor-pointer group"
                    onClick={(e) => {
                      // Sempre permitir seleção clicando em qualquer lugar
                      const target = e.target as HTMLElement
                      // Não selecionar se clicar em botão ou checkbox diretamente
                      if (target.closest('button, [role="checkbox"]')) {
                        return
                      }
                      
                      // Se não estiver em modo bulk, ativar modo bulk e selecionar
                      if (!isBulkMode) {
                        setIsBulkMode(true)
                        setSelectedTasks([task.id])
                      } else {
                        // Se já estiver em modo bulk, alternar seleção
                        const isSelected = selectedTasks.includes(task.id)
                        const newSelection = isSelected 
                          ? selectedTasks.filter(id => id !== task.id)
                          : [...selectedTasks, task.id]
                        setSelectedTasks(newSelection)
                      }
                    }}
                  >
                    {isBulkMode ? (
                      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedTasks.includes(task.id)}
                          onCheckedChange={(checked) => {
                            console.log('🔘 Checkbox clicado (concluída):', { taskId: task.id, checked, currentSelected: selectedTasks })
                            setSelectedTasks(prev => {
                              const isSelected = prev.includes(task.id)
                              if (checked === true && !isSelected) {
                                console.log('✅ Adicionando tarefa concluída à seleção')
                                return [...prev, task.id]
                              } else if (checked === false && isSelected) {
                                console.log('❌ Removendo tarefa concluída da seleção')
                                const newSelection = prev.filter(id => id !== task.id)
                                return newSelection
                              }
                              return prev
                            })
                          }}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleComplete(task.id, task.is_completed)
                        }}
                        className="flex-shrink-0"
                        type="button"
                        aria-label="Desmarcar como concluída"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors" />
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground line-through">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-through">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {!isBulkMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleToggleComplete(task.id, task.is_completed)}
                          >
                            {task.is_completed ? (
                              <>
                                <Circle className="h-4 w-4 mr-2" />
                                Reverter para pendente
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Marcar como concluída
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </AnimatedCard>
        )}

        {/* Modal de Criar/Editar Tarefa */}
        <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
          <DialogContent className="max-w-2xl bg-card dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
              <DialogDescription>
                {editingTask ? 'Edite os detalhes da tarefa' : 'Crie uma nova tarefa'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="Ex: Reunião com cliente"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Detalhes adicionais sobre a tarefa..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="due_date">Data</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="due_time">Hora</Label>
                  <Input
                    id="due_time"
                    type="time"
                    value={taskForm.due_time}
                    onChange={(e) => setTaskForm({ ...taskForm, due_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTaskModalOpen(false)
                    setEditingTask(null)
                    setTaskForm({ title: '', description: '', due_date: '', due_time: '' })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveTask}>
                  {editingTask ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  )
}

