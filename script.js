
// VOLTEDGE ELECTRICITY BILLING SYSTEM

const form = document.getElementById('billForm');
const message = document.getElementById('message');
const button = document.getElementById('calculateBtn');

const STORAGE_KEY = 'voltedge_bill_history';

let currentBill = null;

// Currency formatting
function money(value) {
    return '₹' + value.toFixed(2);
}

// Read saved bills safely
function getBills() {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

// Save bills in this browser
function saveBills(bills) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
        return true;
    } catch {
        message.textContent = 'Bill calculated, but browser storage is unavailable.';
        return false;
    }
}

// Electricity tariff calculation
function calculateEnergyCharge(units) {
    let energyCharge = 0;

    if (units <= 100) {
        energyCharge = units * 3.50;
    } else if (units <= 200) {
        energyCharge = (100 * 3.50) +
            ((units - 100) * 5.00);
    } else if (units <= 300) {
        energyCharge = (100 * 3.50) +
            (100 * 5.00) +
            ((units - 200) * 6.50);
    } else {
        energyCharge = (100 * 3.50) +
            (100 * 5.00) +
            (100 * 6.50) +
            ((units - 300) * 8.00);
    }

    return energyCharge;
}

// Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === pageId);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle(
            'active',
            link.dataset.page === pageId
        );
    });

    const titles = {
        dashboard: 'Dashboard Overview',
        generate: 'Generate Electricity Bill',
        tariff: 'Tariff Details',
        history: 'Bill History',
        about: 'About Project'
    };

    document.getElementById('pageHeading').textContent =
        titles[pageId] || 'Dashboard';

    document.getElementById('breadcrumbName').textContent =
        pageId.toUpperCase();

    if (pageId === 'dashboard') updateDashboard();
    if (pageId === 'history') updateHistory();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', () => {
        showPage(link.dataset.page);
    });
});

document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => {
        showPage(button.dataset.go);
    });
});

// Display today's date
document.getElementById('todayDate').textContent =
    new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

// Create safe customer information
function showCustomerDetails(bill) {
    const details = document.getElementById('customerDetails');
    details.replaceChildren();

    const rows = [
        ['Consumer ID', bill.consumerId],
        ['Customer Name', bill.name],
        ['Address', bill.address],
        ['Meter Number', bill.meterNumber]
    ];

    rows.forEach(([label, value]) => {
        const line = document.createElement('div');
        const strong = document.createElement('strong');

        strong.textContent = label + ': ';
        line.append(strong, document.createTextNode(value));

        details.appendChild(line);
    });
}

// Display calculated bill
function displayBill(bill) {
    document.getElementById('emptyState').hidden = true;
    document.getElementById('billResult').hidden = false;

    showCustomerDetails(bill);

    document.getElementById('resultUnits').textContent =
        bill.units;

    document.getElementById('energyCharge').textContent =
        money(bill.energyCharge);

    document.getElementById('fixedCharge').textContent =
        money(bill.fixedCharge);

    document.getElementById('totalAmount').textContent =
        money(bill.totalAmount);

    document.getElementById('invoiceDate').textContent =
        'INVOICE DATE: ' + bill.date;
}

// Form submission
form.addEventListener('submit', function(event) {
    event.preventDefault();
    message.textContent = '';

    const consumerId =
        document.getElementById('consumerId').value.trim();

    const name =
        document.getElementById('name').value.trim();

    const address =
        document.getElementById('address').value.trim();

    const meterNumber =
        document.getElementById('meterNumber').value.trim();

    const unitsText =
        document.getElementById('units').value.trim();

    const units = Number(unitsText);

    if (!consumerId || !name || !address || !meterNumber || !unitsText) {
        message.textContent = 'Please fill in all consumer details.';
        return;
    }

    if (!Number.isSafeInteger(units) || units < 0) {
        message.textContent = 'Please enter a valid non-negative whole number of units.';
        return;
    }

    button.disabled = true;
    button.textContent = 'Calculating...';

    try {
        const energyCharge = calculateEnergyCharge(units);
        const fixedCharge = 50;

        const totalAmount = energyCharge + fixedCharge;

        const bill = {
            consumerId,
            name,
            address,
            meterNumber,
            units,
            energyCharge,
            fixedCharge,
            totalAmount,
            date: new Date().toLocaleString('en-IN')
        };

        currentBill = bill;

        // Save bill history
        const bills = getBills();
        bills.unshift(bill);
        saveBills(bills);

        displayBill(bill);

        // Refresh dashboard and history
        updateDashboard();
        updateHistory();

        message.textContent = 'Electricity bill generated successfully!';
        message.style.color = '#3bd69a';

    } catch (error) {
        message.style.color = '#ff8585';
        message.textContent = 'Unable to calculate bill. Please try again.';
        console.error(error);
    } finally {
        button.disabled = false;
        button.textContent = 'Calculate Electricity Bill →';
    }
});

// Dashboard statistics
function updateDashboard() {
    const bills = getBills();

    const totalUnits = bills.reduce(
        (sum, bill) => sum + bill.units, 0
    );

    const totalAmount = bills.reduce(
        (sum, bill) => sum + bill.totalAmount, 0
    );

    document.getElementById('statBills').textContent =
        bills.length;

    document.getElementById('statUnits').textContent =
        totalUnits.toLocaleString('en-IN');

    document.getElementById('statRevenue').textContent =
        money(totalAmount);

    const recent = document.getElementById('recentBills');
    recent.replaceChildren();

    if (bills.length === 0) {
        recent.innerHTML =
            '<tr><td colspan="4" class="empty-table">No bills generated yet.</td></tr>';
        return;
    }

    bills.slice(0, 5).forEach(bill => {
        const row = document.createElement('tr');

        const values = [
            bill.consumerId + ' · ' + bill.name,
            bill.units,
            money(bill.totalAmount)
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement('td');
        const status = document.createElement('span');

        status.className = 'status';
        status.textContent = 'Calculated';

        statusCell.appendChild(status);
        row.appendChild(statusCell);

        recent.appendChild(row);
    });
}

// Bill history
function updateHistory() {
    const bills = getBills();
    const table = document.getElementById('historyTable');

    table.replaceChildren();

    if (bills.length === 0) {
        table.innerHTML =
            '<tr><td colspan="5" class="empty-table">No bill records available.</td></tr>';
        return;
    }

    bills.forEach(bill => {
        const row = document.createElement('tr');

        const values = [
            bill.date,
            bill.consumerId + ' · ' + bill.name,
            bill.units,
            money(bill.energyCharge),
            money(bill.totalAmount)
        ];

        values.forEach(value => {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        });

        table.appendChild(row);
    });
}

// Print current bill
document.getElementById('printBtn').addEventListener('click', function() {
    if (!currentBill) {
        message.textContent = 'Please calculate a bill before printing.';
        return;
    }

    window.print();
});

// Clear saved history
document.getElementById('clearHistoryBtn').addEventListener('click', function() {
    const confirmClear = confirm(
        'Are you sure you want to clear all saved bill history?'
    );

    if (!confirmClear) return;

    try {
        localStorage.removeItem(STORAGE_KEY);
        currentBill = null;

        document.getElementById('billResult').hidden = true;
        document.getElementById('emptyState').hidden = false;

        updateHistory();
        updateDashboard();

        message.textContent = 'Bill history cleared successfully.';
    } catch {
        alert('Unable to clear bill history.');
    }
});

// Initial page setup
updateDashboard();
updateHistory();
showPage('dashboard');
