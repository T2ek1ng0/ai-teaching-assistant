const API_BASE_URL_KEY = 'llm-api-base-url';
const API_KEY_KEY = 'llm-api-key';

export const callLLM = async (messages) => {
  const apiBaseUrl = localStorage.getItem(API_BASE_URL_KEY);
  const apiKey = localStorage.getItem(API_KEY_KEY);

  if (!apiBaseUrl || !apiKey) {
    return {
      success: false,
      error: 'API尚未配置。请前往“API设置”页面完成配置。',
    };
  }

  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo', // 使用qwen-turbo作为DashScope的推荐模型
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(`API 请求失败，状态码：${response.status}. ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;

    if (!reply) {
      throw new Error('API返回的数据格式不正确，未能获取回复内容。');
    }

    return {
      success: true,
      data: reply,
    };
  } catch (error) {
    console.error('LLM call failed:', error);
    return {
      success: false,
      error: error.message || '与AI服务通信时发生未知错误。',
    };
  }
};