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

type Paragraph = {
  id: string,
  reference: string,
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
    const sections = initialText.split('\n').filter(Boolean);
    const newArticle = sections.map((section, index) => ({
      id: `id-${index}`,
      reference: `ref-${index}`,
      genTxt: section,
    }));
    setArticle({ p: newArticle });
    setImportWriterOpen(false);
  };

  return (
    <>
      <Button className="text-xs" variant={"link"} onClick={() => { setImportWriterOpen(true) }}>Import</Button>
      <Dialog open={importWriterOpen} onOpenChange={setImportWriterOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Agents</DialogTitle>
          </DialogHeader>
          <Textarea className="col-span-4 h-[200px]"
            value={initialText || ''}
            onChange={(e) => { setInitialText(e.target.value) }}
          />
          <Button onClick={handleNewTaskClick}>New Task</Button>
        </DialogContent>
      </Dialog>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Reference</th>
            <th>Generated Text</th>
          </tr>
        </thead>
        <tbody>
          {article.p.map(paragraph => (
            <tr key={paragraph.id}>
              <td>{paragraph.id}</td>
              <td>{paragraph.reference}</td>
              <td>{paragraph.genTxt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}