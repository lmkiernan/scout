export async function askChatGPTAboutLetterboxd(json: any, prompt: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer APIKEYHERE`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a movie recommendation engine.' },
        { role: 'user', content: `${prompt}\n\n${JSON.stringify(json)}` }
      ]
    })
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('❌ OpenAI error:', data);
    throw new Error(data?.error?.message || 'Unknown error from OpenAI');
  }

  return data.choices?.[0]?.message?.content || 'No response from OpenAI';
}

