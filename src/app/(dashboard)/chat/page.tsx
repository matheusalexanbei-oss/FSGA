'use client'

import { PageWrapper } from '@/components/layout/PageWrapper'
import { AnimatedCard } from '@/components/shared/AnimatedCard'
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ChatPage() {
  return (
    <PageWrapper>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Chat IA</h1>
          <p className="text-muted-foreground">
            Consultas inteligentes sobre seu negócio
          </p>
        </div>

        <AnimatedCard className="h-[600px] flex flex-col" delay={0.1}>
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Assistente IA</CardTitle>
                <CardDescription>Tire suas dúvidas sobre estoque e negócio</CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-accent rounded-lg p-4 max-w-[80%]">
                <p className="text-sm">
                  Olá! Como posso ajudá-lo hoje? Posso responder perguntas sobre seus produtos, estoque, vendas e muito mais!
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-end"
            >
              <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-[80%]">
                <p className="text-sm">
                  Quanto tenho em estoque no total?
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-accent rounded-lg p-4 max-w-[80%]">
                <p className="text-sm">
                  Você possui 23 produtos em estoque, totalizando R$ 8.140,30. A categoria com mais produtos é Brincos com 11 itens.
                </p>
              </div>
            </motion.div>
          </CardContent>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input 
                placeholder="Digite sua pergunta..." 
                className="flex-1"
              />
              <Button size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by IA - Pergunte sobre estoque, vendas, produtos e mais
            </p>
          </div>
        </AnimatedCard>
      </div>
    </PageWrapper>
  )
}




