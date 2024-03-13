import { EnhancedGenerateContentResponse, Content, Part } from "@fuyun/generative-ai";
import { BaseMessage, MessageContent } from "@langchain/core/messages";
import { ChatGenerationChunk, ChatResult } from "@langchain/core/outputs";
export declare function getMessageAuthor(message: BaseMessage): string;
/**
 * Maps a message type to a Google Generative AI chat author.
 * @param message The message to map.
 * @param model The model to use for mapping.
 * @returns The message type mapped to a Google Generative AI chat author.
 */
export declare function convertAuthorToRole(author: string): "model" | "user";
export declare function convertMessageContentToParts(content: MessageContent, isMultimodalModel: boolean): Part[];
export declare function convertBaseMessagesToContent(messages: BaseMessage[], isMultimodalModel: boolean): Content[];
export declare function mapGenerateContentResultToChatResult(response: EnhancedGenerateContentResponse): ChatResult;
export declare function convertResponseContentToChatGenerationChunk(response: EnhancedGenerateContentResponse): ChatGenerationChunk | null;
