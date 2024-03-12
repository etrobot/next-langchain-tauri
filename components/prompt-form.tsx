import Textarea from 'react-textarea-autosize'
import { UseChatHelpers } from 'ai/react'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { IconArrowElbow, IconUsers } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import {useState,useEffect,useRef} from 'react'
export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => void
  isLoading: boolean
}
import {FooterText} from '@/components/footer'

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import toast from 'react-hot-toast'
interface Agent {
  id: string;
  name: string;
  prompt: string;
}
export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const router = useRouter()

  const [agents, setAgents] = useState({'Search':{
    id: '#666777',
    name: 'Search',
    prompt: 'Get info from Internet [//]: (ReAct-Tools)'
  }});

  useEffect(() => {
    const storedAgents=localStorage.getItem('Agents')
    if(storedAgents){
      const parsedAgents = JSON.parse(storedAgents);
      setAgents(parsedAgents);
    }
  }, []);

  const [showPopup, setshowPopup] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value)
    if (value.split(' ')[0] === '@' || value === '@'){
      const storedAgents=localStorage.getItem('Agents')
      if(storedAgents){
        const parsedAgents = JSON.parse(storedAgents);
        setAgents(parsedAgents);
      }
      setshowPopup(true);
    }else{
      setshowPopup(false);
    }
    if (value.split(' ')[0].charAt(0) === '@' && agents) {
      Object.entries(agents).forEach(([key, agent]) => {
        const agentName = agent.name;
        const agentPrompt = agent.prompt;
        if (value.startsWith(`@${agentName}`)) {
          console.log(agentPrompt)
          localStorage.setItem('AgentPrompt', `${agentPrompt}`);
          return; // Break out of the forEach loop
        }
      });
    }
  };
  
  return (
    <>
    <Command > 
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (!input?.trim()) {
          return
        }
        setInput('')
        await onSubmit(input)
      }}
      ref={formRef}
    >
      {showPopup&&
          <CommandGroup className='' >
            {Object.entries(agents).map(([key, agent]) => (
              <CommandItem
                key={key}
                value={(agent as Agent).name}
                onSelect={(currentValue) =>{
                    setInput(`@${(agent as Agent).name} ` + input.slice(1))
                    setshowPopup(false)
                  }
                }
              >
                {'@' + (agent as Agent).name}
              </CommandItem>
            ))}
          </CommandGroup>
      }
      <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={e => {
                e.preventDefault()
                router.replace('/')
                router.refresh()
              }}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'absolute left-0 top-4 size-8 rounded-full bg-background p-0 sm:left-4'
              )}
              disabled={isLoading}
            >
              ⌂
              <span className="sr-only">New Chat</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>Agents' Home</TooltipContent>
        </Tooltip>

          <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={!showPopup ? onKeyDown : undefined}
          rows={1}
          value={input}
          onChange={e => handleInputChange(e)}
          placeholder="Send a message."
          spellCheck={false}
          className="min-h-[64px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
        />
       
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ''}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
    </Command>
    <div  className='text-sm text-muted-foreground'>
      <FooterText/>
    </div>
    </>
  )
}
