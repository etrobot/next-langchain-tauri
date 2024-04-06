import { Chat } from '@/server/agent'
// export const runtime = 'edge';
// edge conflicts with duckduckgo-scape
export async function POST(req: Request) {
  const json = await req.json()
  return Chat(json)
}