'use client'
import { Button } from "@/components/ui/button"
import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
type Paragraph = {
  id: string,
  reference: string,
  prompt: string,
  genTxt: string
}
type Article={
  p:Paragraph[]
}

export function Writer() {
  const [importWriterOpen, setImportWriterOpen] = useState(false);
  const [initialText, setInitialText] = useState('');
  const [article, setArticle] = useLocalStorage<Article>('article', { p: [] });

  const handleNewTaskClick = () => {
    const sections = initialText.split('\n\n').filter(Boolean);
    const newArticle = sections.map((section,index) => ({
      id: `${index}`,
      reference: `${section}`,
      prompt:``,
      genTxt: ``,
    }));
    setArticle({ p: newArticle });
    setImportWriterOpen(false);
  };

  return (
    <>
    <div className='w-full flex justify-end h-[40px]'>
      <Button className="text-xs" variant={"link"} onClick={() => { setImportWriterOpen(true) }}>Import</Button>
      </div>
      <Dialog open={importWriterOpen} onOpenChange={setImportWriterOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Reference</DialogTitle>
          </DialogHeader>
          <Textarea className="col-span-4 h-[200px]"
            value={initialText || ''}
            onChange={(e) => { setInitialText(e.target.value) }}
          />
          <Button onClick={handleNewTaskClick}>New Task</Button>
        </DialogContent>
      </Dialog>
      <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Id</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Prompt</TableHead>
          <TableHead className="text-right">GenTxt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {article.p.map((paragraph) => (
          <TableRow key={paragraph.id}>
            <TableCell className="font-medium">{paragraph.id}</TableCell>
            <TableCell>{paragraph.reference}</TableCell>
            <TableCell>{paragraph.prompt}</TableCell>
            <TableCell>{paragraph.genTxt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </>
  );
}