/* the array that stores the data*/
let transactions = [];
let isEditing = false;
let editingIndex = -1;
let currentYear = new Date().getFullYear(); // Default to current year
let currentMonth = null; // null means all months
// ==============================================
// FILTER FUNCTIONS
// ==============================================

function getFilteredTransactions() {
    return transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth(); // 0-11 (Jan-Dec)
        
        // Filter by year
        if (transactionYear !== currentYear) {
            return false;
        }
        
        // Filter by month if selected
        if (currentMonth !== null && transactionMonth !== currentMonth) {
            return false;
        }
        
        return true;
    });
}

function setYear(year) {
    currentYear = parseInt(year) || new Date().getFullYear();
    displayTransactions();
}

function setMonth(monthIndex) {
    currentMonth = monthIndex;
    displayTransactions();
}

function clearMonthFilter() {
    currentMonth = null;
    displayTransactions();
}
// ==============================================
// LOCAL STORAGE FUNCTIONS
// ==============================================

function saveTransactions(){
    localStorage.setItem('transactions',JSON.stringify(transactions));
}

function loadTransactions(){
    const saved = localStorage.getItem('transactions');
    if(saved)
        transactions = JSON.parse(saved);
}
// Year input event listener
document.querySelector('.year-input').addEventListener('change', function(event) {
    const year = event.target.value;
    if (year && year.length === 4) {
        setYear(year);
    }
});

// Also add input event for real-time updates (optional)
document.querySelector('.year-input').addEventListener('input', function(event) {
    const year = event.target.value;
    if (year && year.length === 4) {
        setYear(year);
    }
});
// Month click event listeners
document.querySelectorAll('.month').forEach((monthElement, index) => {
    monthElement.addEventListener('click', function() {
        // Remove active class from all months
        document.querySelectorAll('.month').forEach(m => {
            m.style.backgroundColor = '';
            m.style.color = 'white';
        });
        
        // Add active class to clicked month
        this.style.backgroundColor = 'white';
        this.style.color = 'rgb(116, 44, 211)';
        
        setMonth(index); // 0-11 for Jan-Dec
    });
});

// Add double-click to clear month filter
document.querySelectorAll('.month').forEach((monthElement, index) => {
    monthElement.addEventListener('dblclick', function() {
        // Remove active class from all months
        document.querySelectorAll('.month').forEach(m => {
            m.style.backgroundColor = '';
            m.style.color = 'white';
        });
        
        clearMonthFilter();
    });
});

// ==============================================
// TOTAL CALCULATION FUNCTIONS
// ==============================================

function resetEditingState() {
    isEditing = false;
    editingIndex = -1;
    const addButton = document.querySelector('.add-button');
    addButton.textContent = 'Add';
    addButton.style.backgroundColor = ''; // Reset to original
    addButton.style.border = '';
}

function calculateTotal() {
    const filteredTransactions = getFilteredTransactions(); // Add this line
    let calculatedTotal = 0;
    
    filteredTransactions.forEach(transaction => { // Change to filteredTransactions
        if (transaction.side === 'Income') {
            calculatedTotal += parseInt(transaction.summ);
        } else if (transaction.side === 'Expense') {
            calculatedTotal -= parseInt(transaction.summ);
        }
    });
    return calculatedTotal;
}
function updateTotal() {
    const total = calculateTotal();
    document.querySelector('.balance-text').textContent = total + '$';
}

// ==============================================
// DISPLAY FUNCTIONS
// ==============================================

function displayTransactions(){
    const filteredTransactions = getFilteredTransactions();
    document.querySelector('.monthly-actions').innerHTML = '';
    
    filteredTransactions.forEach(transaction =>{
        document.querySelector('.monthly-actions').innerHTML += createTransactions(transaction);
    });
    
    updateTotal();
    updatePieChart();
    updatePieChartSecond();
    updatePieChartThird();
    
    // Update the year input display
    document.querySelector('.year-input').value = currentYear;
}
function createTransactions(transaction){
    const tagColor = {
        'Salary': 'rgb(84, 0, 194)',
        'Food':'rgb(116, 44, 211)',
        'Transport': 'rgb(151, 82, 241)',
        'Entertainment':'rgb(191, 143, 255)',
        'Shopping':'rgb(45, 45, 167)',
        'Bills': 'rgb(91, 91, 241)',
        'Healthcare': 'rgb(133, 133, 241)',
        'Other':'rgb(50, 50, 255)'
    };

    return `
    <div class = "monthly-actions-element">
        <p class = "actions-tag action-text" style = "background-color: ${tagColor[transaction.tag] || 'white'}">${transaction.tag}</p>
        <p class = "actions-description action-text">${transaction.description}</p>
        <p class = "${transaction.side === 'Expense' ? 'money-red actions-money action-text' : 'money-green actions-money action-text'}"> ${transaction.side === 'Expense' ? '-' : '+'} ${transaction.summ}$ </p>
        <p class = "actions-date action-text"> ${transaction.date}</p>
        <div class = "buttons-div">
            <button class = "change-button">
                <img src = "icons/change-black.png" class = "change-icon">
            </button>
            <button class = "delete-button">
                <img src = "icons/delete-black.png" class = "delete-icon">
            </button>
        </div>
    </div>
    `;
}

// ==============================================
// DELETE & EDIT FUNCTIONS
// ==============================================

function changeTransaction(transactionElement) {
    if (isEditing) {
        const addButton = document.querySelector('.add-button');
        addButton.style.border = "2px solid red";
        setTimeout(function() {
            addButton.style.border = "";
        }, 2000);
        return;
    }
    
    // Find the index of this transaction
    const index = Array.from(transactionElement.parentElement.children).indexOf(transactionElement);
    
    if (index !== -1) {
        const transaction = transactions[index];
        
        // Set editing state
        isEditing = true;
        editingIndex = index;
        
        // Fill the form with current values
        document.querySelector('.description-input').value = transaction.description;
        document.querySelector('.tag-input').value = transaction.tag;
        document.querySelector('.side-input').value = transaction.side;
        document.querySelector('.money-input').value = transaction.summ;
        document.querySelector('.date-input').value = transaction.date;
        
        // Change add button to "Update" with visual feedback
        const addButton = document.querySelector('.add-button');
        addButton.textContent = 'Update';
        addButton.style.backgroundColor = '#ffa500'; // Orange to indicate editing
        addButton.style.border = "2px solid #ffa500";
    }
}
function deleteTransaction(transactionElement) {
    const index = Array.from(transactionElement.parentElement.children).indexOf(transactionElement);
    
    if (index !== -1) {
        // If deleting the transaction we're currently editing, reset editing state
        if (isEditing && index === editingIndex) {
            resetEditingState();
            // Also clear the form since we were editing this transaction
            document.querySelector('.description-input').value = '';
            document.querySelector('.tag-input').value = '';
            document.querySelector('.side-input').value = '';
            document.querySelector('.money-input').value = '';
            document.querySelector('.date-input').value = '';
        }
        
        // Remove from array
        transactions.splice(index, 1);
        
        // Update total, save and refresh display
        updateTotal();
        saveTransactions();
        displayTransactions();
    }
}
// ==============================================
// PIE CHART FUNCTIONS
// ==============================================

function updatePieChart() {
    
    const filteredTransactions = getFilteredTransactions(); 
    // Count only EXPENSE tags
    const tagCounts = {};
    let totalExpenses = 0;
    
    filteredTransactions.forEach(transaction => {
        if (transaction.side === 'Expense') {
            if (tagCounts[transaction.tag]) {
                tagCounts[transaction.tag]++;
            } else {
                tagCounts[transaction.tag] = 1;
            }
            totalExpenses++;
        }
    });

    // If no expenses, show empty chart
    if (totalExpenses === 0) {
        document.querySelector('.first-diagram').innerHTML = '<div class="pie-chart" style="background: #f0f0f0;"></div>';
        return;
    }

    // Calculate percentages based on expenses only
    const tags = Object.keys(tagCounts);
    const percentages = tags.map(tag => (tagCounts[tag] / totalExpenses) * 100);

    // Build conic-gradient CSS
    let accumulatedPercentage = 0;
    let gradientParts = [];
    
    tags.forEach((tag, index) => {
        const percentage = percentages[index];
        gradientParts.push(`${getTagColor(tag)} ${accumulatedPercentage}% ${accumulatedPercentage + percentage}%`);
        accumulatedPercentage += percentage;
    });

    const gradient = `conic-gradient(${gradientParts.join(', ')})`;
    
    // Build legend HTML (only for expenses)
    let legendHTML = '<div class="pie-legend">';
    tags.forEach((tag, index) => {
        const percentage = percentages[index];
        if (percentage >= 5) { // Only show significant segments
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${getTagColor(tag)}"></div>
                    <span class="legend-text">${tag} (${Math.round(percentage)}%)</span>
                </div>
            `;
        }
    });
    legendHTML += '</div>';

    // Update the diagram
document.querySelector('.first-diagram').innerHTML = `
        <div class="pie-chart" style="background: ${gradient};"></div>
    `;
}

function updatePieChartSecond() {
        const filteredTransactions = getFilteredTransactions(); 
    // Count only EXPENSE tags
    const tagCounts = {};
    let totalExpenses = 0;
    
    filteredTransactions.forEach(transaction => {
        if (transaction.side === 'Income') {
            if (tagCounts[transaction.tag]) {
                tagCounts[transaction.tag]++;
            } else {
                tagCounts[transaction.tag] = 1;
            }
            totalExpenses++;
        }
    });

    // If no expenses, show empty chart
    if (totalExpenses === 0) {
        document.querySelector('.second-diagram').innerHTML = '<div class="pie-chart-second" style="background: #f0f0f0;"></div>';
        return;
    }

    // Calculate percentages based on expenses only
    const tags = Object.keys(tagCounts);
    const percentages = tags.map(tag => (tagCounts[tag] / totalExpenses) * 100);

    // Build conic-gradient CSS
    let accumulatedPercentage = 0;
    let gradientParts = [];
    
    tags.forEach((tag, index) => {
        const percentage = percentages[index];
        gradientParts.push(`${getTagColor(tag)} ${accumulatedPercentage}% ${accumulatedPercentage + percentage}%`);
        accumulatedPercentage += percentage;
    });

    const gradient = `conic-gradient(${gradientParts.join(', ')})`;
    
    // Build legend HTML (only for expenses)
    let legendHTML = '<div class="pie-legend">';
    tags.forEach((tag, index) => {
        const percentage = percentages[index];
        if (percentage >= 5) { // Only show significant segments
            legendHTML += `
                <div class="legend-item">
                    <div class="legend-color" style="background-color: ${getTagColor(tag)}"></div>
                    <span class="legend-text">${tag} (${Math.round(percentage)}%)</span>
                </div>
            `;
        }
    });
    legendHTML += '</div>';

    // Update the diagram
document.querySelector('.second-diagram').innerHTML = `
        <div class="pie-chart-second" style="background: ${gradient};"></div>
    `;
}

// Helper function to get tag colors (reuse your existing colors)
function getTagColor(tag) {
    const tagColors = {
        'Salary': 'rgb(84, 0, 194)',
        'Food': 'rgb(116, 44, 211)',
        'Transport': 'rgb(151, 82, 241)',
        'Entertainment': 'rgb(191, 143, 255)',
        'Shopping': 'rgb(45, 45, 167)',
        'Bills': 'rgb(91, 91, 241)',
        'Healthcare': 'rgb(133, 133, 241)',
        'Other': 'rgb(50, 50, 255)'
    };
    return tagColors[tag] || 'rgb(128, 128, 128)';
}

function updatePieChartThird() {
        const filteredTransactions = getFilteredTransactions(); 
    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpense = 0;
    
    filteredTransactions.forEach(transaction => {
        if (transaction.side === 'Income') {
            totalIncome += parseInt(transaction.summ);
        } else if (transaction.side === 'Expense') {
            totalExpense += parseInt(transaction.summ);
        }
    });

    const totalMoney = totalIncome + totalExpense;

    // If no transactions, show empty chart
    if (totalMoney === 0) {
        document.querySelector('.third-diagram').innerHTML = '<div class="pie-chart-third" style="background: #f0f0f0;"></div>';
        return;
    }

    // Calculate percentages
    const incomePercentage = (totalIncome / totalMoney) * 100;
    const expensePercentage = (totalExpense / totalMoney) * 100;

    // Build conic-gradient CSS
    const gradient = `conic-gradient(
        #4CAF50 0% ${incomePercentage}%,
        #FF5252 0% ${incomePercentage + expensePercentage}%
    )`;

    // Update the diagram (just the chart, no legend)
    document.querySelector('.third-diagram').innerHTML = `
        <div class="pie-chart-third" style="background: ${gradient};"></div>
    `;
}













// ==============================================
// EVENT LISTENERS
// ==============================================

const addButton = document.querySelector('.add-button');

addButton.addEventListener('click',function(){
    // handling invalid input
    if (document.querySelector('.side-input').value === ''){
        document.querySelector('.side-input').style.border = "1px solid red";
        setTimeout(function(){
            document.querySelector('.side-input').style.border = "1px solid white";
        },3000)
    }
    if (document.querySelector('.tag-input').value === ''){
        document.querySelector('.tag-input').style.border = "1px solid red";
        setTimeout(function(){
            document.querySelector('.tag-input').style.border = "1px solid white";
        },3000)
    }
    if (document.querySelector('.money-input').value === ''){

        document.querySelector('.money-input').placeholder = "Specify the summ!";
        document.querySelector('.money-input').style.border = "1px solid red";
        setTimeout(function(){
            document.querySelector('.money-input').placeholder = "Summ";
            document.querySelector('.money-input').style.border = "1px solid white";
        },3000);
    }
    if (document.querySelector('.date-input').value === ''){ 
        document.querySelector('.date-text').style.color = 'gray';
        document.querySelector('.date-input').style.border = "1px solid red";
        setTimeout(function(){
            document.querySelector('.date-text').style.color ='white';
            document.querySelector('.date-input').style.border = "1px solid white";
        },3000);
    }
    if (document.querySelector('.side-input').value !== '' && document.querySelector('.money-input').value !== '' && document.querySelector('.date-input').value !== '' && document.querySelector('.tag-input').value !== ''){
        const description = document.querySelector('.description-input').value;
        const tag = document.querySelector('.tag-input').value;
        const side = document.querySelector('.side-input').value;
        const summ = document.querySelector('.money-input').value;
        const date = document.querySelector('.date-input').value;

        const tagColor = {
            'Salary': 'rgb(84, 0, 194)',
            'Food':'rgb(116, 44, 211)',
            'Transport': 'rgb(151, 82, 241)',
            'Entertainment':'rgb(191, 143, 255)',
            'Shopping':'rgb(45, 45, 167)',
            'Bills': 'rgb(91, 91, 241)',
            'Healthcare': 'rgb(133, 133, 241)',
            'Other':'rgb(50, 50, 255)'
        };



        if (isEditing) {
            // We're updating an existing transaction
            transactions[editingIndex] = {
                description,
                tag,
                side,
                summ,
                date
            };
            
            // Reset editing state
            resetEditingState();
        } else {
            // We're adding a new transaction
            transactions.push({
                description,
                tag,
                side,
                summ,
                date
            });
        }

        // Update, save, and display
        updateTotal();
        saveTransactions();
        displayTransactions();

        // Clear form
        document.querySelector('.description-input').value = '';
        document.querySelector('.tag-input').value = '';
        document.querySelector('.side-input').value = '';
        document.querySelector('.money-input').value = '';
        document.querySelector('.date-input').value = '';

        const addedText = document.querySelector('.added-text');
        addedText.style.color = "rgb(116, 44, 211)";
        addedText.textContent = "Sucess!"

        setTimeout(function(){
            addedText.style.color = "rgba(255, 255, 255, 0)";
        }, 2000);
    }    

        
        
});

document.querySelector('.monthly-actions').addEventListener('click', function(event) {
    if (event.target.closest('.delete-button')) {
        const transactionElement = event.target.closest('.monthly-actions-element');
        deleteTransaction(transactionElement);
    }
    
    if (event.target.closest('.change-button')) {
        const transactionElement = event.target.closest('.monthly-actions-element');
        changeTransaction(transactionElement);
    }
});

// ==============================================
// INITIALIZATION
// ==============================================

loadTransactions();

// Set initial year to current year
currentYear = new Date().getFullYear();
document.querySelector('.year-input').value = currentYear;

displayTransactions();
updatePieChart();
updatePieChartSecond();
updatePieChartThird();