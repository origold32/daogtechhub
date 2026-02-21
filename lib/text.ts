export const fileTextColors = [
  "text-[#3B82F6]", // Blue
  "text-[#10B981]", // Green
  "text-[#8B5CF6]", // Purple
  "text-[#EC4899]", // Pink
  "text-[#EF4444]", // Red
  "text-[#F97316]", // Orange
];

export function extractFirstLetters(
  inputString?: string,
  limit: number = Infinity
): string {
  if (!inputString?.trim() || limit <= 0) {
    return ""; // Return empty string for empty input or non-positive limit
  }

  const words: string[] = inputString.trim().split(" ");
  let result: string = "";

  for (let i = 0; i < words.length && i < limit; i++) {
    result += words[i].charAt(0).toUpperCase();
  }

  return result;
}

export function sentenceCase(
  text: string,
  excludeWords?: boolean,
  limit: number = -1,
  additionalExcludedWords: string[] = []
): string {
  if (!text) return "";

  let words = text.split(" ");
  if (limit > 0) words = words.slice(0, limit);

  if (excludeWords) {
    const defaultExcludedWords = [
      "a",
      "an",
      "the",
      "of",
      "for",
      "and",
      "but",
      "or",
      "nor",
      "on",
      "at",
      "to",
      "by",
      "with",
      "as",
    ];
    const excludedWords = [...defaultExcludedWords, ...additionalExcludedWords];

    const capitalizedWords = words.map((word, idx) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      const shouldCap = idx === 0 || !excludedWords.includes(lower);
      return shouldCap ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    });

    return capitalizedWords.join(" ");
  }

  // excludeWords == false → Title Case every word
  return words
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ");
}

// Example usage:
const inputText: string = "love smith IS aN exAMPle OF SenTENCE";
console.log(sentenceCase(inputText)); // Output: Love Smith is an Example of Sentence
console.log(sentenceCase(inputText, false)); // Output: Love Smith Is An Example Of Sentence
console.log(sentenceCase(inputText, true, 3)); // Output: Love Smith Is An
console.log(sentenceCase(inputText, true, -1, ["is"])); // Output: Love Smith is an Example of Sentence

export function pascalToSentence(pascalStr: string): string {
  // Add space before each capital letter, but avoid adding space at the start
  const sentence = pascalStr.replace(/([A-Z])/g, " $1").trim();
  // Capitalize the first letter and convert the rest to lower case
  return sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
}

// Example usage
const examples = ["fullName", "dateOfBirth", "businessAddress"];
