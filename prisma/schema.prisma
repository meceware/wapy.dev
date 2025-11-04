// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String          @id @default(cuid())
  name              String?
  email             String          @unique
  emailVerified     Boolean         @map("email_verified")
  image             String?
  accounts          Account[]
  sessions          Session[]

  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt      @map("updated_at")

  // User Settings
  // Default timezone
  timezone          String          @default("Europe/Helsinki")
  // Default currency
  currency          String          @default("EUR")
  // Default notifications
  // time can be INSTANT, MINUTES, HOURS, DAYS, WEEKS
  // type is an array of PUSH + EMAIL + WEBHOOK + NTFY + DISCORD + SLACK
  notifications     Json            @default("[{\"type\": [\"PUSH\"], \"time\": \"INSTANT\", \"due\": 0}]")
  // External service configurations
  externalServices  Json            @default("{}")

  // Payments details
  trialStartedAt    DateTime?       @default(now()) @map("trial_started_at")
  fullAccess        Boolean         @default(false) @map("full_access")
  isBlocked         Boolean         @default(false) @map("is_blocked")
  subNextNotification DateTime?     @default(dbgenerated("NOW() + INTERVAL '1 month' - INTERVAL '1 day'")) @map("sub_next_notification")

  // Subscriptions
  subscriptions     Subscription[]
  // Categories
  categories        Category[]
  // Payment methods
  paymentMethods    PaymentMethod[]
  // Push subscriptions
  push              PushSubscription[]
  // Past notifications
  pastNotifications PastNotification[]
  // Past Payments
  pastPayments      PastPayment[]
  // Paddle subscriptions
  paddleUserDetails PaddleUserDetails?
}

model Account {
  id                    String       @id @default(cuid())
  userId                String       @map("user_id")
  accountId             String       @map("provider_account_id")
  providerId            String       @map("provider")
  accessToken           String?      @map("access_token")
  refreshToken          String?      @map("refresh_token")
  accessTokenExpiresAt  DateTime?    @map("expires_at")
  refreshTokenExpiresAt DateTime?    @map("refresh_token_expires_at")
  scope                 String?      @map("scope")
  idToken               String?      @map("id_token")

  createdAt         DateTime         @default(now()) @map("created_at")
  updatedAt         DateTime         @updatedAt      @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
}

model Session {
  id                String          @id @default(cuid())
  token             String          @unique @map("session_token")
  userId            String          @map("user_id")
  expiresAt         DateTime        @map("expires")
  ipAddress         String?         @map("ip_address")
  userAgent         String?         @map("user_agent")
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt      @map("updated_at")
}

model Verification {
  id                String      @id @default(cuid())
  identifier        String
  value             String      @map("token")
  expiresAt         DateTime    @map("expires")

  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt      @map("updated_at")
}

model Subscription {
  id                String          @id @default(cuid())
  userId            String          @map("user_id")
  // User
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  // Name
  name              String
  // Logo
  logo              String          @default("")
  // Enabled
  enabled           Boolean         @default(true)
  // Price
  price             Float           @db.DoublePrecision
  // Currency
  currency          String          @default("EUR")
  // Next payment date
  paymentDate       DateTime        @map("payment_date")
  // Until date
  untilDate         DateTime?       @map("until_date")
  // Payment timezone
  timezone          String          @default("(GMT+02:00) Helsinki")
  // Cycle
  // time can be YEARS, MONTHS, WEEKS, DAYS
  cycle             Json            @default("{\"time\": \"MONTHS\", \"every\": 1}")
  // URL
  url               String?
  // Notes
  notes             String?         @db.Text
  // Categories
  categories        Category[]
  // Payment Methods
  paymentMethods    PaymentMethod[]
  // Notifications
  notifications     Json            @default("[]")

  // Status
  nextNotificationTime  DateTime?   @map("next_notification_time")
  nextNotificationDetails  Json     @map("next_notification_details") @default("{}")
  // Past notifications
  pastNotifications PastNotification[]
  // Past payments
  pastPayments      PastPayment[]

  createdAt    DateTime   @default(now())  @map("created_at")
  updatedAt    DateTime   @updatedAt       @map("updated_at")

  @@index([userId])
}

model Category {
  id                String         @id @default(cuid())
  userId            String         @map("user_id")
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String
  color             String?        @default("#9e9e9e")
  subscriptions     Subscription[]
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt      @map("updated_at")

  @@unique([name, userId])    // Prevent duplicate categories per user
  @@index([userId])
}

model PaymentMethod {
  id                String         @id @default(cuid())
  userId            String         @map("user_id")
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name              String
  icon              String?        @default("")
  subscriptions     Subscription[]
  createdAt         DateTime       @default(now()) @map("created_at")
  updatedAt         DateTime       @updatedAt      @map("updated_at")

  @@unique([name, userId])    // Prevent duplicate payment methods per user
  @@index([userId])
}

model PushSubscription {
  id                String          @id @default(cuid())
  userId            String          @map("user_id")
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  endpoint          String
  p256dh            String
  auth              String
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt      @map("updated_at")

  @@unique([userId, endpoint])
}

model PastNotification {
  id                String          @id @default(cuid())
  userId            String          @map("user_id")
  user              User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  title             String
  message           String
  type              String          // 'PAYMENT_DUE', 'SYSTEM', etc.
  read              Boolean         @default(false)
  subscriptionId    String?         @map("subscription_id")
  subscription      Subscription?   @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  createdAt         DateTime        @default(now()) @map("created_at")
  updatedAt         DateTime        @updatedAt      @map("updated_at")

  @@index([userId])
}

model PastPayment {
  id             String        @id @default(cuid())
  userId         String        @map("user_id")
  user           User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscriptionId String        @map("subscription_id")
  subscription   Subscription  @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  price          Float         @db.DoublePrecision
  currency       String        @default("EUR")
  paymentDate    DateTime      @map("payment_date")
  paidAt         DateTime      @default(now()) @map("paid_at")
  createdAt      DateTime      @default(now()) @map("created_at")
  updatedAt      DateTime      @updatedAt      @map("updated_at")

  @@index([userId])
  @@index([subscriptionId])
}

model PaddleUserDetails {
  id                String    @id @default(cuid())
  userId            String    @map("user_id")
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Customer information
  customerId        String    @map("customer_id")
  marketingConsent  Boolean   @default(false) @map("marketing_consent")
  customerStatus    String    @default("none") @map("customer_status")

  subId             String    @default("") @map("subscription_id")
  // Can be none + active, cancelled, past_due, paused, trialing
  // https://developer.paddle.com/webhooks/subscriptions/subscription-created
  subStatus         String    @default("none") @map("subscription_status")
  subStartedAt      DateTime? @map("subscription_started_at")
  subNextPaymentAt  DateTime? @map("subscription_next_payment_at")
  subScheduledChange Json?    @default("{}") @map("subscription_scheduled_change")

  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  @@index([userId, customerId])
  @@unique([customerId])
  @@unique([userId])
}
