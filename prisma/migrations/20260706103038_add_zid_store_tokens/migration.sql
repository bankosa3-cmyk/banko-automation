-- CreateTable
CREATE TABLE "ZidStoreToken" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "authorizationToken" TEXT NOT NULL,
    "managerToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenType" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZidStoreToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZidStoreToken_storeId_key" ON "ZidStoreToken"("storeId");
