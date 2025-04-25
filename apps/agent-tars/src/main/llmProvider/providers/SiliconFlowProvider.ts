import { Message, ToolCall } from '@agent-infra/shared';
import { ChatCompletionTool } from 'openai/resources';
import { BaseProvider } from './BaseProvider';
import { LLMConfig, LLMResponse, ToolChoice } from '../interfaces/LLMProvider';
import { logger } from '@main/utils/logger';
import { maskSensitiveData } from '@main/utils/maskSensitiveData';
import { OpenAIProvider } from './OpenAIProvider';

/**
 * SiliconFlow provider implementation
 * Since SiliconFlow API is compatible with OpenAI API,
 * we can extend OpenAIProvider and only override necessary configurations
 */
export class SiliconFlowProvider extends OpenAIProvider {
  constructor(config: LLMConfig = {}) {
    super({
      ...config,
      // Set default baseURL for SiliconFlow
      baseURL:
        config.baseURL ||
        process.env.SILICONFLOW_API_BASE_URL ||
        'https://api.siliconflow.com/v1',
      // Set default model if not specified
      model:
        config.model ||
        process.env.SILICONFLOW_DEFAULT_MODEL ||
        'siliconflow-default',
    });
  }

  /**
   * Format messages for SiliconFlow API
   */
  protected formatMessages(messages: Message[]): any[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  /**
   * Send a message to the LLM and get a response
   */
  async askLLMText({
    messages,
    requestId,
  }: {
    messages: Message[];
    requestId: string;
  }): Promise<string> {
    try {
      const formattedMessages = this.formatMessages(messages);
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);

      // TODO: 实现实际的 SiliconFlow API 调用
      // const response = await this.client.chat.completions.create({
      //   model: this.model,
      //   messages: formattedMessages,
      //   temperature: this.config.temperature,
      //   max_tokens: this.config.maxTokens,
      //   top_p: this.config.topP,
      // });

      if (controller.signal.aborted) {
        throw new Error('Request aborted');
      }
      this.cleanupRequest(requestId);
      return ''; // TODO: 返回实际的响应内容
    } catch (error: unknown) {
      this.cleanupRequest(requestId);
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.includes('aborted'))
      ) {
        return '';
      }
      throw new Error(`Failed to get response from SiliconFlow: ${error}`);
    }
  }

  /**
   * Send a message to the LLM with tools and get a response with potential tool calls
   */
  async askTool({
    messages,
    tools,
    requestId,
    toolChoice = 'auto',
  }: {
    messages: Message[];
    tools: ChatCompletionTool[];
    requestId: string;
    toolChoice?: ToolChoice;
  }): Promise<LLMResponse> {
    try {
      const formattedMessages = this.formatMessages(messages);
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);

      // TODO: 实现实际的 SiliconFlow API 调用
      // const response = await this.client.chat.completions.create({
      //   model: this.model,
      //   messages: formattedMessages,
      //   temperature: this.config.temperature,
      //   max_tokens: this.config.maxTokens,
      //   tools,
      //   tool_choice: toolChoice,
      //   top_p: this.config.topP,
      // });

      if (controller.signal.aborted) {
        throw new Error('Request aborted');
      }

      this.cleanupRequest(requestId);
      return { content: '', tool_calls: [] }; // TODO: 返回实际的响应内容
    } catch (error: unknown) {
      this.cleanupRequest(requestId);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorName = error instanceof Error ? error.name : 'Unknown';

      if (errorName === 'AbortError' || errorMessage.includes('aborted')) {
        return { content: '' };
      }
      throw new Error(
        `Failed to get tool response from SiliconFlow: ${errorMessage}`,
      );
    }
  }

  /**
   * Send a message to the LLM and get a streaming response
   */
  async *askLLMTextStream({
    messages,
    requestId,
  }: {
    messages: Message[];
    requestId: string;
  }): AsyncGenerator<string> {
    try {
      const formattedMessages = this.formatMessages(messages);
      const controller = new AbortController();
      this.activeRequests.set(requestId, controller);

      // TODO: 实现实际的 SiliconFlow API 流式调用
      // const stream = await this.client.chat.completions.create({
      //   model: this.model,
      //   messages: formattedMessages,
      //   temperature: this.config.temperature,
      //   max_tokens: this.config.maxTokens,
      //   top_p: this.config.topP,
      //   stream: true,
      // });

      // for await (const chunk of stream) {
      //   if (controller.signal.aborted) {
      //     break;
      //   }
      //   yield chunk.choices[0]?.delta?.content || '';
      // }

      this.cleanupRequest(requestId);
    } catch (error: unknown) {
      this.cleanupRequest(requestId);
      if (
        error instanceof Error &&
        (error.name === 'AbortError' || error.message.includes('aborted'))
      ) {
        return;
      }
      throw new Error(
        `Failed to get stream response from SiliconFlow: ${error}`,
      );
    }
  }
}
