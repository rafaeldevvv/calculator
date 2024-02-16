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
