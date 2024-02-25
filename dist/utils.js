export function lastItem(arr) {
    return arr[arr.length - 1];
}
export function lastIndex(arr) {
    return arr.length - 1;
}
export function spliceString(targetString, start, deleteCount, insertedString) {
    if (start < 0) {
        start = targetString.length + start;
        if (start < 0)
            start = 0;
    }
    return (targetString.slice(0, start) +
        insertedString +
        targetString.slice(start + deleteCount));
}
export function splitAtIndex(str, index, includeCharacterAtIndex = true) {
    if (includeCharacterAtIndex) {
        return [str.slice(0, index), str[index], str.slice(index + 1)];
    }
    else {
        return [str.slice(0, index), str.slice(index + 1)];
    }
}
export function formatNumbers(exp) {
    return exp.replace(/([^.\d]|^)(\d+)/g, (_, chBefore, number) => {
        return (chBefore || "") + addChBetween(number, 3, ",", true);
    });
}
export function addChBetween(str, step, ch, fromEnd) {
    if (step < 0) {
        throw new RangeError(`Invalid step: ${step}. Step must be zero or bigger.`);
    }
    let newStr = "", chCount = 0;
    if (fromEnd) {
        for (let i = str.length - 1; i >= 0; i--) {
            chCount++;
            newStr = str[i] + newStr;
            if (chCount % step === 0 && i !== 0)
                newStr = ch + newStr;
        }
    }
    else {
        for (let i = 0; i < str.length; i++) {
            chCount++;
            newStr += str[i];
            if (chCount % step === 0 && i !== str.length - 1)
                newStr += ch;
        }
    }
    return newStr;
}
