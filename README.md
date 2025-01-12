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

Requirements:
  - Resend API key: for handling authentication emails and email notifications

  - Github OAuth keys (ID and Secret): for enabling Github login.

  - Google OAuth keys (ID and Secret): for enabling Google login.

Download or copy `docker-compose.yml` and `.env.example` files from the repository.

Before everything, you will need to setup the environment variables. Please take a look at the `.env.example` file to see what variables you need to set.

The setup script `setup.sh` will help you by copying `.env.example` to `.env` and generating some of the environment variables automatically. To automatically generate the `.env` file, you can download/copy the file `scripts/setup.sh` and run the script via following commands:

```bash
# On Linux
chmod +x ./scripts/setup.sh && ./scripts/setup.sh
# or
docker run --rm -v $(pwd):/app -w /app node:23.6-alpine sh -c "apk add --no-cache openssl su-exec && su-exec $(id -u):$(id -g) ./scripts/setup.sh"

# On Windows
docker run --rm -v ${PWD}:/app -w /app node:23.6-alpine sh -c "apk add --no-cache openssl && ./scripts/setup.sh"
```

### Production Setup

Run docker compose to start the server.

```bash
docker compose -p wapydev up -d
```

The docker compose file includes the database and server. After successful deployment, you can visit your domain URL to see the application.

### Development Setup

Run docker compose to start the server.

```bash
docker compose -p wapydev-dev -f docker-compose-dev.yml up -d
```

### Environment Variables

**Site configuration**

`SITE_URL`: Your site URL. The default is `http://localhost:3000` but you can set it to a domain URL without the trailing slash (ex: `https://www.yourdomain.com`).

**Database configuration**

`POSTGRES_DB`: The name of the database. The default is `wapydev`.

`POSTGRES_USER`: The name of the database. The default is `wapydev`.

`POSTGRES_PASSWORD`: The password for the database. When you run the `setup.sh` script, it will generate a random password for you.

`DATABASE_URL`: The database URL. With the default docker setup, you don't need to change this.

**Authentication configuration**

`AUTH_SECRET`: The secret key for the authentication. When you run the `setup.sh` script, it will generate a random secret for you.

`AUTH_TRUST_HOST`: Whether to trust the host header in the authentication process. The default is `true`.

**Email configuration**

`RESEND_API_KEY`: The API key for the Resend email service.

`RESEND_FROM`: The email address for the Resend email service. An example is `no-reply@yourdomain.com`.

`RESEND_CONTACT_EMAIL`: The contact email for the contact form.

**Github configuration**

[Optional] The variables are only needed if you want to enable Github login.

`GITHUB_CLIENT_ID`: The client ID for the Github OAuth application.

`GITHUB_CLIENT_SECRET`: The client secret for the Github OAuth application.

**Google configuration**

[Optional] The variables are only needed if you want to enable Google login.

`GOOGLE_CLIENT_ID`: The client ID for the Google OAuth application.

`GOOGLE_CLIENT_SECRET`: The client secret for the Google OAuth application.

**Push Notifications**

[Optional] The variables are only needed if you want to enable push notifications.

`NEXT_PUBLIC_VAPID_PUBLIC_KEY`: The public key for the Web Push API. When you run the `setup.sh` script, it will generate a random key for you.

`VAPID_PRIVATE_KEY`: The private key for the Web Push API. When you run the `setup.sh` script, it will generate a random key for you.

**Subscription Secret**

`SUBSCRIPTION_JWT_SECRET`: The secret key for the subscription signing. When you run the `setup.sh` script, it will generate a random secret for you.

### Building Docker Image

If you want to build the Docker image locally, you can run the following command:

```
docker build -t wapy.dev -f Dockerfile .
```

Don't forget to update the `docker-compose.yml` file to use the local image.

### Database Backup and Restore

You can backup the database by running the `backup.sh` script.

```bash
./scripts/backup.sh
```

You can restore the database by running the `restore.sh` script.

```bash
./scripts/restore.sh
```

## Contributing

Thanks go to these wonderful people for their time and contributions ✨.

<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="20%"><a href="https://github.com/tiagorvmartins" target="_blank" rel="noopener noreferrer"><img src="https://github.com/tiagorvmartins.png" width="100%" alt="Tiago Martins"/><br /><sub>Tiago Martins</sub></a></td>
      <td align="center" valign="top" width="20%"></td>
      <td align="center" valign="top" width="20%"></td>
      <td align="center" valign="top" width="20%"></td>
      <td align="center" valign="top" width="20%"></td>
    </tr>
  </tbody>
</table>


Contributions are welcome! Please feel free to submit a PR or create an issue.
