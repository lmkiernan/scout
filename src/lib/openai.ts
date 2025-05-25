export async function askChatGPTAboutLetterboxd(json: object, prompt: string, apiKey: string) {
  const systemPrompt = `You are a movie assistant. Here is a user's Letterboxd data: ${JSON.stringify(json)}. ${prompt}`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt }
      ],
      max_tokens: 1000,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? 'No response';
}
