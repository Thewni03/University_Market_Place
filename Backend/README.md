# Thewni Backend


### Setup Instructions

Follow the steps below to run the project successfully.

#### 1. Install dependencies

Run this in both frontend and backend directories:

```bash
npm install
```

#### 2. Install required packages

**Backend:**

```bash
npm install socket.io nodemailer
```

**Frontend:**

```bash
npm install socket.io-client
```

#### 3. Start the application

**Backend:**

```bash
npm start
```

**Frontend:**

```bash
npm start
```

#### 4. Server runon

The backend server is running on:

```
http://localhost:5000
```

#### Important Notes

* `socket.io` is required for real-time notification functionality
* `nodemailer` is required for sending emails (e.g., password reset). Emails will not work without it
