import * as React from 'react'
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
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import {useState,useEffect} from 'react'
export interface PromptProps
  extends Pick<UseChatHelpers, 'input' | 'setInput'> {
  onSubmit: (value: string) => void
  isLoading: boolean
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
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
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  const [agents, setAgents] = useState({'dummy':{
    id: 'dummy',
    name: 'dummy',
    prompt: 'dummy'
  }});
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  useEffect(() => {
    const storedAgents=localStorage.getItem('Agents')
    if(storedAgents){
      const parsedAgents = JSON.parse(storedAgents);
      setAgents(parsedAgents);
    }
  }, []);
  const [showDropdown, setShowDropdown] = useState(false);
  const handleAgentSelect = (agentName:string) => {
    setInput(`@${agentName} `); // Set the selected agent name as the input value
    setShowDropdown(false); // Hide the dropdown
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value)
    if (value.charAt(0) === '@' && value.charAt(-1) === ' ' && agents) {
      Object.entries(agents).forEach(([key, agent]) => {
        const agentName = agent.name;
        const agentPrompt = agent.prompt;
        if (value.startsWith(`@${agentName}`)) {
          console.log(agentPrompt)
          localStorage.setItem('AgentPrompt', `${agentPrompt}`);
          return; // Break out of the forEach loop
        }
      });
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };
  return (
    <>
    {/* <Popover open={showDropdown}>
      <PopoverTrigger asChild>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
      <Command>
      {Object.entries(agents).map(([key, agent]) => (
            <CommandItem
            key={key}
                value={(agent as Agent).name}
            >
            {'@' + (agent as Agent).name}
            </CommandItem>
          ))}
      </Command>
      </PopoverContent>
    </Popover> */}

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
      <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={e => {
                e.preventDefault()
                router.push('/')
                router.refresh()
              }}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'absolute left-0 top-4 size-8 rounded-full bg-background p-0 sm:left-4'
              )}
              disabled={isLoading}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          rows={1}
          value={input}
          onChange={e => handleInputChange(e)}
          placeholder="Send a message."
          spellCheck={false}
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
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
    </>
  )
}
