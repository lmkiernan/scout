export async function askGeminiAboutLetterboxd(json: object, prompt: string, apiKey: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  const userPrompt = `Here is my Letterboxd data: ${JSON.stringify(json)}. ${prompt}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: userPrompt }] }
      ]
    }),
  });
  const data = await res.json();
  // Gemini's response is in data.candidates[0].content.parts[0].text
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? (data.error?.message || 'No response');
}
