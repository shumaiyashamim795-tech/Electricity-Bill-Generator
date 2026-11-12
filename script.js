
const form = document.getElementById('billForm');
const message = document.getElementById('message');
const button = document.getElementById('calculateBtn');

form.addEventListener('submit', function(event) {
    event.preventDefault();

    message.textContent = '';

    const consumerId = document.getElementById('consumerId').value.trim();
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const meterNumber = document.getElementById('meterNumber').value.trim();
    const units = Number(document.getElementById('units').value);

    if (!consumerId || !name || !address || !meterNumber) {
        message.textContent = 'Please fill all details.';
        return;
    }

    if (!Number.isInteger(units) || units < 0) {
        message.textContent = 'Please enter valid units.';
        return;
    }

    button.disabled = true;
    button.textContent = 'Calculating...';

    try {
        // Calculate electricity charges
        let energyCharge = 0;

        if (units <= 100) {
            energyCharge = units * 3.50;
        } 
        else if (units <= 200) {
            energyCharge = (100 * 3.50) +
                           ((units - 100) * 5.00);
        } 
        else if (units <= 300) {
            energyCharge = (100 * 3.50) +
                           (100 * 5.00) +
                           ((units - 200) * 6.50);
        } 
        else {
            energyCharge = (100 * 3.50) +
                           (100 * 5.00) +
                           (100 * 6.50) +
                           ((units - 300) * 8.00);
        }

        const fixedCharge = 50;
        const totalAmount = energyCharge + fixedCharge;

        // Show bill summary
        document.getElementById('emptyState').hidden = true;
        document.getElementById('billResult').hidden = false;

        const details = document.getElementById('customerDetails');
        details.replaceChildren();

        const rows = [
            ['Consumer ID', consumerId],
            ['Customer Name', name],
            ['Address', address],
            ['Meter Number', meterNumber]
        ];

        rows.forEach(([label, value]) => {
            const line = document.createElement('div');
            const strong = document.createElement('strong');

            strong.textContent = label + ': ';
            line.append(strong, document.createTextNode(value));
            details.appendChild(line);
        });

        document.getElementById('resultUnits').textContent = units;
        document.getElementById('energyCharge').textContent = money(energyCharge);
        document.getElementById('fixedCharge').textContent = money(fixedCharge);
        document.getElementById('totalAmount').textContent = money(totalAmount);

    } catch (error) {
        message.textContent = 'Unable to calculate bill. Please try again.';
    } finally {
        button.disabled = false;
        button.textContent = 'Calculate Bill';
    }
});

// Format currency
function money(value) {
    return '₹' + value.toFixed(2);
}

// Print electricity bill
document.getElementById('printBtn').addEventListener('click', function() {
    window.print();
});

 
