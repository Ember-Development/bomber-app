-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "audience" JSONB,
ADD COLUMN     "data" JSONB,
ADD COLUMN     "deepLink" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sentAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT;

-- CreateTable
CREATE TABLE "Device" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "platform" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "appVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushReceipt" (
    "id" UUID NOT NULL,
    "notificationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "failureReason" TEXT,

    CONSTRAINT "PushReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_token_key" ON "Device"("token");

-- CreateIndex
CREATE INDEX "PushReceipt_userId_idx" ON "PushReceipt"("userId");

-- CreateIndex
CREATE INDEX "PushReceipt_notificationId_idx" ON "PushReceipt"("notificationId");

-- CreateIndex
CREATE UNIQUE INDEX "PushReceipt_deviceId_notificationId_key" ON "PushReceipt"("deviceId", "notificationId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushReceipt" ADD CONSTRAINT "PushReceipt_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushReceipt" ADD CONSTRAINT "PushReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushReceipt" ADD CONSTRAINT "PushReceipt_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
