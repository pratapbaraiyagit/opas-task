import api from './client';

interface AIResponse {
  actionItems: string[];
}

export const generateActionItems = async (content: string): Promise<AIResponse> => {
  const response = await api.post('/ai/action-items', { content });
  return response.data.data;
};
