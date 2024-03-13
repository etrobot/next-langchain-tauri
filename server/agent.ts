import { StreamingTextResponse} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BingSerpAPI } from "./custom/tools/bing/bingserpapi";
import { ChatGoogleGenerativeAI } from "./custom/llm/gemini";
import { StringOutputParser } from "@langchain/core/output_parsers";


export async function Chat(body: any) {
  console.log(body)
  const messages = body.messages.map((message:any) => {
      return [message.role,message.content]
    });
  const currentMessageContent = messages.slice(-1)[0];
  process.env.TAVILY_API_KEY = body.previewToken.search_api_key
  var model:any
  if(body.previewToken.llm_model==='gemini-pro'){
      model = new ChatGoogleGenerativeAI({
        apiKey: body.previewToken.llm_api_key,
        baseURL: body.previewToken?.llm_base_url || null,
        modelName: "gemini-pro",
        maxOutputTokens: 8192,
    });
  }else{
    model = new ChatOpenAI({
      temperature: 0.2,
      modelName: body.previewToken.llm_model || 'gpt-3.5-turbo-0125',
      openAIApiKey: body.previewToken.llm_api_key,
      configuration: { baseURL: body.previewToken?.llm_base_url || 'https://api.openai.com/v1' },
      streaming: true
    });
  }
  if(!body.messages.slice(-1)[0].function_call){
    const parser = new StringOutputParser();
    const stream = await model.pipe(parser).stream(messages);
    return new StreamingTextResponse(stream);
  }

  const tools = body.previewToken.bing_api_key ? [new BingSerpAPI(body.previewToken.bing_api_key)] : [new TavilySearchResults({ maxResults: 5 })];
  var SYSTEM_TEMPLATE = `
  you has access to the following tools:
  {tools}
  To use a tool in neccessary, please use the following format:
  \`\`\`markdown
  Thought: Do I need to use a tool? Yes
  Action: the action to take, should be one of [{tool_names}]
  Action Input: the input to the action
  Observation: the result of the action
  \`\`\`
  When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:
  \`\`\`markdown
  Thought: Do I need to use a tool? No
  \`\`\`
  ### Final Answer:\n\n [your response here in ${body.locale}]
  Begin!
  Previous conversation history:
  {chat_history}
  New input: {input}
  {agent_scratchpad}`

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{input}"],
  ]);
  
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: false,
  });

  const logStream = await agentExecutor.streamLog({
    input: currentMessageContent,
    chat_history: messages.slice(0, -1),
  });

  const transformStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of logStream) {
        if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
          const addOp = chunk.ops[0];
          // console.log(addOp)
          if (
            addOp.path.startsWith("/logs/ChatOpenAI") &&
            typeof addOp.value === "string" &&
            addOp.value.length
          ) {
            controller.enqueue(addOp.value);
          }
          if(addOp.path.startsWith('/logs/BingSerpAPI/final_output')){
            controller.enqueue('\n\n---\n\n'+addOp.value.output+'\n\n---\n\n');
          }
        }
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(transformStream);
}