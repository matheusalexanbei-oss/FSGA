import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Sparkles } from "lucide-react";

const Chat = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chat IA</h1>
        <p className="text-muted-foreground mt-1">Consultas inteligentes sobre seu negócio</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Assistente IA</CardTitle>
              <p className="text-sm text-muted-foreground">Tire suas dúvidas sobre estoque e negócio</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-accent rounded-lg p-4 max-w-[80%]">
              <p className="text-sm text-foreground">
                Olá! Como posso ajudá-lo hoje? Posso responder perguntas sobre seus produtos, estoque, vendas e muito mais!
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="bg-primary text-primary-foreground rounded-lg p-4 max-w-[80%]">
              <p className="text-sm">
                Quanto tenho em estoque no total?
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-accent rounded-lg p-4 max-w-[80%]">
              <p className="text-sm text-foreground">
                Você possui 23 produtos em estoque, totalizando R$ 8.140,30. A categoria com mais produtos é Brincos com 11 itens.
              </p>
            </div>
          </div>
        </CardContent>

        <div className="p-4 border-t border-border">
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
      </Card>
    </div>
  );
};

export default Chat;



