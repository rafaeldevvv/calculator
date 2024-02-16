export function lastItem<Type>(arr: Type[]): Type {
  return arr[arr.length - 1];
}

export function lastIndex(arr: any[]) {
  return arr.length - 1;
}

/**
 * Inserts a string into another string, optionally deleting
 * characters where it is inserted.
 *
 * @param targetString - The string to insert the other string in.
 * @param start - Where to start adding the new string.
 * @param deleteCount - How many characters to delete where the string is inserted.
 * @param insertedString - The string to be inserted.
 * @returns - A string with the new string string added, optionally with characters removed.
 *
 * @example
 * const cdog = spliceString("cat", 1, 2, "dog");
 * console.log(cdog);
 * // -> "cdog"
 */
export function spliceString(
  targetString: string,
  start: number,
  deleteCount: number,
  insertedString: string
) {
  if (start < 0) {
    start = targetString.length + start;
    if (start < 0) start = 0;
  }

  return (
    targetString.slice(0, start) +
    insertedString +
    targetString.slice(start + deleteCount)
  );
}