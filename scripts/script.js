/* the array that stores the data*/
let transactions = [];
let total = 0;

// ==============================================
// LOCAL STORAGE FUNCTIONS
// ==============================================

//saving the transactions in localStorage
function saveTransactions(){
    localStorage.setItem('transactions',JSON.stringify(transactions));
    localStorage.setItem('total',JSON.stringify(total));
}

function loadTransactions(){
    const saved = localStorage.getItem('transactions');
    if(saved)
        transactions = JSON.parse(saved);
    
    // Load total as well
    const savedTotal = localStorage.getItem('total');
    if (savedTotal) {
        total = JSON.parse(savedTotal);
    }
}

// ==============================================
// TOTAL CALCULATION FUNCTION
// ==============================================

function updateTotal() {
    total = 0;
    transactions.forEach(transaction => {
        if (transaction.side === 'Income') {
            total += parseInt(transaction.summ);
        } else if (transaction.side === 'Expense') {
            total -= parseInt(transaction.summ);
        }
    });
    document.querySelector('.balance-text').textContent = total + '$';
}

// ==============================================
// DISPLAY FUNCTIONS
// ==============================================

function displayTransactions(){
    document.querySelector('.monthly-actions').innerHTML = '';
    transactions.forEach(transaction =>{
        if (transaction.description)
            document.querySelector('.monthly-actions').innerHTML += createTransactions(transaction);
    });
    updateTotal();
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
// DELETE FUNCTIONALITY
// ==============================================

function deleteTransaction(transactionElement) {
    // Find the index of this transaction in the array
    const index = Array.from(transactionElement.parentElement.children).indexOf(transactionElement);
    
    if (index !== -1) {
        // Remove from array
        transactions.splice(index, 1);
        
        // Update total, save and refresh display
        updateTotal();
        saveTransactions();
        displayTransactions();
    }
}

// ==============================================
// CHANGE/EDIT FUNCTIONALITY
// ==============================================

function changeTransaction(transactionElement) {
    // Find the index of this transaction
    const index = Array.from(transactionElement.parentElement.children).indexOf(transactionElement);
    
    if (index !== -1) {
        const transaction = transactions[index];
        
        // Fill the form with current values
        document.querySelector('.description-input').value = transaction.description;
        document.querySelector('.tag-input').value = transaction.tag;
        document.querySelector('.side-input').value = transaction.side;
        document.querySelector('.money-input').value = transaction.summ;
        document.querySelector('.date-input').value = transaction.date;
        
        // Remove the old transaction
        transactions.splice(index, 1);
        
        // Change add button text to "Update"
        const addButton = document.querySelector('.add-button');
        addButton.textContent = 'Update';
        addButton.dataset.editing = 'true';
        
        // Update total temporarily
        updateTotal();
    }
}

// ==============================================
// EVENT LISTENERS
// ==============================================

const addButton = document.querySelector('.add-button');

// Add transaction event listener
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
    // end of handing invalid input

    if (document.querySelector('.side-input').value !== '' &&document.querySelector('.money-input').value !== '' && document.querySelector('.date-input').value !== ''){
        const description = document.querySelector('.description-input').value;
        const tag = document.querySelector('.tag-input').value;
        const side = document.querySelector('.side-input').value;
        const summ = document.querySelector('.money-input').value;
        const date = document.querySelector('.date-input').value;

        // Check if we're in edit mode
        if (addButton.dataset.editing === 'true') {
            // We're updating an existing transaction
            transactions.push({
                description,
                tag,
                side,
                summ,
                date
            });
            
            // Reset button to "Add" mode
            addButton.textContent = 'Add';
            addButton.dataset.editing = 'false';
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

        // Update total, save, and display
        updateTotal();
        saveTransactions();
        displayTransactions();

        // Clear form
        document.querySelector('.description-input').value = '';
        document.querySelector('.tag-input').value = '';
        document.querySelector('.side-input').value = '';
        document.querySelector('.money-input').value = '';
        document.querySelector('.date-input').value = '';
    }    
});

// Event delegation for delete and change buttons
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
displayTransactions();