# Customer Management Panel — Full-Stack CRM Application

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

A customer relationship management (CRM) panel developed as a university **Software Engineering Lab (Yazlab-3)** project. Provides a web-based interface for managing customer records, tracking orders, and viewing analytics through a relational database backend.

---

## Features

- **Customer CRUD** — create, view, update, and delete customer records
- **Order Management** — track and manage orders linked to each customer
- **Search & Filter** — search customers by name, email, nationality, or status
- **Analytics Dashboard** — summary view of total customers, active orders, and recent activity
- **Admin Authentication** — secure login to protect the management panel

---

## Architecture

```
Browser (HTML/CSS/JS + Bootstrap)
           │
           ▼
    Express.js Server
           │
    ┌──────┴──────┐
    │   REST API  │
    └──────┬──────┘
           │
        MySQL DB
    (customers, orders)
```

---

## Project Structure

```
Customer_panel/
├── Yazlab-3/
│   ├── server.js           # Express entry point
│   ├── routes/
│   │   ├── customers.js    # Customer CRUD routes
│   │   └── orders.js       # Order management routes
│   ├── models/
│   │   ├── Customer.js     # Customer schema/queries
│   │   └── Order.js        # Order schema/queries
│   ├── public/
│   │   ├── index.html      # Main dashboard
│   │   ├── css/            # Custom styles
│   │   └── js/             # Frontend scripts
│   └── package.json
└── README.md
```

---

## Setup & Run

### Prerequisites

- Node.js 18+
- MySQL 8.0+

### Installation

```bash
cd Yazlab-3
npm install
```

### Database Setup

```sql
CREATE DATABASE customer_panel;
-- Import the provided schema file
SOURCE schema.sql;
```

### Configure Connection

Update database credentials in `server.js` or a `.env` file:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=customer_panel
PORT=3000
```

### Run

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Roadmap

- [ ] Export customer data to CSV / Excel
- [ ] Email notification on new order (Nodemailer)
- [ ] Role-based access control (admin, staff, viewer)
- [ ] RESTful API layer with Swagger docs for mobile app integration
- [ ] Docker + docker-compose containerization
- [ ] Pagination for large customer lists
- [ ] Activity logs and audit trail
