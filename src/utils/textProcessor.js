import { callLLM } from './llm';

// 定义一个安全的文本块大小（以字符为单位），以避免超出LLM的token限制
const CHUNK_SIZE = 3000;

/**
 * 将长文本分割成指定大小的文本块数组。
 * @param {string} text 要分割的完整文本。
 * @param {number} size 每个文本块的大小。
 * @returns {string[]} 文本块数组。
 */
const splitTextIntoChunks = (text, size = CHUNK_SIZE) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.substring(i, i + size));
  }
  return chunks;
};

/**
 * 通过将大段文本分块、逐块分析、最后综合结果的方式来处理文本。
 *
 * @param {string} fullText 要处理的完整文本。
 * @param {string} chunkSystemPrompt 用于处理单个文本块的系统提示。
 * @param {string} finalSystemPrompt 用于将所有块的结果综合成最终输出的系统提示。
 * @param {function(number, number): void} [onProgress] 可选的回调函数，用于报告进度 (当前块, 总块数)。
 * @returns {Promise<any>} 返回一个Promise，解析为LLM返回的最终解析后的JSON结果。
 */
export const processTextInChunks = async (fullText, chunkSystemPrompt, finalSystemPrompt, onProgress) => {
  const textChunks = splitTextIntoChunks(fullText);
  const chunkSummaries = [];
  const totalChunks = textChunks.length;

  // 步骤 1: 逐个处理每个文本块
  for (let i = 0; i < totalChunks; i++) {
    const chunk = textChunks[i];
    if (onProgress) {
      onProgress(i + 1, totalChunks); // 报告进度
    }

    const chunkLlmResponse = await callLLM([
      { role: 'system', content: chunkSystemPrompt },
      { role: 'user', content: `请分析以下文本片段：\n\n${chunk}` },
    ]);

    if (chunkLlmResponse.success) {
      chunkSummaries.push(chunkLlmResponse.data);
    } else {
      console.error(`处理文本块 ${i + 1}/${totalChunks} 失败:`, chunkLlmResponse.error);
      // 即使某个块失败，也继续处理下一个，以尽可能多地获取信息
    }
  }

  if (chunkSummaries.length === 0) {
    throw new Error('所有文本块都未能成功处理。');
  }

  // 步骤 2: 将所有块的摘要结果进行最终的综合分析
  if (onProgress) {
    onProgress(totalChunks, totalChunks); // 更新进度为完成初步分析
  }
  const combinedSummaries = chunkSummaries.join('\n\n---\n\n');
  const finalLlmResponse = await callLLM([
    { role: 'system', content: finalSystemPrompt },
    { role: 'user', content: `请基于以下从原始文档各部分提取的要点，进行最终的整合与分析：\n\n${combinedSummaries}` },
  ]);

  if (finalLlmResponse.success) {
    try {
      return JSON.parse(finalLlmResponse.data);
    } catch (e) {
      console.error("解析最终LLM响应失败:", e);
      throw new Error("AI返回的最终整合数据格式不正确，无法解析。");
    }
  } else {
    throw new Error(`最终整合分析失败: ${finalLlmResponse.error}`);
  }
};