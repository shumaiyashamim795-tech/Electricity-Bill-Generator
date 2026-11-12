import java.util.Scanner;

class Customer {
    private String consumerId, name, address, meterNumber;

    public Customer(String consumerId, String name, String address, String meterNumber) {
        this.consumerId = consumerId;
        this.name = name;
        this.address = address;
        this.meterNumber = meterNumber;
    }
    public String getConsumerId() { return consumerId; }
    public String getName() { return name; }
    public String getAddress() { return address; }
    public String getMeterNumber() { return meterNumber; }
}

class TariffSlab {
    private final double rate1 = 3.50, rate2 = 5.00, rate3 = 6.50, rate4 = 8.00;

    public double calculateEnergyCharge(int units) {
        if (units <= 100) return units * rate1;
        if (units <= 200) return 100 * rate1 + (units - 100) * rate2;
        if (units <= 300) return 100 * rate1 + 100 * rate2 + (units - 200) * rate3;
        return 100 * rate1 + 100 * rate2 + 100 * rate3 + (units - 300) * rate4;
    }
}

class Bill {
    protected Customer customer;
    protected int unitsConsumed;
    protected double energyCharge, fixedCharge, totalAmount;

    public Bill(Customer customer, int unitsConsumed) {
        this.customer = customer;
        this.unitsConsumed = unitsConsumed;
    }
    public void calculateBill() {
        energyCharge = new TariffSlab().calculateEnergyCharge(unitsConsumed);
        fixedCharge = 50.00;
        totalAmount = energyCharge + fixedCharge;
    }
    public void displayBill() {
        System.out.println("\n========== ELECTRICITY BILL ==========");
        System.out.println("Consumer ID   : " + customer.getConsumerId());
        System.out.println("Name          : " + customer.getName());
        System.out.println("Address       : " + customer.getAddress());
        System.out.println("Meter Number  : " + customer.getMeterNumber());
        System.out.println("Units Consumed: " + unitsConsumed);
        System.out.printf("Energy Charge : Rs. %.2f%n", energyCharge);
        System.out.printf("Fixed Charge  : Rs. %.2f%n", fixedCharge);
        System.out.printf("Total Amount  : Rs. %.2f%n", totalAmount);
        System.out.println("======================================");
    }
}

class DomesticBill extends Bill {
    public DomesticBill(Customer customer, int unitsConsumed) {
        super(customer, unitsConsumed);
    }
    @Override
    public void calculateBill() {
        super.calculateBill();
    }
}

public class ElectricityBillGenerator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("===== ELECTRICITY BILL GENERATOR =====");
        System.out.print("Enter Consumer ID: ");
        String id = sc.nextLine();
        System.out.print("Enter Customer Name: ");
        String name = sc.nextLine();
        System.out.print("Enter Address: ");
        String address = sc.nextLine();
        System.out.print("Enter Meter Number: ");
        String meter = sc.nextLine();
        System.out.print("Enter Units Consumed: ");
        int units = sc.nextInt();

        if (units < 0) {
            System.out.println("Invalid input: units cannot be negative.");
            sc.close();
            return;
        }

        Customer customer = new Customer(id, name, address, meter);
        DomesticBill bill = new DomesticBill(customer, units);
        bill.calculateBill();
        bill.displayBill();
        sc.close();
    }
}
