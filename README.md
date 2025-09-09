# NestJS Microservice – Registration Updates

A learning-oriented **microservice** built with [NestJS](https://nestjs.com/).  
The service provides a RESTful API for managing and updating registrations, integrates with a **PostgreSQL** database, and synchronizes updates with an **external API**.

---

## 🚀 Features
- Built with **NestJS** and **TypeScript**
- Integration with **PostgreSQL** (using TypeORM or Prisma)
- REST API endpoints for CRUD operations on registrations
- Synchronization of updates to an external API (simulated external system)
- Modular architecture with controllers, services, and modules

---

## 🛠 Tech Stack
- [NestJS](https://nestjs.com/) – Node.js framework
- [TypeScript](https://www.typescriptlang.org/) – strongly typed JavaScript
- [PostgreSQL](https://www.postgresql.org/) – relational database
- [TypeORM](https://typeorm.io/) or [Prisma](https://www.prisma.io/) – ORM for database integration

---

## 📂 Project Structure
```

src/
│── app.module.ts          # Root module
│── main.ts                # Application entry point
│
├── registrations/         # Feature module
│   ├── registrations.controller.ts
│   ├── registrations.service.ts
│   ├── registrations.module.ts
│   └── dto/               # Data Transfer Objects
│
└── common/                # Shared utilities, interceptors, pipes, etc.

````

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) installed locally or in Docker

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>

# Install dependencies
npm install
````

### Running the app

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

By default, the API will be available at:
👉 `http://localhost:3000`

---

## 📚 API Endpoints

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | `/registrations`     | Get all registrations       |
| GET    | `/registrations/:id` | Get a single registration   |
| POST   | `/registrations`     | Create a new registration   |
| PUT    | `/registrations/:id` | Update registration details |
| DELETE | `/registrations/:id` | Delete a registration       |

---

## 🔄 External API Sync

Whenever a registration is updated, the service also sends the update to a simulated external API for synchronization (e.g., a third-party system).

---

## 🎯 Purpose

This project was built as a **learning exercise** to practice:

* Building microservices with NestJS
* Working with PostgreSQL databases
* Designing modular and maintainable APIs
* Handling external API integrations

---

## 📜 License

This project is released under the [MIT License](LICENSE).


רוצה שאוסיף לך גם **דוגמת בקשות ב־curl / Postman** בתוך ה־README (כדי שמי שיראה בגיטהאב יוכל לנסות מיד)?
```

