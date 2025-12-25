export const removeDuplicatesWithKey = (array, key) => {
    if(array.length === 0) return [];
    const unique = new Set();
    return array.filter(obj => {
        const value = key ? obj[key] : JSON.stringify(obj);
        if (unique.has(value)) {
            return false;
        }
        unique.add(value);
        return true;
    });
}