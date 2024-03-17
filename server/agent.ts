import { StreamingTextResponse } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { TavilySearchResults } from "./custom/tools/tavily/tavily_search";
import { BingSerpAPI } from "./custom/tools/bing/bingserpapi";
import { GoogleCustomSearch } from "./custom/tools/google/google_custom_search";
import { ChatGoogleGenerativeAI } from "./custom/llm/gemini";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { BaseMessage } from "@langchain/core/messages";
import { FunctionMessage } from "@langchain/core/messages";
import { AgentAction } from "@langchain/core/agents";
import { StateGraph, END } from "@langchain/langgraph";
import { RunnableLambda } from "@langchain/core/runnables";


const convertMessageToLangChainMessage = (message: any) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

export async function Chat(body: any) {
  // console.log(body)
  const messages = (body.messages ?? []).filter(
    (message: any) =>
      message.role === "user" || message.role === "assistant",
  ).map(convertMessageToLangChainMessage);;
  process.env.TAVILY_API_KEY = body.previewToken.tavilyserp_api_key
  process.env.GOOGLE_API_KEY = body.previewToken.google_api_key
  process.env.GOOGLE_CSE_ID = body.previewToken.google_cse_id
  const model = new ChatOpenAI({
    temperature: 0.2,
    modelName: body.previewToken.llm_model || 'gpt-3.5-turbo-0125',
    openAIApiKey: body.previewToken.llm_api_key,
    configuration: { baseURL: body.previewToken?.llm_base_url || 'https://api.openai.com/v1' },
    streaming: true
  });

  if (!body.messages.slice(-1)[0].function_call) {
    const outputParser = new HttpResponseOutputParser()
    const stream = await model.pipe(outputParser).stream(messages);
    return new StreamingTextResponse(stream);
  }


  var tools: (BingSerpAPI | TavilySearchResults | GoogleCustomSearch)[] = [];
  if (body.previewToken.tavilyserp_api_key) {
    tools.push(new TavilySearchResults({ maxResults: 5 }));
  }
  if (body.previewToken.bing_api_key) {
    tools.push(new BingSerpAPI(body.previewToken.bing_api_key));
  }
  if (body.previewToken.google_api_key) {
    tools.push(new GoogleCustomSearch());
  }


  const toolExecutor = new ToolExecutor({
    tools,
  });

  const toolsAsOpenAIFunctions = tools.map((tool) =>
    convertToOpenAIFunction(tool)
  );
  const newModel = model.bind({
    functions: toolsAsOpenAIFunctions,
  });
  const agentState = {
    messages: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => [],
    },
  };

  // Define the function that determines whether to continue or not
  const shouldContinue = (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    // If there is no function call, then we finish
    if (
      !("function_call" in lastMessage.additional_kwargs) ||
      !lastMessage.additional_kwargs.function_call
    ) {
      return "end";
    }
    // Otherwise if there is, we continue
    return "continue";
  };

  // Define the function to execute tools
  const _getAction = (state: { messages: Array<BaseMessage> }): AgentAction => {
    const { messages } = state;
    // Based on the continue condition
    // we know the last message involves a function call
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error("No messages found.");
    }
    if (!lastMessage.additional_kwargs.function_call) {
      throw new Error("No function call found in message.");
    }
    // We construct an AgentAction from the function_call
    return {
      tool: lastMessage.additional_kwargs.function_call.name,
      toolInput: JSON.stringify(
        lastMessage.additional_kwargs.function_call.arguments
      ),
      log: "",
    };
  };

  // Define the function that calls the model
  const callModel = async (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;
    const response = await newModel.invoke(messages);
    // We return a list, because this will get added to the existing list
    return {
      messages: [response],
    };
  };

  const callTool = async (state: { messages: Array<BaseMessage> }) => {
    const action = _getAction(state);
    // We call the tool_executor and get back a response
    const response = await toolExecutor.invoke(action);
    // We use the response to create a FunctionMessage
    const functionMessage = new FunctionMessage({
      content: response,
      name: action.tool,
    });
    // We return a list, because this will get added to the existing list
    return { messages: [functionMessage] };
  };
  // Define a new graph
  const workflow = new StateGraph({
    channels: agentState,
  });

  // Define the two nodes we will cycle between
  workflow.addNode("agent", new RunnableLambda({ func: callModel }));
  workflow.addNode("action", new RunnableLambda({ func: callTool }));

  // Set the entrypoint as `agent`
  // This means that this node is the first one called
  workflow.setEntryPoint("agent");

  // We now add a conditional edge
  workflow.addConditionalEdges(
    // First, we define the start node. We use `agent`.
    // This means these are the edges taken after the `agent` node is called.
    "agent",
    // Next, we pass in the function that will determine which node is called next.
    shouldContinue,
    // Finally we pass in a mapping.
    // The keys are strings, and the values are other nodes.
    // END is a special node marking that the graph should finish.
    // What will happen is we will call `should_continue`, and then the output of that
    // will be matched against the keys in this mapping.
    // Based on which one it matches, that node will then be called.
    {
      // If `tools`, then we call the tool node.
      continue: "action",
      // Otherwise we finish.
      end: END,
    }
  );

  // We now add a normal edge from `tools` to `agent`.
  // This means that after `tools` is called, `agent` node is called next.
  workflow.addEdge("action", "agent");

  // Finally, we compile it!
  // This compiles it into a LangChain Runnable,
  // meaning you can use it as you would any other runnable
  const app = workflow.compile();
  const inputs = {
    messages: [new HumanMessage(body.messages[body.messages.length - 1].content)],
  };
  
  const logStream = await app.streamLog(inputs)
  const encoder = new TextEncoder()
  const transformStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of logStream) {
        if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
          const addOp = chunk.ops[0];
          // console.log(addOp.path,addOp.value)
          if (addOp.path.startsWith("/logs/googlegenerativeai") ||
            addOp.path.startsWith("/logs/ChatOpenAI") && addOp.path.includes("stream") &&
            typeof addOp.value === "string" &&
            addOp.value.length
          ) {
            controller.enqueue(encoder.encode(addOp.value));
          }
          if (addOp.path.startsWith('/logs/BingSerpAPI/final_output') || addOp.path.startsWith('/logs/GoogleCustomSearch/final_output') || addOp.path.startsWith('/logs/TavilySearchResults/final_output')) {
            controller.enqueue(encoder.encode('\n\n---\n\n' + addOp.value.output.split('\n\n').map((line: string) => line.split(']')[1]).join('\n\n') + '\n\n---\n\n'));
          }
        }
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(transformStream);
}