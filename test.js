const data_1 = [
  { id: 1, name: "A", active: true },
  { id: 2, name: "B", active: false },
  { id: 3, name: "C", active: true },
];

const result_1 = data_1.filter((item) => item.active);
console.log("Result Soal 1", result_1, "\n");

const data_2 = [
  { id: 1, name: "Keyboard", price: 300_000 },
  { id: 2, name: "Mouse", price: 150_000 },
  { id: 3, name: "Monitor", price: 2_500_000 },
];

const result_2 = data_2
  .filter((item) => item.price >= 300_000)
  .map((item) => {
    const { id, name } = item;
    return { id, name };
  });
console.log("Result Soal 2", result_2, "\n");

const data_3 = [
  { id: 1, status: "PENDING" },
  { id: 2, status: "PAID" },
  { id: 3, status: "PENDING" },
  { id: 4, status: "CANCELLED" },
];

let result_3 = {
    PENDING: [],
    PAID: [],
    CANCELLED: []
}

data_3.forEach((item) => {
    switch (item.status) {
        case "PENDING":
            result_3.PENDING.push(item.id);
            break;
        case "PAID":
            result_3.PAID.push(item.id);
            break;
        case "CANCELLED":
            result_3.CANCELLED.push(item.id);
            break;
        default:
            break;
    }
})
console.log("Result Soal 3", result_3, "\n");

const data_4 = [
  { id: 1, amount: 500000, status: "PENDING" },
  { id: 2, amount: 300000, status: "PAID" },
  { id: 3, amount: 700000, status: "PAID" },
  { id: 4, amount: 200000, status: "CANCELLED" },
  { id: 5, amount: 450000, status: "PAID" },
];

const result_4 = data_4.filter((item) => item.status === "PAID").sort((a, b) => b.amount - a.amount);

console.log("Result Soal 4", result_4, "\n");

const data_5 = [
  { user: "A", action: "LOGIN" },
  { user: "A", action: "LOGOUT" },
  { user: "B", action: "LOGIN" },
  { user: "A", action: "LOGIN" },
];

let result_5 = {
    A: 0,
    B: 0
}

data_5.forEach((item) => {
    if (item.action !== "LOGIN") return
    
    switch (item.user) {
        case "A":
            result_5.A += 1;
            break;
        case "B":
            result_5.B += 1;
            break;
        default:
            break;
    }
})

console.log("Result Soal 5", result_5, "\n");