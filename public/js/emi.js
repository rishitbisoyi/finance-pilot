document.addEventListener("DOMContentLoaded", () => {

    const loanInput = document.getElementById("loanAmount");
    const rateInput = document.getElementById("interestRate");
    const tenureInput = document.getElementById("tenure");
    const extraInput = document.getElementById("extraPayment");

    const calculateBtn = document.getElementById("calculateEMI");
    const resultContainer = document.getElementById("emiResult");

    let emiChartInstance = null;

    function calculateEMIValue(loanAmount, interestRate, tenure, extraPayment) {

        const monthlyRate = interestRate / 12 / 100;
        const totalMonths = tenure * 12;

        const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                    (Math.pow(1 + monthlyRate, totalMonths) - 1);

        const finalEMI = emi + extraPayment;
        const totalPayment = finalEMI * totalMonths;
        const totalInterest = totalPayment - loanAmount;

        return {
            finalEMI,
            totalPayment,
            totalInterest,
            totalMonths
        };
    }

    calculateBtn.addEventListener("click", () => {

        const loanAmount = parseFloat(loanInput.value);
        const interestRate = parseFloat(rateInput.value);
        const tenure = parseFloat(tenureInput.value);
        const extraPayment = parseFloat(extraInput.value) || 0;

        if (!loanAmount || !interestRate || !tenure) {
            resultContainer.innerText = "Please enter valid values.";
            return;
        }

        const emiData = calculateEMIValue(
            loanAmount,
            interestRate,
            tenure,
            extraPayment
        );

        // Show result
        resultContainer.innerHTML = `
            <p>Monthly EMI: ₹ ${emiData.finalEMI.toFixed(2)}</p>
            <p>Total Payment: ₹ ${emiData.totalPayment.toFixed(2)}</p>
            <p>Total Interest: ₹ ${emiData.totalInterest.toFixed(2)}</p>
        `;

        // Destroy previous chart if exists
        if (emiChartInstance) {
            emiChartInstance.destroy();
        }

        const ctx = document.getElementById("emiChart").getContext("2d");

        emiChartInstance = new Chart(ctx, {
            type: "pie",
            data: {
                labels: ["Principal Amount", "Total Interest"],
                datasets: [{
                    data: [loanAmount, emiData.totalInterest],
                    backgroundColor: [
                        "#4CAF50",
                        "#FF6384"
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