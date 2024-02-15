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
    const lastEntry = calculatorData.history[0];
    const lastId = lastEntry !== undefined ? lastEntry.id : -1;
    const newEntry = Object.assign(Object.assign({}, entry), { id: lastId + 1 });
    const newHistory = [newEntry, ...calculatorData.history];
    save("history", newHistory);
}
export function get(prop) {
    return calculatorData[prop];
}
