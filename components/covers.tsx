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
import { useState, useTransition,useEffect } from 'react'
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
import { toPng } from 'html-to-image';
import download from 'downloadjs';
function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export interface Cover {
  title: string;
  prompt: string;
  bg:string;
  pin: boolean;
  dark: boolean;
}
type Covers= {
  [key: string]: Cover
}

export function getCoversText() {
  const storedCovers = localStorage.getItem('Covers');
  if (storedCovers) {
    return storedCovers
  } else { return null }
}


function getRandomGradient(dark:boolean): string {
  const randomHue = (): number => Math.floor(Math.random() * 360);
  const randomSaturation = (): number => Math.floor(Math.random() * 100);
  const fixedLightness = dark? 60 : 90; 

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

export const newCover = `{"#666666":{"title":"Search","prompt":"Get Info from Internet","bg":"#ababab","dark":true,"pin":true},"#666777":{"title":"CoT","prompt":"Let's think step by step.","dark":true,"bg":"#ababab","pin":true}}`

export interface CoversProps extends Partial<Pick<UseChatHelpers, 'setInput'>> {
  showPinnedOnly: boolean;
}

export default function Covers({ setInput, showPinnedOnly }: CoversProps) {
  useEffect(() => {
    console.log(showPinnedOnly);
  })
  const router = useRouter()
  const [CoversText, setCoversText] = useState(getCoversText());
  const [editorOpen, setEditorOpen] = useState(false)
  const [allCoverEditorOpen, setallCoverEditorOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isRemovePending, startRemoveTransition] = useTransition()
  const [currentCover, setCurrentCover] = useState({ id: '', title: '', prompt: '' ,bg:'',pin:false})
  const [covers, setCovers] = useState(() => {
    const atext = getCoversText()
    if (atext) {
      return JSON.parse(atext);
    } else {
      localStorage.setItem('Covers', newCover);
      return JSON.parse(newCover); // or you can return an empty object {} if that's the desired initial state
    }
  });

  // Function to open the editor with the selected Cover's details
  const handleEditCover = (CoverId: string) => {
    setCurrentCover({ ...covers[CoverId], id: CoverId });
    setEditorOpen(true);
  }

  const handlePinned = (CoverId: string) => {
    const updatedCovers = {
      ...covers,
      [CoverId]: { ...covers[CoverId], pin:!covers[CoverId].pin }
    }
    setCovers(updatedCovers)
    saveCovers(updatedCovers);
  }

  const toggleDark = (CoverId: string) => {
    const updatedCovers = {
      ...covers,
      [CoverId]: { ...covers[CoverId],bg:covers[CoverId].dark?covers[CoverId].bg.replace(/60%\)/g,'90%)'):covers[CoverId].bg.replace(/90%\)/g,'60%)'), dark:!covers[CoverId].dark }
    }
    setCovers(updatedCovers)
    saveCovers(updatedCovers);
  }

  const changeCoverBg = (CoverId: string) => {
    const updatedCovers = {
      ...covers,
      [CoverId]: { ...covers[CoverId], bg:getRandomGradient(covers[CoverId].dark) }
    }
    setCovers(updatedCovers)
    saveCovers(updatedCovers);
  }

  const handleNewCover = () => {
    setCurrentCover({ id: getRandomColor(), title: '', prompt: '',bg:getRandomGradient(true),pin:false});
    setEditorOpen(true);
  }

  // Function to handle saving the current Cover to the local state and localStorage
  const handleSaveCovers = () => {
    const updatedCovers = {
      ...covers,
      [currentCover.id]: {...covers[currentCover.id], title: currentCover.title, prompt: currentCover.prompt, bg:currentCover.bg }
    }
    setCovers(updatedCovers)
    saveCovers(updatedCovers);
    setEditorOpen(false) // Close the editor
  }

  function saveCovers(passCovers: any) {
    localStorage.setItem('Covers', JSON.stringify(passCovers)) // Save to localStorage
    router.refresh()
  }
  const handleDownloadImage = async (key: string) => {
    try {
      const cardElement = document.getElementById(`cover-${key}`) as HTMLElement;
      if (cardElement) {
        const buttons = [...cardElement.querySelectorAll('button')] as HTMLElement[];
        buttons.forEach(btn => btn.style.visibility = 'hidden');
        const dataUrl = await toPng(cardElement);
        download(dataUrl, `card-${key}.png`);
        buttons.forEach(btn => btn.style.visibility = 'visible');
      }
    } catch (error) {
      console.error('Something went wrong when downloading the card image', error);
    }
  };
  return (
    <>
      <div className='w-full flex justify-end'>
        <Button variant="link" className='text-xs ' onClick={() => { navigator.clipboard.writeText(localStorage.getItem('Covers') || ''); toast.success('Covers data is copied to clipboard') }}>Export</Button>
        <IconSeparator className='my-2' /><Button className='text-xs ' variant={"link"} onClick={() => { setCoversText(getCoversText()); setallCoverEditorOpen(true) }}>Import</Button>
      </div>
      <div className={showPinnedOnly? "flex overflow-x-auto gap-3 mx-3":"flex flex-wrap gap-3 mx-3"}>
        {Object.entries(covers as Covers).filter(([key, cover]: [string, Cover]) => !showPinnedOnly || cover.pin).map(([key, cover]: [string, Cover]) => (
          <>
            <Card id={`cover-${key}`} key={key} 
            className={cover.dark?"w-[300px] h-[400px] flex-shrink-0 text-white z-99":"w-[300px] h-[400px] flex-shrink-0 text-black z-99"}
             style={{ background: cover.bg }}>
              <CardHeader>
                <CardTitle>{cover.title}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-col h-[290px] justify-end'><pre>{cover.prompt}</pre></CardContent>
              <CardFooter className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditCover(key)}><IconEdit /></Button>
                <Button variant="ghost" size="icon" onClick={() => changeCoverBg(key)}>🎨</Button>
                <Button variant="ghost" size="icon" onClick={() => toggleDark(key)}>{cover.dark?"☀️":"🌙"}</Button>
                <Button variant="ghost" size="icon" onClick={() => handleDownloadImage(key)}><IconDownload/></Button>
                {setInput ? <Button variant="ghost" size="icon" onClick={() => setInput(`#${cover.title}\n\n${cover.prompt}`)}>#</Button>:null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePinned(key)}
                >
                 {cover.pin?"★":"☆"}
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
                  <AlertDialogCancel disabled={isRemovePending}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isRemovePending}
                    onClick={() => {
                      const updatedCovers = { ...covers }
                      delete updatedCovers[key] // Remove the Cover from the object
                      setCovers(updatedCovers) // Update local state
                      localStorage.setItem('Covers', JSON.stringify(updatedCovers)) // Update localStorage
                    }
                    }
                  >
                    {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
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
              <DialogTitle>Edit Cover</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 py-4">
              <div className="grid grid-cols-5 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  * Title
                </Label>
                <Input className="col-span-4"
                  value={currentCover.title}
                  placeholder="Input an Cover Name"
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCurrentCover({ ...currentCover, title: newName });
                  }}
                />
              </div>
              <div className="grid grid-cols-5 items-center gap-2">
                <Label htmlFor="name" className="text-right">
                  Prompt
                </Label>
                <Textarea className="col-span-4 h-[200px]"
                  value={currentCover.prompt}
                  placeholder="Cover System Role Prompt"
                  onChange={(e) => setCurrentCover({ ...currentCover, prompt: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="items-center">
              <Button onClick={handleSaveCovers}>Save Cover</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={allCoverEditorOpen} onOpenChange={setallCoverEditorOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Import Covers</DialogTitle>
            </DialogHeader>
            <Textarea className="col-span-4 h-[200px]"
              value={CoversText || ''}
              onChange={(e) => { setCoversText(e.target.value) }}
            />
            <Button onClick={() => { localStorage.setItem('Covers', CoversText || getCoversText() || ''); window.location.reload() }}>Save Covers</Button>
            <Button variant="ghost" onClick={() => setCoversText(newCover)}>Reset to Default</Button>
          </DialogContent>
        </Dialog>
        {!showPinnedOnly && <Card className="w-[300px] h-[400px] flex-shrink-0 z-99 text-center">
          <button className="mt-40" onClick={handleNewCover}>+ New Cover</button>
        </Card>}
      </div>
      <div className="mx-auto px-4 text-center mt-4">
        <p className="leading-normal ">
          Choose a cover to start your creation.
        </p>
      </div>
    </>
  )
}