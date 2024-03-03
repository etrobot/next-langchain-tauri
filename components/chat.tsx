'use client'
import { nanoid } from '../lib/utils';
import { useChat, type Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState,useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'

export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
}

export function Chat({ id, className }: ChatProps) {
  const timestamp = `${new Date(2024, 0, 1, 11, 23).toISOString().replace(/[-:]/g, '').replace('T', '')}`
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  useEffect(() => {
    if (id) {
      const storedData = localStorage.getItem(id);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setInitialMessages(parsedData);
      }else{
        setInitialMessages([]);
      }
    }else{
      id=`cid_${timestamp}`;
    }
  }, [id]);
  const [apiname, setApiName] = useState('chat')
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiName(event.target.value);
  };
  const [previewToken, setPreviewToken] = useLocalStorage<{
    llm_api_key: string;
    llm_base_url: string;
    serp_api_key: string;
  } | null>('ai-token', null);
  
  const initialPreviewToken = {
    llm_api_key: "",
    llm_base_url: "",
    serp_api_key: ""
  };
  
  const [previewTokenDialog, setPreviewTokenDialog] = useState(false);
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? initialPreviewToken);
    
  const handleSaveToken = () => {
    setPreviewToken(previewTokenInput);
    setPreviewTokenDialog(false);
  };
  
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api:process.env.NEXT_PUBLIC_API_URL+'/api/'+apiname,
      initialMessages,
      id,
      body: {
        id,
        previewToken
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish(response) {
        const msg = initialMessages??[];
        const latestMsg = localStorage.getItem('latestMsg')
        if(latestMsg){
          msg.push({
            id: nanoid(),
            role: 'user',
            content: latestMsg
          })
        }
        msg.push({
          id: response.id,
          role: 'assistant',
          content: response.content
        })
        if(id!==undefined)localStorage.setItem(id, JSON.stringify(msg))
      }
    })
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <>
         <EmptyScreen setInput={setInput} />
         <div className="mx-auto max-w-2xl mt-10 text-center">
          <Button 
            onClick={() => {
              setPreviewTokenDialog(true);
              setPreviewTokenInput(previewToken ?? initialPreviewToken);
            }}
          >
            Key Setting
          </Button></div></>

        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />

      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your API Keys</DialogTitle>
        </DialogHeader>
        <Input
          value={previewTokenInput.llm_api_key}
          placeholder="LLM API Key, like sk-xxxxx"
          onChange={e => setPreviewTokenInput(prevState => ({
            ...prevState,
            llm_api_key: e.target.value
          }))}
        />
        <Input
          value={previewTokenInput.llm_base_url}
          placeholder="Base URL, default is https://api.openai.com/v1"
          onChange={e => setPreviewTokenInput(prevState => ({
            ...prevState,
            llm_base_url: e.target.value
          }))}
        />
        <Input
          value={previewTokenInput.serp_api_key}
          placeholder="SERP API Key , from https://serpapi.com"
          onChange={e => setPreviewTokenInput(prevState => ({
            ...prevState,
            serp_api_key: e.target.value
          }))}
        />
        <DialogFooter className="items-center">
          <Button
            onClick={handleSaveToken}
          >
            Save Token
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>
      <div className='w-full pb-3 fixed bottom-0 z-50 text-center'>
      <label className='mx-2'>
        <input
          type="radio"
          value="chat"
          checked={apiname === 'chat'}
          onChange={handleRadioChange}
        />
        Chat
      </label>
      <label className='mx-2'>
        <input
          type="radio"
          value="search"
          checked={apiname === 'search'}
          onChange={handleRadioChange}
        />
        Search
      </label>
      </div>
    </>
  )
}
