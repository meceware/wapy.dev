<div align="center">
  <img src="./public/icon.png" alt="Logo" width="96"/>
  <h1><strong><a href="https://www.wapy.dev" target="_blank">Wapy.dev</a></strong></h1>
  <h2><strong>Your ultimate subscription management tool</strong></h2>
  <img src="./public/images/banner.png" alt="Banner" width="768px" />
</div>

Wapy.dev is a subscription management platform that helps you track and manage your recurring payments and expenses. Get notified via email or push notifications when payments are due, mark subscriptions as paid, and keep track of your spending across different categories.

![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20%2B%20Commons%20Clause-blue.svg)

## ✨ Key Features

✅ **Track Recurring Subscriptions & Expenses**

Easily log all your subscriptions and payments, so you’ll never miss a due date.

🔔 **Email & Push Notifications**

Get timely reminders when payments are due. Customize notification schedules to fit your needs.

💱 **Multi-Currency & Timezone Support**

Perfect for managing subscriptions in different currencies and time zones.

📜 **Easily Mark Payments as Paid**

Keep track of what’s been paid and review your spending habits over time.

🔐 **Easy Login Options**

Sign in with Email, Github, or Google for a seamless experience.

🎨 **Category Management with Custom Colors**

Organize your subscriptions by category and add a personal touch with custom colors.

📱 **Add to Home Screen for Mobile App Experience**

Use Wapy.dev like a mobile app by adding it to your home screen with just a few taps.

🐳 **Production-Ready with Docker**

Easily self-host Wapy.dev with Docker for a quick and hassle-free installation process.

## Screenshots

Home screen that lists all your subscriptions and expenses, with the ability to filter by category or search for specific items.

<img src="./media/screenshots/home-screen.jpg" alt="Banner" width="384px" />

Reports page that shows your spending across different times and categories.

<img src="./media/screenshots/reports-screen.jpg" alt="Banner" width="384px" />

Account page where you can manage your profile, notifications and categories.

<img src="./media/screenshots/account-screen.jpg" alt="Banner" width="384px" />

## Tech Stack

- [Next.js](https://nextjs.org/) for the frontend and API routes
- [PostgreSQL](https://www.postgresql.org/) database with [Prisma ORM](https://www.prisma.io/)
- [Docker](https://www.docker.com/) for containerization
- [Tailwind](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) components ([Radix UI](https://www.radix-ui.com/) under the hood)
- Authentication with [Auth.js](https://authjs.dev/)
- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Push_API) for notifications
- [Resend](https://resend.com/) for transactional emails
- [Lucide](https://lucide.dev/) and [Simple Icons](https://simpleicons.org/) for icons

## Getting Started

1. Clone the repository

1. On first run, you need to setup the environment variables. Please take a look
at the `.env.example` file to see what variables you need to set.

    - The setup script will copy `.env.example` to `.env` and generate some of the
environment variables automatically. To automatically generate the `.env` file, you can run the `setup.sh` script via following commands:

    ```bash
    # On Linux
    chmod +x ./scripts/setup.sh && ./scripts/setup.sh
    # or
    docker run --rm -v $(pwd):/app -w /app node:23.5-alpine sh -c "apk add --no-cache openssl su-exec && su-exec $(id -u):$(id -g) ./scripts/setup.sh"

    # On Windows
    docker run --rm -v ${PWD}:/app -w /app node:23.5-alpine sh -c "apk add --no-cache openssl && ./scripts/setup.sh"
    ```

    - You will need to set Github, Google and Resend API keys in the `.env` file.

1. Run `docker compose -p wapydev up -d` to start the database and server. Default environment is `production`, but you can change it to `development` if you want to, via `NODE_ENV` variable in the `.env` file.

1. Visit `http://localhost:3000` or your domain URL.

## Production App Settings

### Docker image

To build the production docker image use the following commannd:

```
docker build -t wapy.dev -f Dockerfile .
```

### Compose

#### Replace production environment file with your settings

1. Run the following command to get VAPID public and private keys:

    ```
    npx --yes web-push generate-vapid-keys --json
    ```

2. Replace them accordingly on the .env.production

    ```
    NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey_from_command_above>
    VAPID_PRIVATE_KEY=<privateKey_from_command_above>
    ```

3. Choose/create the secret keys for the following environment variables

    ```
    POSTGRES_PASSWORD
    AUTH_SECRET
    SUBSCRIPTION_JWT_SECRET
    ```

4. Replace your RESEND_API_KEY

    ```
    RESEND_API_KEY=<your_resend_api_key>
    ```

5. Configure your domain on your RESEND account and adapt the following env vars

    ```
    RESEND_FROM=no-reply@<your-domain>
    RESEND_CONTACT_EMAIL=contact@<your-domain>
    ```

6. Configure SITE_URL environment with your domain

    ```
    SITE_URL=https://<your-domain>
    ```

7. Optionally set the following env vars, for logging in with github and/or google.

    ```
    # Github
    GITHUB_ID=
    GITHUB_SECRET=

    # Google
    GOOGLE_ID=
    GOOGLE_SECRET=
    ```

8. Execute the stack

    ```
    docker compose -f docker-compose.prod.yml up -d
    ```


## Contributing

Contributions are welcome! Please feel free to submit a PR or create an issue.
