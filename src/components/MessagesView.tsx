import React, { useState } from 'react';
import { Search, Phone, Video, Info, Send, Smile, Plus, BookOpen, CheckCheck } from 'lucide-react';
import { UserAccount } from '../types';

interface MessagesViewProps {
  currentUser: UserAccount;
  onOpenIntent: (id: string) => void;
}

export function MessagesView({ currentUser, onOpenIntent }: MessagesViewProps) {
  const [activeContact, setActiveContact] = useState('ana');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ana',
      text: 'Oi! Vi que você também está participando do desafio de leitura deste mês.',
      time: '09:41',
    },
    {
      id: '2',
      sender: 'ana',
      isIntentCard: true,
      intentData: {
        id: 'reading-12',
        title: 'Ler 12 Livros em 2026',
        progress: 25,
        target: '3/12',
      },
      text: 'Olha essa Intent que eu acabei de criar para acompanharmos:',
      time: '09:43',
    },
    {
      id: '3',
      sender: 'me',
      text: 'Que incrível! Vou acompanhar agora mesmo. Já terminei dois livros esse mês.',
      time: '09:45',
    }
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages([
      ...messages,
      {
        id: String(Date.now()),
        sender: 'me',
        text: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setInputMessage('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-[#e4e2de] h-[82vh] flex overflow-hidden antialiased font-sans my-2">
      {/* Conversations List (Left Column) */}
      <section className="w-full sm:w-80 border-r border-[#e4e2de] bg-white flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-[#e4e2de] space-y-3">
          <h2 className="text-xl font-black text-[#000666]">Mensagens</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" />
            <input
              type="text"
              placeholder="Buscar conversas..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f5f3ef] text-xs outline-none focus:ring-1 focus:ring-[#000666] border border-transparent focus:border-[#000666]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#f5f3ef]">
          {/* Conversation 1 (Active) */}
          <div
            onClick={() => setActiveContact('ana')}
            className={`flex items-center gap-3 p-4 border-l-4 cursor-pointer transition-colors ${
              activeContact === 'ana'
                ? 'border-[#000666] bg-[#f5f3ef]'
                : 'border-transparent hover:bg-[#fbf9f5]'
            }`}
          >
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Ana Costa"
                className="w-12 h-12 rounded-full object-cover shadow-xs border border-[#e4e2de]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#006a62] rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-xs font-bold text-[#1b1c1a] truncate">Ana Costa</h3>
                <span className="text-[10px] text-[#666666]">Agora</span>
              </div>
              <p className="text-xs text-[#454652] truncate">Olha essa Intent que eu acabei de...</p>
            </div>
          </div>

          {/* Conversation 2 */}
          <div
            onClick={() => setActiveContact('carlos')}
            className={`flex items-center gap-3 p-4 border-l-4 cursor-pointer transition-colors ${
              activeContact === 'carlos'
                ? 'border-[#000666] bg-[#f5f3ef]'
                : 'border-transparent hover:bg-[#fbf9f5]'
            }`}
          >
            <div className="relative shrink-0">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="Carlos Silva"
                className="w-12 h-12 rounded-full object-cover shadow-xs border border-[#e4e2de]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="text-xs font-bold text-[#1b1c1a] truncate">Carlos Silva</h3>
                <span className="text-[10px] text-[#666666]">2h</span>
              </div>
              <p className="text-xs text-[#454652] truncate">Você acha que conseguimos bater a meta?</p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Chat (Right Column) */}
      <section className="flex-1 flex flex-col bg-[#fbf9f5] h-full overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-[#e4e2de] shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Ana Costa"
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xs font-bold text-[#1b1c1a]">Ana Costa</h3>
              <span className="text-[10px] text-[#006a62] font-semibold">Online agora</span>
            </div>
          </div>

          <div className="flex gap-1 text-[#454652]">
            <button className="p-2 hover:bg-[#f5f3ef] rounded-full transition-colors cursor-pointer">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#f5f3ef] rounded-full transition-colors cursor-pointer">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-[#f5f3ef] rounded-full transition-colors cursor-pointer">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="text-center">
            <span className="text-[10px] font-bold text-[#666666] bg-[#eae8e4] px-3 py-1 rounded-full">
              Hoje
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {!isMe && (
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Ana"
                    className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto"
                  />
                )}

                <div
                  className={`p-4 rounded-2xl text-xs space-y-2 ${
                    isMe
                      ? 'bg-[#000666] text-white rounded-br-none shadow-xs'
                      : 'bg-white text-[#1b1c1a] rounded-bl-none shadow-xs border border-[#e4e2de]'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {/* Shared Intent Card inside message */}
                  {msg.isIntentCard && msg.intentData && (
                    <div className="bg-[#fbf9f5] border border-[#e4e2de] rounded-xl p-3 text-[#1b1c1a] space-y-2 mt-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#000666]" />
                        <span className="font-bold text-xs">{msg.intentData.title}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="w-full bg-[#E0F2F1] rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#006a62] h-full rounded-full"
                            style={{ width: `${msg.intentData.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-[#666666]">
                          <span>Progresso: {msg.intentData.target}</span>
                          <span>{msg.intentData.progress}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenIntent(msg.intentData!.id)}
                        className="w-full py-1.5 bg-white hover:bg-[#000666] hover:text-white border border-[#000666] text-[#000666] rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Acompanhar Intent
                      </button>
                    </div>
                  )}

                  <div className={`text-[9px] text-right flex items-center justify-end gap-1 ${isMe ? 'text-white/70' : 'text-[#666666]'}`}>
                    <span>{msg.time}</span>
                    {isMe && <CheckCheck className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#e4e2de] flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="p-2 hover:bg-[#f5f3ef] rounded-full text-[#454652] transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>

          <div className="flex-1 bg-[#f5f3ef] rounded-2xl px-4 py-2 flex items-center gap-2 border border-transparent focus-within:border-[#000666]">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="w-full bg-transparent text-xs text-[#1b1c1a] outline-none"
            />
            <button type="button" className="text-[#666666] hover:text-[#000666]">
              <Smile className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            className="p-2.5 bg-[#000666] hover:bg-[#1a237e] text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </section>
    </div>
  );
}
