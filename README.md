<div align="center">
  <img src="./public/icon.png" alt="Logo" width="96"/>
  <h1><strong><a href="https://www.wapy.dev" target="_blank">Wapy.dev</a></strong></h1>
  <h2><strong>Your ultimate subscription management tool</strong></h2>
  <img src="./public/images/banner.png" alt="Banner" width="768px" />
</div>

Wapy.dev is a subscription management platform that helps you track and manage your recurring payments and expenses. Get notified via email or push notifications when payments are due, mark subscriptions as paid, and keep track of your spending across different categories.

![License: MIT + Commons Clause](https://img.shields.io/badge/License-MIT%20%2B%20Commons%20Clause-blue.svg)

## ✨ Features

- Track recurring subscriptions and expenses
- Email and push notification reminders for upcoming payments
- Customizable notification schedules
- Multi-currency support
- Timezone support
- Category management with custom colors
- Mark payments as paid
- View payment history and upcoming payments
- OAuth authentication with various providers

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

1. Run `docker compose -p wapydev up -d` to start the database and server. Default environment is `production`, but you can change it to `development` if you want to via `NODE_ENV` variable in the `.env` file.

1. Visit `http://localhost:3000` or your site URL.

## Contributing

Contributions are welcome! Please feel free to submit a PR.
