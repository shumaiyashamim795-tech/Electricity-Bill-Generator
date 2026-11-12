const form = document.getElementById('billForm');
const message = document.getElementById('message');
const button = document.getElementById('calculateBtn');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';
  button.disabled = true;
  button.textContent = 'Calculating...';
  try {
    const response = await fetch('/api/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: new URLSearchParams(new FormData(form))
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to calculate bill.');
    showBill(data);
  } catch (error) {
    message.textContent = error.message || 'Could not connect to the Java server. Please run it first.';
  } finally {
    button.disabled = false;
    button.textContent = 'Calculate Bill';
  }
});

function showBill(data) {
  document.getElementById('emptyState').hidden = true;
  document.getElementById('billResult').hidden = false;
  const details = document.getElementById('customerDetails');
  details.replaceChildren();
  const rows = [
    ['Consumer ID', data.consumerId], ['Customer Name', data.name],
    ['Address', data.address], ['Meter Number', data.meterNumber]
  ];
  rows.forEach(([label, value]) => {
    const line = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = label + ': ';
    line.append(strong, document.createTextNode(value));
    details.appendChild(line);
  });
  document.getElementById('resultUnits').textContent = data.units;
  document.getElementById('energyCharge').textContent = money(data.energyCharge);
  document.getElementById('fixedCharge').textContent = money(data.fixedCharge);
  document.getElementById('totalAmount').textContent = money(data.totalAmount);
}
function money(value) { return '₹' + Number(value).toFixed(2); }
document.getElementById('printBtn').addEventListener('click', () => window.print());
