'use client'
import { UseChatHelpers } from 'ai/react'
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
import { IconSpinner, IconSeparator, IconCheck } from '@/components/ui/icons'
import { Textarea } from "@/components/ui/textarea"
import { IconEdit, IconDownload } from '@/components/ui/icons'
import { useRouter } from 'next/navigation'
import { ExternalLink } from '@/components/external-link'
import { toast } from 'react-hot-toast'
import { Checkbox } from "@/components/ui/checkbox"
// import { toPng } from 'html-to-image';
// import download from 'downloadjs';
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export interface Agent {
  name: string;
  title: string;
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
    return storedAgents
  } else { return null }
}


function getRandomGradient(dark: boolean): string {
  const randomHue = (): number => Math.floor(Math.random() * 360);
  const randomSaturation = (): number => Math.floor(Math.random() * 100);
  const fixedLightness = dark ? 60 : 90;

  const color1 = `hsl(${randomHue()}, ${randomSaturation()}%, ${fixedLightness}%)`;
  const color2 = `hsl(${randomHue()}, ${randomSaturation()}%, ${fixedLightness}%)`;
  const color3 = `hsl(${randomHue()}, ${randomSaturation()}%, ${fixedLightness}%)`;

  const angle = Math.floor(Math.random() * 360);

  const gradientType = Math.random() < 0.5 ? 'linear' : 'radial';

  if (gradientType === 'linear') {
    return `linear-gradient(${angle}deg, ${color1}, ${color2}, ${color3})`;
  } else {
    const centerX = Math.floor(Math.random() * 100);
    const centerY = Math.floor(Math.random() * 100);
    return `radial-gradient(circle at ${centerX}% ${centerY}%, ${color1}, ${color2}, ${color3})`;
  }
}

export const newAgent = `{"Search":{"name":"Search","title":"Search","disc":"Get Info from Internet","prompt":"","bg":"#ababab","dark":true,"pin":true,"usetool":true},"Cot":{"name":"Cot","title":"CoT","prompt":"Let's think step by step.","dist":"","dark":true,"bg":"#ababab","pin":true,"usetool":false}}`

export interface AgentsProps extends Partial<Pick<UseChatHelpers, 'setInput'>> {
  showPinnedOnly: boolean;
}

export default function Agents({ setInput, showPinnedOnly }: AgentsProps) {
  useEffect(() => {
    console.log(showPinnedOnly);
  })
  const router = useRouter()
  const [AgentsText, setAgentsText] = useState(getAgentsText());
  const [editorOpen, setEditorOpen] = useState(false)
  const [allAgentEditorOpen, setallAgentEditorOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const initAgent: Agent = { title: '', name: '', disc: '', prompt: '', bg: '', pin: false, usetool: false, dark: true }
  const [currentAgent, setCurrentAgent] = useState(initAgent)
  const [agents, setAgents] = useState(() => {
    const atext = getAgentsText()
    if (atext) {
      return JSON.parse(atext);
    } else {
      localStorage.setItem('Agents', newAgent);
      return JSON.parse(newAgent); // or you can return an empty object {} if that's the desired initial state
    }
  });

  // Function to open the editor with the selected Agent's details
  const handleEditAgent = (AgentId: string) => {
    setCurrentAgent({ ...agents[AgentId], id: AgentId });
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
      [AgentId]: { ...agents[AgentId], bg: agents[AgentId].dark ? agents[AgentId].bg.replace(/60%\)/g, '90%)') : agents[AgentId].bg.replace(/90%\)/g, '60%)'), dark: !agents[AgentId].dark }
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
    setCurrentAgent({ ...initAgent, bg: getRandomGradient(true) });
    setEditorOpen(true);
  }

  // Function to handle saving the current Agent to the local state and localStorage
  const handleSaveAgents = () => {
    const updatedAgents = {
      ...agents,
      [currentAgent.name]: { ...agents[currentAgent.name], title: currentAgent.title, prompt: currentAgent.disc, bg: currentAgent.bg ,usetool: currentAgent.usetool}
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
  // const handleDownloadImage = async (key: string) => {
  //   try {
  //     const cardElement = document.getElementById(`agent-${key}`) as HTMLElement;
  //     if (cardElement) {
  //       const buttons = [...cardElement.querySelectorAll('button')] as HTMLElement[];
  //       buttons.forEach(btn => btn.style.visibility = 'hidden');
  //       const dataUrl = await toPng(cardElement);
  //       download(dataUrl, `card-${key}.png`);
  //       buttons.forEach(btn => btn.style.visibility = 'visible');
  //     }
  //   } catch (error) {
  //     console.error('Something went wrong when downloading the card image', error);
  //   }
  // };
  return (
    <>
      <div className='w-full flex justify-end'>
        <Button variant="link" className='text-xs ' onClick={() => { navigator.clipboard.writeText(localStorage.getItem('Agents') || ''); toast.success('Agents data is copied to clipboard') }}>Export</Button>
        <IconSeparator className='my-2' /><Button className='text-xs ' variant={"link"} onClick={() => { setAgentsText(getAgentsText()); setallAgentEditorOpen(true) }}>Import</Button>
      </div>
      <div className= "flex flex-wrap gap-4 mx-4 justify-center">
        {Object.entries(agents as Agents).filter(([key, agent]: [string, Agent]) => !showPinnedOnly || agent.pin).map(([key, agent]: [string, Agent]) => (
          <>
            <Card id={`agent-${key}`} key={key}
              className={agent.dark ? "w-[300px] h-[240px] flex-shrink-0 text-white z-99" : "w-[300px] h-[240px] flex-shrink-0 text-black z-99"}
              style={{ background: agent.bg }}>
              <CardHeader>
                <CardTitle>{agent.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col h-[120px] justify-end'><pre>{agent.disc}</pre></CardContent>
              <CardFooter className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditAgent(key)}><IconEdit /></Button>
                <Button variant="ghost" size="icon" onClick={() => changeAgentBg(key)}>🎨</Button>
                <Button variant="ghost" size="icon" onClick={() => toggleDark(key)}>{agent.dark ? "☀️" : "🌙"}</Button>
                {/* <Button variant="ghost" size="icon" onClick={() => handleDownloadImage(key)}><IconDownload /></Button> */}
                {setInput ? <Button variant="ghost" size="icon" onClick={() => setInput(`@${agent.name} `)}>@</Button> : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePinned(key)}
                >
                  {agent.pin ? "★" : "☆"}
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
        <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Agent</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <div className="grid grid-cols-5 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  * Title
                </Label>
                <Input className="col-span-4"
                  value={currentAgent.title}
                  placeholder="Input an Agent Name"
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCurrentAgent({ ...currentAgent, title: newName });
                  }}
                />
              </div>
              <div className="grid grid-cols-5 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  Discription
                </Label>
                <Textarea className="col-span-4 h-[100px]"
                  value={currentAgent.disc}
                  placeholder="Discription for this agent"
                  onChange={(e) => setCurrentAgent({ ...currentAgent, disc: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-5 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  Prompt
                </Label>
                <Textarea className="col-span-4 h-[200px]"
                  value={currentAgent.prompt}
                  placeholder="Prompt for this agent"
                  onChange={(e) => setCurrentAgent({ ...currentAgent, prompt: e.target.value })}
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
        {!showPinnedOnly && <Card className="w-[300px] h-[240px] flex-shrink-0 z-99 text-center">
          <button className="mt-28" onClick={handleNewAgent}>+ New Agent</button>
        </Card>}
      </div>
      <div className="mx-auto px-4 text-center mt-6">
        <p className="leading-normal ">
          Selet a agent to start your creation.
        </p>
      </div>
    </>
  )
}