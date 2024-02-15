const savedData = localStorage.getItem("calculator");
let calculatorData;
if (savedData) {
    calculatorData = JSON.parse(savedData);
}
else {
    calculatorData = {
        history: [],
        theme: null,
    };
}
export function save(key, data) {
    calculatorData[key] = data;
    localStorage.setItem("calculator", JSON.stringify(calculatorData));
}
export function addHistoryEntry(entry) {
    calculatorData.history.unshift(entry);
}
export function get(prop) {
    return calculatorData[prop];
}
