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

/**
 * Splits a given string into two parts on the provided index.
 *
 * @param str The string to split.
 * @param index The index at which to split the given string.
 * @param includeCharacterAtIndex Whether or not to include that character at the index itself in the resulting array.
 * @returns An array of two or three items. It has two items if the `includeCharacterAtIndex` parameter is false, and
 * three items if the `includeCharacterAtIndex` parameter is true.
 *
 * @example
 * console.log(splitAtIndex("123456", 3, true));
 * --> ["123", "4", "56"]
 *
 * console.log(splitAtIndex("123456", 3));
 * --> ["123", "56"]
 */
export function splitAtIndex(
  str: string,
  index: number,
  includeCharacterAtIndex = true
) {
  if (includeCharacterAtIndex) {
    return [str.slice(0, index), str[index], str.slice(index + 1)];
  } else {
    return [str.slice(0, index), str.slice(index + 1)];
  }
}

/**
 * Formats the numbers in an expression.
 *
 * @param exp - The expression.
 * @returns - An expression with formatted numbers.
 *
 * @example
 * formatNumbers("20000+56780");
 * -> "20,000+56,780";
 */
export function formatNumbers(exp: string) {
  return exp.replace(/([^.\d]|^)(\d+)/g, (_, chBefore, number) => {
    return (chBefore || "") + addChBetween(number, 3, ",", true);
  });
}

/**
 * Adds a string between characters in a string depending on the step passed in.
 *
 * @param str A string to add the other string between the characters.
 * @param step How many characters should be skipped to add the specified string.
 * @param ch The string you want to add between characters in a string.
 * @param fromEnd Whether or not the string should be added from the end of the string.
 * @throws If the step is lower than 0.
 */
export function addChBetween(
  str: string,
  step: number,
  ch: string,
  fromEnd?: boolean
) {
  if (step < 0) {
    throw new RangeError(`Invalid step: ${step}. Step must be zero or bigger.`);
  }

  let newStr = "",
    chCount = 0;
  if (fromEnd) {
    for (let i = str.length - 1; i >= 0; i--) {
      chCount++;
      newStr = str[i] + newStr;
      if (chCount % step === 0 && i !== 0) newStr = ch + newStr;
    }
  } else {
    for (let i = 0; i < str.length; i++) {
      chCount++;
      newStr += str[i];
      if (chCount % step === 0 && i !== str.length - 1) newStr += ch;
    }
  }

  return newStr;
}
