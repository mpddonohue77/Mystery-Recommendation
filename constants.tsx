
import { QuickPick } from './types';

export const QUICK_PICKS: QuickPick[] = [
  { label: 'Psychological Thrillers', query: 'psychological thrillers' },
  { label: 'Classic Whodunnits', query: 'classic whodunnits' },
  { label: 'Scandi Noir', query: 'Scandinavian noir' },
  { label: 'Gothic Mystery', query: 'gothic mysteries' },
  { label: 'Techno Thrillers', query: 'techno thrillers' },
  { label: 'True Crime Feel', query: 'true crime style fiction' },
  { label: 'Legal Thrillers', query: 'legal thrillers' },
  { label: 'Cozy Mysteries', query: 'cozy mysteries' },
  { label: 'Hardboiled Detective', query: 'hardboiled detective fiction' },
  { label: 'Locked Room Mystery', query: 'locked room mystery' },
  { label: 'Police Procedural', query: 'police procedurals' },
  { label: 'Historical Mystery', query: 'historical mystery fiction' },
  { label: 'Supernatural Thriller', query: 'supernatural thrillers' },
  { label: 'Spy & Espionage', query: 'spy and espionage fiction' },
  { label: 'Medical Thrillers', query: 'medical thrillers' },
  { label: 'Domestic Suspense', query: 'domestic suspense' }
];

const BASE_INSTRUCTION = `You are a world-class literary archivist specializing in the darker corners of fiction. Your knowledge spans from the Golden Age of Detectives to modern international noir. 

CRITICAL RULE: NEVER include the author or the specific book provided in the user's query in your results. 
- If they search for "Dennis Lehane", you must recommend books by OTHER authors like him (e.g., George Pelecanos, S.A. Cosby), but NEVER a book by Dennis Lehane himself.
- If they search for "Gone Girl", do not recommend "Gone Girl" or any other Gillian Flynn books.
The goal is discovery of NEW titles, not confirming what they already know.

When given a prompt, provide exactly 6 REAL books.

For each book, provide:
1. title
2. author
3. description: A compelling, atmospheric one-sentence summary.
4. reason: Why this specific title is a masterpiece for this request.
5. publishedYear
6. isbn: Valid ISBN-13.
7. coverPrompt: A detailed visual description for an AI generator (noir, cinematic, dark, symbolic).`;

export const STANDARD_INSTRUCTION = `${BASE_INSTRUCTION}
MODE: THE ESSENTIALS. Focus on well-regarded masterpieces, bestsellers, and the defining books of the genre. These are the books that every fan should have read.`;

export const DEEP_CUTS_INSTRUCTION = `${BASE_INSTRUCTION}
MODE: DEEP CUTS. Avoid the "obvious" bestsellers. Focus on hidden gems, translated mysteries (e.g., Japanese honkaku, French noir), indie-press titles, forgotten classics, and cult favorites. Surprising the user with your depth of knowledge is the goal.`;
