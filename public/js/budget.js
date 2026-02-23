document.addEventListener("DOMContentLoaded", () => {

    const incomeInput = document.getElementById("income");
    const fixedExpenseInput = document.getElementById("fixedExpense");
    const dailyExpenseInput = document.getElementById("dailyExpense");
    const savingsGoalInput = document.getElementById("savingsGoal");

    const calculateBtn = document.getElementById("calculateBudget");
    const resultContainer = document.getElementById("budgetResult");

    let budgetChartInstance = null;

    calculateBtn.addEventListener("click", () => {

        const income = parseFloat(incomeInput.value);
        const fixedExpense = parseFloat(fixedExpenseInput.value) || 0;
        const dailyExpense = parseFloat(dailyExpenseInput.value) || 0;
        const savingsGoal = parseFloat(savingsGoalInput.value) || 0;

        if (!income || income <= 0) {
            resultContainer.innerText = "Please enter a valid monthly income.";
            return;
        }

        const monthlyDailyExpense = dailyExpense * 30;
        const totalExpenses = fixedExpense + monthlyDailyExpense;
        const remainingBalance = income - totalExpenses - savingsGoal;

        resultContainer.innerHTML = `
            <p><strong>Total Monthly Expenses:</strong> ₹ ${totalExpenses.toFixed(2)}</p>
            <p><strong>Savings Goal:</strong> ₹ ${savingsGoal.toFixed(2)}</p>
            <p><strong>Remaining Balance:</strong> ₹ ${remainingBalance.toFixed(2)}</p>
        `;

        // Chart logic
        if (budgetChartInstance) {
            budgetChartInstance.destroy();
        }

        const ctx = document.getElementById("budgetChart").getContext("2d");

        budgetChartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Fixed Expenses", "Daily Expenses (Monthly)", "Savings Goal"],
                datasets: [{
                    data: [fixedExpense, monthlyDailyExpense, savingsGoal],
                    backgroundColor: [
                        "#36A2EB",
                        "#FF9F40",
                        "#4BC0C0"
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });

    });

});