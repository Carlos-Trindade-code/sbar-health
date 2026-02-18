import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Send,
  Users,
  MessageSquare,
  AtSign,
  Paperclip,
  Image,
  Smile,
  MoreVertical,
  Pin,
  Reply,
  Trash2,
  Bell,
  BellOff,
  Search,
  Hash,
  Lock,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  author: string;
  authorInitials: string;
  authorColor: string;
  content: string;
  timestamp: string;
  isOwn?: boolean;
  isPinned?: boolean;
  replyTo?: { author: string; content: string };
  mentions?: string[];
  patientRef?: { id: number; name: string; bed: string };
}

interface Channel {
  id: string;
  name: string;
  type: 'general' | 'patient' | 'shift';
  unread: number;
  lastMessage?: string;
}

// Mock data
const mockChannels: Channel[] = [
  { id: 'general', name: 'Geral', type: 'general', unread: 3, lastMessage: 'Bom dia equipe!' },
  { id: 'plantao', name: 'Plantão', type: 'shift', unread: 0, lastMessage: 'Passagem às 19h' },
  { id: 'uti', name: 'UTI - Discussões', type: 'patient', unread: 5, lastMessage: 'Paciente leito 3...' },
  { id: 'enfermaria', name: 'Enfermaria', type: 'patient', unread: 1, lastMessage: 'Alta prevista...' },
];

const mockMessages: Message[] = [
  {
    id: 1,
    author: 'Dr. Carlos Mendes',
    authorInitials: 'CM',
    authorColor: 'bg-blue-500',
    content: 'Bom dia equipe! Vamos discutir os casos críticos de hoje.',
    timestamp: '08:30',
    isPinned: true
  },
  {
    id: 2,
    author: 'Dra. Ana Paula',
    authorInitials: 'AP',
    authorColor: 'bg-purple-500',
    content: 'Paciente do leito UTI-01 apresentou melhora significativa. Podemos considerar desmame de sedação.',
    timestamp: '08:45',
    patientRef: { id: 1, name: 'Maria Silva', bed: 'UTI-01' }
  },
  {
    id: 3,
    author: 'Dr. Roberto Lima',
    authorInitials: 'RL',
    authorColor: 'bg-green-500',
    content: '@Carlos concordo com a avaliação. Vou passar para ver o paciente às 10h.',
    timestamp: '09:00',
    mentions: ['Carlos'],
    replyTo: { author: 'Dra. Ana Paula', content: 'Paciente do leito UTI-01...' }
  },
  {
    id: 4,
    author: 'Você',
    authorInitials: 'EU',
    authorColor: 'bg-primary',
    content: 'Perfeito! Vou preparar a documentação para a passagem de plantão.',
    timestamp: '09:15',
    isOwn: true
  },
  {
    id: 5,
    author: 'Dra. Fernanda Costa',
    authorInitials: 'FC',
    authorColor: 'bg-amber-500',
    content: 'Lembrete: reunião de equipe às 14h para discutir protocolos.',
    timestamp: '09:30',
    isPinned: true
  }
];

const mockTeamMembers = [
  { id: 1, name: 'Dr. Carlos Mendes', initials: 'CM', color: 'bg-blue-500', status: 'online' },
  { id: 2, name: 'Dra. Ana Paula', initials: 'AP', color: 'bg-purple-500', status: 'online' },
  { id: 3, name: 'Dr. Roberto Lima', initials: 'RL', color: 'bg-green-500', status: 'away' },
  { id: 4, name: 'Dra. Fernanda Costa', initials: 'FC', color: 'bg-amber-500', status: 'offline' },
  { id: 5, name: 'Dr. João Pedro', initials: 'JP', color: 'bg-red-500', status: 'online' },
];

interface TeamChatProps {
  isDemo?: boolean;
  teamId?: number;
}

export default function TeamChat({ isDemo = false, teamId }: TeamChatProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [showMembers, setShowMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: messages.length + 1,
      author: 'Você',
      authorInitials: 'EU',
      authorColor: 'bg-primary',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');
    
    if (isDemo) {
      // Simulate response after 2 seconds
      setTimeout(() => {
        const responses = [
          { author: 'Dr. Carlos Mendes', initials: 'CM', color: 'bg-blue-500', content: 'Entendido! Vou verificar.' },
          { author: 'Dra. Ana Paula', initials: 'AP', color: 'bg-purple-500', content: 'Perfeito, obrigada pela atualização.' },
          { author: 'Dr. Roberto Lima', initials: 'RL', color: 'bg-green-500', content: '👍 Combinado!' },
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          author: randomResponse.author,
          authorInitials: randomResponse.initials,
          authorColor: randomResponse.color,
          content: randomResponse.content,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Notificações ativadas' : 'Notificações silenciadas');
  };

  const pinnedMessages = messages.filter(m => m.isPinned);

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Chat da Equipe</CardTitle>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                  <Lock className="w-3 h-3" />
                  Privado
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {mockTeamMembers.filter(m => m.status === 'online').length} membros online • Hospital NÃO tem acesso
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleMute}
            >
              {isMuted ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowMembers(!showMembers)}
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* Channels Sidebar */}
        <div className="w-48 border-r bg-muted/30 p-2 hidden md:block">
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                className="pl-8 h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-1">
            {mockChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                  activeChannel === channel.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <Hash className="w-4 h-4" />
                <span className="flex-1 text-left truncate">{channel.name}</span>
                {channel.unread > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {channel.unread}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div className="p-2 bg-amber-50 border-b">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <Pin className="w-3 h-3" />
                <span className="font-medium">Fixado:</span>
                <span className="truncate">{pinnedMessages[0].content}</span>
              </div>
            </div>
          )}

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={message.authorColor}>
                        {message.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`max-w-[70%] ${message.isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {!message.isOwn && (
                          <span className="text-sm font-medium">{message.author}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        {message.isPinned && <Pin className="w-3 h-3 text-amber-500" />}
                      </div>
                      
                      {message.replyTo && (
                        <div className="text-xs bg-muted p-2 rounded mb-1 text-left">
                          <span className="font-medium">{message.replyTo.author}:</span>
                          <span className="text-muted-foreground ml-1">{message.replyTo.content}</span>
                        </div>
                      )}
                      
                      <div className={`p-3 rounded-lg ${
                        message.isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {message.patientRef && (
                          <div className="mt-2 p-2 bg-white/20 rounded text-xs">
                            <span className="font-medium">📋 {message.patientRef.name}</span>
                            <span className="ml-2 opacity-75">Leito: {message.patientRef.bed}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 border-t bg-background">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Image className="w-4 h-4" />
              </Button>
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <AtSign className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <Smile className="w-4 h-4" />
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Members Sidebar */}
        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l bg-muted/30 overflow-hidden"
            >
              <div className="p-3">
                <h4 className="font-medium text-sm mb-3">Membros da Equipe</h4>
                <div className="space-y-2">
                  {mockTeamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-2">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className={member.color}>
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-green-500' :
                          member.status === 'away' ? 'bg-amber-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
