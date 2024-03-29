'use client'
import { UseChatHelpers } from 'ai/react'
import { useChat, type Message } from 'ai/react'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from './ui/input'
import { Label } from "@/components/ui/label"
import { useState, useTransition, useEffect } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { IconSeparator, IconSpinner, IconTrash } from '@/components/ui/icons'
import { Textarea } from "@/components/ui/textarea"
import { IconEdit } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {initialKeyScheme,KeyScheme } from '@/components/header'
import { toast } from 'react-hot-toast'
import { Checkbox } from "@/components/ui/checkbox"
import { getRandomGradient,getRandomColor } from '@/lib/utils'
import { error } from 'console'

export interface Agent {
  id: string;
  name: string;
  disc: string;
  prompt: string;
  bg: string;
  pin: boolean;
  dark: boolean;
  usetool: boolean;
}
type Agents = {
  [key: string]: Agent
}

export function getAgentsText() {
  const storedAgents = localStorage.getItem('Agents');
  if (storedAgents) {
    return storedAgents.replace(/\n/g, "\\n")
  } else { return null }
}

export const promptOptimizer = `You are a prompt optimizer, skilled in refining and enhancing the prompts provided to ensure effective communication and precise outcomes. Your task is to apply the principles of clear instruction, relevant examples, role definition, structured formatting, and the use of XML tags to improve the quality and clarity of prompts submitted. By doing so, you'll guide the AI to better understand and accurately complete the tasks assigned.
Here are the steps you should follow to optimize prompts:
Clarify and Specify:
Review the prompt for clarity and directness, ensuring that all necessary context and details are included for the AI to understand the task at hand.
Remove any ambiguities and clearly state the desired outcomes.
Enrich with Examples:
Add relevant examples that are closely related to the real-world use cases the user might encounter.
Ensure diversity in examples to cover a range of potential scenarios the AI may need to address.
Define the Role Clearly:
Assign a clear role to the AI that aligns with the nature of the task, such as a 'coding navigator' for programming-related inquiries. This role will shape the tone and approach of the AI's responses.
Organize with Structure:
Break down the prompt into an organized list of instructions, whether numbered or bulleted, to make complex tasks more manageable.
Implement XML Tagging:
Use XML tags to segment the prompt into distinct sections, such as instructions, examples, and expected outputs. This will help the AI parse and respond to each part of the prompt accurately.
Now, please optimize the prompt below:\n\n`
export const newAgent = `{"#666666":{"id":"#666666","name":"Search","disc":"Get Info from Internet","prompt":"Get Info from Internet","bg":"linear-gradient(176deg, hsl(177, 72%, 60%), hsl(309, 16%, 60%), hsl(60, 93%, 60%))","dark":true,"pin":true,"usetool":true},"#666777":{"id":"#666777","name":"CoverMaker","disc":"Turn the message to covers.","prompt":"Turn the message to topics in markdown format like ' 1. **Item1** description1 \n\n 2.**Item2** description2\n\n 3...**' every item name should be surrounded by stars","dark":true,"bg":"radial-gradient(circle at 6% 15%, hsl(222, 92%, 60%), hsl(18, 91%, 60%), hsl(210, 94%, 60%))","pin":true,"usetool":false},"#318F3C":{"id":"#318F3C","name":"PromptOptimizer","disc":"a prompt optimizer, skilled in refining and enhancing the prompts","prompt":"${promptOptimizer}","bg":"linear-gradient(117deg, hsl(332, 99%, 60%), hsl(147, 42%, 60%), hsl(297, 53%, 60%))","pin":false,"usetool":false,"dark":true}}`
export interface AgentsProps extends Partial<Pick<UseChatHelpers, 'setInput'>> {
  showPinnedOnly: boolean;
}

export default function Agents({ setInput, showPinnedOnly }: AgentsProps) {
  const router = useRouter()
  const [AgentsText, setAgentsText] = useState(getAgentsText());
  const [editorOpen, setEditorOpen] = useState(false)
  const [allAgentEditorOpen, setallAgentEditorOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const initAgent: Agent = { id: getRandomColor(), name: '', disc: '', prompt: '', bg: getRandomGradient(true), pin: false, usetool: false, dark: true }
  const [currentAgent, setCurrentAgent] = useState(initAgent)
  const [agents, setAgents] = useState(() => {
    const atext = getAgentsText()
    if (atext) {
      return JSON.parse(atext.replace(/\n/g, "\\n"));
    } else {
      localStorage.setItem('Agents', newAgent);
      return JSON.parse(newAgent.replace(/\n/g, "\\n")); // or you can return an empty object {} if that's the desired initial state
    }
  });
  const [keyScheme, setKeyScheme] = useLocalStorage<KeyScheme>('ai-token', initialKeyScheme);
  const { messages, append,stop, isLoading} =
    useChat({
      api: process.env.NEXT_PUBLIC_API_URL + '/api/chat',
      id:'123',
      body: {
        previewToken:keyScheme.current,
        locale: navigator.language,
      },
      onResponse(response) {
        if (response.status !== 200) {
          toast.error(`${response.status} ${response.statusText}`);
        }
      },
      onFinish(response) {
        console.log(response.content);
        setCurrentAgent({...currentAgent,prompt:response.content});
      }
    })
  // Function to open the editor with the selected Agent's details
  const handleEditAgent = (AgentId: string) => {
    setCurrentAgent(agents[AgentId]);
    console.log(currentAgent)
    setEditorOpen(true);
  }

  const handlePinned = (AgentId: string) => {
    const updatedAgents = {
      ...agents,
      [AgentId]: { ...agents[AgentId], pin: !agents[AgentId].pin }
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents);
  }

  const toggleDark = (AgentId: string) => {
    const updatedAgents = {
      ...agents,
      [AgentId]: { ...agents[AgentId], bg: agents[AgentId].dark ? agents[AgentId].bg.replace(/60%\)/g, '94%)') : agents[AgentId].bg.replace(/94%\)/g, '60%)'), dark: !agents[AgentId].dark }
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents);
  }

  const changeAgentBg = (AgentId: string) => {
    const updatedAgents = {
      ...agents,
      [AgentId]: { ...agents[AgentId], bg: getRandomGradient(agents[AgentId].dark) }
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents);
  }

  const handleNewAgent = () => {
    setCurrentAgent(initAgent);
    setEditorOpen(true);
  }

  // Function to handle saving the current Agent to the local state and localStorage
  const handleSaveAgents = () => {
    if(!currentAgent.name){
      toast.error('Agent name is required')
      return
    }
    const updatedAgents = {
      ...agents,
      [currentAgent.id]: currentAgent
    }
    setAgents(updatedAgents)
    saveAgents(updatedAgents);
    setEditorOpen(false) // Close the editor
    router.refresh()
  }

  function saveAgents(passAgents: any) {
    localStorage.setItem('Agents', JSON.stringify(passAgents)) // Save to localStorage
    router.refresh()
  }

  return (
    <>
      <div className='w-full flex justify-end h-[40px]'>
      {!showPinnedOnly && <> <Button variant="link" className='text-xs ' onClick={() => { navigator.clipboard.writeText(localStorage.getItem('Agents') || ''); toast.success('Agents data is copied to clipboard') }}>Export</Button>
        <IconSeparator className='my-2' /><Button className='text-xs ' variant={"link"} onClick={() => { setAgentsText(getAgentsText()); setallAgentEditorOpen(true) }}>Import</Button></>}
      </div>
      <div className= "flex flex-wrap gap-4 mx-4 justify-center">
      {Object.entries(agents as Agents).filter(([key, agent]: [string, Agent]) => !showPinnedOnly || agent.pin).map(([key, agent]: [string, Agent]) =>  (
          <>
            <Card id={`agent-${key}`} key={key}
              className={agent.dark ? "w-[300px] h-[210px] flex-shrink-0 text-white z-99" : "w-[300px] h-[210px] flex-shrink-0 text-black z-99"}
              style={{ background: agent.bg }}>
              <CardHeader>
                <CardTitle>{agent.name}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col h-[93px] overflow-hidden'>{agent.disc}</CardContent>
              <CardFooter className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditAgent(key)}><IconEdit /></Button>
                <Button variant="ghost" size="icon" onClick={() => changeAgentBg(key)}>🎨</Button>
                <Button variant="ghost" size="icon" onClick={() => toggleDark(key)}>{agent.dark ? "☀️" : "🌙"}</Button>
                {setInput ? <Button variant="ghost" size="icon" onClick={() => setInput(`@${agent.name} `)}>@</Button> : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePinned(key)}
                >
                  {agent.pin ? "★" : "☆"}
                </Button>
                <Button
                  variant="ghost"
                  className="ml-auto size-6 p-0 hover:bg-background"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <IconTrash />
                  <span className="sr-only">Delete</span>
                </Button>
              </CardFooter>
            </Card>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your chat message and remove your
                    data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const updatedAgents = { ...agents }
                      delete updatedAgents[key] // Remove the Agent from the object
                      setAgents(updatedAgents) // Update local state
                      localStorage.setItem('Agents', JSON.stringify(updatedAgents)) // Update localStorage
                    }
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ))}
        <Dialog open={editorOpen} onOpenChange={()=>{
          if(!editorOpen)stop();
          setEditorOpen(!editorOpen);
        }}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <div className="grid grid-cols-6 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  * Name
                </Label>
                <Input className="col-span-5"
                  value={currentAgent.name}
                  placeholder="Input an unique name without space"
                  onChange={(e) => {
                    const newName = e.target.value.replace(/\s/g, '_');
                    setCurrentAgent({ ...currentAgent, name: newName });
                  }}
                />
              </div>
              <div className="grid grid-cols-6 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  Discription
                </Label>
                <Textarea className="col-span-5 h-[60px]"
                  value={currentAgent.disc}
                  placeholder="Discription for this agent"
                  onChange={(e) => setCurrentAgent({ ...currentAgent, disc: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-6 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  <p>Prompt</p>
                  <Button variant="outline" className='mt-2' onClick={()=>{
                    if(currentAgent.prompt.length<10){
                      toast.error('Too short for AI prompt optimization')
                      return;
                    }
                    append({
                    id: '123',
                    content: promptOptimizer+currentAgent.prompt,
                    role: 'user'
                  })}}>{isLoading?<IconSpinner/>:"AI"}</Button>
                </Label>
                
                <Textarea className="col-span-5 h-[280px]"
                  value={currentAgent.prompt}
                  placeholder="Prompt for this agent"
                  onChange={(e) => setCurrentAgent({ ...currentAgent, prompt: e.target.value.replace(/"/g, "'") })}
                />
              </div>
            </div>
            <DialogFooter className="items-center">
              <Checkbox id="usetool" checked={currentAgent.usetool} onCheckedChange={() => setCurrentAgent({ ...currentAgent, usetool: !currentAgent.usetool })}/>useTool
              <Button onClick={handleSaveAgents}>Save Agent</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={allAgentEditorOpen} onOpenChange={setallAgentEditorOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Import Agents</DialogTitle>
            </DialogHeader>
            <Textarea className="col-span-4 h-[200px]"
              value={AgentsText || ''}
              onChange={(e) => { setAgentsText(e.target.value) }}
            />
            <Button onClick={() => { localStorage.setItem('Agents', AgentsText || getAgentsText() || ''); window.location.reload() }}>Save Agents</Button>
            <Button variant="ghost" onClick={() => setAgentsText(newAgent)}>Reset to Default</Button>
          </DialogContent>
        </Dialog>
        {!showPinnedOnly && <Card className="w-[300px] h-[210px] flex-shrink-0 z-99 text-center">
          <button className="mt-24" onClick={handleNewAgent}>+ New Agent</button>
        </Card>}
      </div>
      <div className="mx-auto px-4 text-center mt-6">
        <p className="leading-normal text-muted-foreground">
          Select a agent to start your creation.
        </p>
      </div>
    </>
  )
}