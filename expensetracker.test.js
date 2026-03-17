const { Expense, ExpenseTracker } = require('../script');

beforeEach(() => {
    let store = {};
    global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
});

describe('ExpenseTracker', () => {
    let tracker;

    beforeEach(() => {
        tracker = new ExpenseTracker();
    });

    test('addExpense should add an expense', () => {
        const exp = new Expense('Lunch', 12.5, 'Food', new Date('2025-01-01'));
        tracker.addExpense(exp);
        expect(tracker.getAllExpenses().length).toBe(1);
        expect(tracker.getAllExpenses()[0].description).toBe('Lunch');
    });

    test('removeExpense should remove by id', () => {
        const exp1 = new Expense('Bus', 2.3, 'Transport');
        const exp2 = new Expense('Coffee', 4.5, 'Food');
        tracker.addExpense(exp1);
        tracker.addExpense(exp2);
        tracker.removeExpense(exp1.id);
        expect(tracker.getAllExpenses().length).toBe(1);
        expect(tracker.getAllExpenses()[0].description).toBe('Coffee');
    });

    test('getTotalForDay should sum only today\'s expenses', () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        tracker.addExpense(new Expense('Today lunch', 15, 'Food', today));
        tracker.addExpense(new Expense('Today coffee', 3.5, 'Food', today));
        tracker.addExpense(new Expense('Yesterday dinner', 22, 'Food', yesterday));

        expect(tracker.getTotalForDay(today)).toBe(18.5);
    });

    test('filterByCategory returns only matching category', () => {
        tracker.addExpense(new Expense('Uber', 9, 'Transport', new Date()));
        tracker.addExpense(new Expense('Popcorn', 5, 'Entertainment', new Date()));
        tracker.addExpense(new Expense('Pizza', 20, 'Food', new Date()));

        const filtered = tracker.filterByCategory('Food');
        expect(filtered.length).toBe(1);
        expect(filtered[0].description).toBe('Pizza');
    });

    test('filterByCategory("All") returns all expenses', () => {
        tracker.addExpense(new Expense('Uber', 9, 'Transport'));
        tracker.addExpense(new Expense('Pizza', 20, 'Food'));
        expect(tracker.filterByCategory('All').length).toBe(2);
    });
});