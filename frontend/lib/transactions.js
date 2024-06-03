class Transactions {
    constructor() {
        this.transactions = [];
    }

    addTransactions(type, payload) {
        this.transactions.push({ type, payload });
    }

    getTransactions() {
        return this.transactions;
    }
}