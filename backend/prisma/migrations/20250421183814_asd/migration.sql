/*
  Warnings:

  - You are about to drop the column `endDate` on the `SpedFile` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `SpedFile` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `FuelType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PmpfValue` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SpedFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FuelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "anpCode" TEXT NOT NULL,
    "icmsRate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FuelType" ("anpCode", "createdAt", "icmsRate", "id", "name") SELECT "anpCode", "createdAt", "icmsRate", "id", "name" FROM "FuelType";
DROP TABLE "FuelType";
ALTER TABLE "new_FuelType" RENAME TO "FuelType";
CREATE UNIQUE INDEX "FuelType_anpCode_key" ON "FuelType"("anpCode");
CREATE TABLE "new_PmpfValue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "value" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "fuelTypeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PmpfValue_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PmpfValue" ("createdAt", "endDate", "fuelTypeId", "id", "startDate", "value") SELECT "createdAt", "endDate", "fuelTypeId", "id", "startDate", "value" FROM "PmpfValue";
DROP TABLE "PmpfValue";
ALTER TABLE "new_PmpfValue" RENAME TO "PmpfValue";
CREATE TABLE "new_Record" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "spedFileId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Record_spedFileId_fkey" FOREIGN KEY ("spedFileId") REFERENCES "SpedFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Record" ("content", "createdAt", "id", "spedFileId", "type") SELECT "content", "createdAt", "id", "spedFileId", "type" FROM "Record";
DROP TABLE "Record";
ALTER TABLE "new_Record" RENAME TO "Record";
CREATE TABLE "new_SpedFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SpedFile" ("content", "createdAt", "filename", "id") SELECT "content", "createdAt", "filename", "id" FROM "SpedFile";
DROP TABLE "SpedFile";
ALTER TABLE "new_SpedFile" RENAME TO "SpedFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
