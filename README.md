# Electricity Bill Generator – Java + Web Frontend

**Subject:** Object Oriented Programming (PCCCS593)  
**Semester:** 5th | **Year:** 3rd  
**Language:** Java (backend), HTML, CSS and JavaScript (frontend)

## Project overview
This project provides a simple browser-based interface for an Electricity Bill Generator. The browser form sends customer details and units to a Java HTTP server. The Java server reuses the existing `Customer`, `TariffSlab`, `Bill`, and `DomesticBill` classes from `ElectricityBillGenerator.java` to calculate the bill and returns the result to the webpage.

The original console-based Java application is also preserved in `ElectricityBillGenerator.java`.

## Requirements
- JDK 11 or later
- A modern web browser

## Run the web application (Windows / VS Code)
1. Extract the project ZIP.
2. Open the extracted `Electricity_Bill_Generator_Web_Project` folder in VS Code.
3. Open Terminal → New Terminal.
4. Compile both Java files:

```bash
javac ElectricityBillGenerator.java ElectricityBillWebServer.java
```

5. Start the Java backend:

```bash
java ElectricityBillWebServer

If port 8080 is already in use, start with another port, for example `java ElectricityBillWebServer 8081`, and open `http://localhost:8081`.
```

6. Keep the terminal running and open this address in your browser:

```text
http://localhost:8080
```

7. Fill in the form and click **Calculate Bill**. The bill is calculated by Java and displayed on the webpage. Use **Print Bill** to print/save the result.

To stop the server, press `Ctrl + C` in the terminal.

## Run the original console version
Compile and run separately:

```bash
javac ElectricityBillGenerator.java
java ElectricityBillGenerator
```

## Sample tariff (academic illustration only)
- First 100 units: ₹3.50 per unit
- Next 100 units (101–200): ₹5.00 per unit
- Next 100 units (201–300): ₹6.50 per unit
- Above 300 units: ₹8.00 per unit
- Fixed charge: ₹50.00

These are sample project rates, not official electricity-board rates.

## OOP concepts demonstrated
- Classes and objects
- Encapsulation
- Constructors
- Inheritance (`DomesticBill` extends `Bill`)
- Method overriding

## Group
- Sachi Riya — 27600124039
- Sadat Ahmad — 27600124040
- Sandeep Kumar Choudhary — 27600124041
- Satyam Singh Rathaur — 27600124042
- Shumaiya Shamim — 27600124043

## Project structure
```text
Electricity_Bill_Generator_Web_Project/
├── ElectricityBillGenerator.java
├── ElectricityBillWebServer.java
├── README.md
└── web/
    ├── index.html
    ├── style.css
    └── script.js
```
