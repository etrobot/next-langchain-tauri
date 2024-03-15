'use client'
import { nanoid } from '../lib/utils';
import { useChat, type Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
// import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Agents from '@/components/agents'
export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
}

export function Chat({ id, className }: ChatProps) {
  const timestamp = `${new Date().toISOString().split('.')[0]}`
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  useEffect(() => {
    setInitialMessages([]);
    if (id) {
      const storedData = localStorage.getItem(id);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setInitialMessages(parsedData);
      }
    } else {
      id = `cid_${timestamp}`;
    }
  }, [id]);
  const [previewToken, setPreviewToken] = useLocalStorage<{
    llm_api_key: string;
    llm_model: string;
    llm_base_url: string;
    tavilyserp_api_key: string;
    bing_api_key: string;
  } | null>('ai-token', null);

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: process.env.NEXT_PUBLIC_API_URL + '/api/chat',
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        locale: navigator.language,
      },
      onResponse(response) {
        if (response.status !== 200) {
          toast.error(`${response.status} ${response.statusText}`)
        }
      },
      onFinish(response) {
        const msg = initialMessages ?? [];
        msg.push({
          id: nanoid(),
          role: 'assistant',
          content: response.content
        })
        localStorage.setItem(id||`cid_${timestamp}`, JSON.stringify(msg));
        useRouter().replace(`/?cid=${id}`);
      }
    })

  useEffect(() => {
    stop();
    const token = localStorage.getItem('ai-token')
    if (token) {
      setPreviewToken(JSON.parse(token))
    }
    else { toast.error('Please set the API keys'); }
  }, []);
  return (
    <>
      <div className={cn('pb-[200px] md:pt-2', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <>
            <Agents setInput={setInput} />
          </>
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        setMessages={setInitialMessages}
        input={input}
        setInput={setInput}
      />

    </>
  )
}
