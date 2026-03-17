
class Expense {
    constructor(description, amount, category, date = new Date()) {
        this.id = Date.now() + Math.floor(Math.random() * 1000);
        this.description = description;
        this.amount = parseFloat(amount);
        this.category = category;
        this.date = date;
    }
}


class ExpenseTracker {
    constructor() {
        this.expenses = this.#loadFromStorage() || [];
    }

    addExpense(expense) {
        this.expenses = [...this.expenses, expense];
        this.#saveToStorage();
    }

    removeExpense(id) {
        this.expenses = this.expenses.filter(exp => exp.id !== id);
        this.#saveToStorage();
    }

    getAllExpenses() {
        return [...this.expenses];
    }

    getTotalForDay(date = new Date()) {
        const targetDay = date.toDateString();
        return this.expenses
            .filter(exp => new Date(exp.date).toDateString() === targetDay)
            .reduce((sum, exp) => sum + exp.amount, 0);
    }

    filterByCategory(category) {
        if (category === 'All') return this.getAllExpenses();
        return this.expenses.filter(exp => exp.category === category);
    }


    addMultipleExpenses(...expenses) {
        expenses.forEach(exp => this.addExpense(exp));
    }

    #saveToStorage() {
        localStorage.setItem('expenses', JSON.stringify(this.expenses));
    }

    #loadFromStorage() {
        const stored = localStorage.getItem('expenses');
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return parsed.map(e => ({ ...e, date: new Date(e.date) }));
    }
}

if (typeof window !== 'undefined' && window.document) {
    const tracker = new ExpenseTracker();

    const descInput = document.getElementById('desc');
    const amountInput = document.getElementById('amount');
    const categorySelect = document.getElementById('category');
    const addBtn = document.getElementById('addBtn');
    const filterSelect = document.getElementById('filterCategory');
    const expensesDiv = document.getElementById('expensesList');
    const totalSpan = document.getElementById('totalDisplay');
    const errorP = document.getElementById('formError');

    function render() {
        const filter = filterSelect.value;
        let expensesToShow = tracker.filterByCategory(filter);
        expensesToShow.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (expensesToShow.length === 0) {
            expensesDiv.innerHTML = `<p class="text-gray-400 text-center py-4">No expenses ${filter !== 'All' ? 'in this category' : ''}</p>`;
        } else {
            expensesDiv.innerHTML = expensesToShow.map(exp => {
                const { id, description, amount, category, date } = exp;
                const dateStr = new Date(date).toLocaleDateString();
                return `
                    <div class="expense-item flex items-center justify-between bg-white border p-3 rounded-lg shadow-sm" data-id="${id}">
                        <div class="flex-1">
                            <span class="font-medium">${description}</span>
                            <span class="text-sm text-gray-500 ml-2">(${category})</span>
                            <div class="text-xs text-gray-400">${dateStr}</div>
                        </div>
                        <div class="flex items-center gap-4">
                            <span class="font-semibold text-green-700">${amount.toFixed(2)} €</span>
                            <button class="delete-btn text-red-500 hover:text-red-700 text-xl leading-5" data-id="${id}">&times;</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const todayTotal = tracker.getTotalForDay();
        totalSpan.textContent = todayTotal.toFixed(2);
    }

    addBtn.addEventListener('click', () => {
        const description = descInput.value.trim();
        const amount = amountInput.value.trim();
        const category = categorySelect.value;

        if (!description || !amount || parseFloat(amount) <= 0) {
            errorP.textContent = 'Please enter a description and a positive amount.';
            errorP.classList.remove('hidden');
            return;
        }
        errorP.classList.add('hidden');

        const newExpense = new Expense(description, amount, category);
        tracker.addExpense(newExpense);

        descInput.value = '';
        amountInput.value = '';
        categorySelect.value = 'Food';
        render();
    });

    expensesDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = Number(e.target.dataset.id);
            tracker.removeExpense(id);
            render();
        }
    });

    filterSelect.addEventListener('change', render);
    render();
}


if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Expense, ExpenseTracker };
}