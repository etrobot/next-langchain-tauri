import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title?: string
  createdAt?: Date
  userId?: string
  path?: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export type PreviewToken = {
  scheme: string;
  llm_api_key: string;
  llm_model: string;
  llm_base_url: string;
  tavilyserp_api_key: string;
  google_api_key: string;
  google_cse_id: string;
  bing_api_key: string;
};

export interface KeyScheme {
  [key: string]: PreviewToken;
}
