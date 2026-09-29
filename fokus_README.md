# FOKUS — Plan. Track. Become.

A web and mobile app for planning personal goals, tracking daily behaviour and seeing how small habits add up over time. Built as my Bachelor's thesis at Algebra Bernays University.

<!-- Add screenshots here, e.g.:
![Dashboard](docs/dashboard.png)
-->

## What it does

- **Scenarios → Goals → Behaviours → Daily logs.** A user describes a future scenario (e.g. "healthier me in a year"), breaks it into goals, defines the behaviours that lead there and checks in every day.
- **Progress analytics.** Scenario progress and per-behaviour timelines, visualised with charts.
- **AI assistant.** Suggests concrete behaviours for a goal and generates vision board images (OpenAI API).
- **Vision board.** Images attached to each scenario as a visual reminder of the goal.
- **Mobile app with daily reminders.** Local notifications remind the user to do the daily check-in.

## Tech stack

| Part | Technologies |
|------|--------------|
| Backend | Java 17, Spring Boot, Spring Security (JWT), Spring Data JPA, PostgreSQL, Maven |
| Web | React, Vite, React Router, Recharts, Axios |
| Mobile | Ionic React, Capacitor, Local Notifications |
| AI | OpenAI API (chat completions + image generation) |

## Project structure

```
fokus/
├── backend/   # Spring Boot REST API
├── web/       # React web client
└── mobile/    # Ionic + Capacitor mobile app
```

The backend follows a standard layered structure: `controller` → `service` → `repository`, with DTOs for requests/responses and a JWT filter for authentication.

## Running locally

**Backend**
1. Create a PostgreSQL database called `goalplanner`.
2. Set the database credentials, JWT secret and OpenAI key in `backend/src/main/resources/application.properties`.
3. Run:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The API runs on `http://localhost:8080`.

**Web**
```bash
cd web
npm install
npm run dev
```

**Mobile**
```bash
cd mobile
npm install
ionic serve              # in the browser
npx cap run android      # on a device / emulator
```

## Testing

Unit tests for the service layer (`backend/src/test`). Usability was tested with real users using the SUS (System Usability Scale) questionnaire.
