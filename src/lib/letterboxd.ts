// src/services/letterboxd.ts
import { XMLParser } from 'fast-xml-parser';

export type FilmRatingMap = Record<string, number | null>;

export async function fetchFilmRatings(username: string): Promise<FilmRatingMap> {
  const url = `https://letterboxd.com/${username}/rss/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch RSS (${res.status})`);
  const xml = await res.text();

  // parse RSS → JS object
  const parser = new XMLParser({
    ignoreAttributes: false,
    parseTagValue: true,
    trimValues: true,
  });
  const parsed = parser.parse(xml);

  // navigate into rss → channel → item[]
  const items = parsed?.rss?.channel?.item ?? [];
  const map: FilmRatingMap = {};

  items.forEach((item: any) => {
    // Use the new fields from the RSS feed
    const title: string = item['letterboxd:filmTitle'] || item.title;
    const year: string = item['letterboxd:filmYear'] || '';
    const ratingStr: string = item['letterboxd:memberRating'];
    const rating = ratingStr ? parseFloat(ratingStr) : null;

    // Use title + year as key to avoid collisions
    map[`${title} (${year})`] = rating;
  });

  return map;
}
