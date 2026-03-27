// List of bad words / hate speech to filter
const badWords = [
    'hate', 'stupid', 'idiot', 'moron', 'dumb', 'ugly', 'scum', 'trash',
    'bastard', 'dick', 'cunt', 'fag', 'faggot', 'nigger',
    'nigga', 'whore', 'slut', 'retard','fuck','hell','damn','bitch','motherfucker',
    'son of a bitch','ass','asshole','dickhead','dog'

]; // Add any other required words to this list

/**
 * Checks if a given text contains any bad words.
 * @param {string} text - The input text to check.
 * @returns {boolean} - True if it contains a bad word, otherwise false.
 */
export const containsBadWords = (text) => {
    if (!text) return false;

    const lowerText = text.toLowerCase();

    // Check if any bad word is found
    // We use word boundaries to avoid matching parts of innocent words 
    // Example: "asshole" matched, but "classic" not matched by "ass" (if 'ass' was in the list)
    return badWords.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(lowerText);
    });
};
