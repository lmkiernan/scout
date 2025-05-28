function cleanTitle(title: string) {
  // Remove anything in parentheses and trim
  const cleaned = title.replace(/\s*\(.*?\)\s*/g, '').trim();
  console.log('OMDb cleaned title:', cleaned);
  return cleaned;
}

export async function getOmdbPoster(title: string) {
  const cleanedTitle = cleanTitle(title);
  const url = `https://www.omdbapi.com/?apikey=APIKEYHERE&t=${encodeURIComponent(cleanedTitle)}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log('OMDb API response:', data);
  if (data && data.Poster && data.Poster !== 'N/A') {
    return data.Poster;
  }
  return null;
}