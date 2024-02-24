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
        const n = Number(number);
        return (chBefore || "") + n.toLocaleString("en");
    });
}
