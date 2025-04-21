-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FuelType" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "anpCode" TEXT NOT NULL,
    "icmsRate" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FuelType" ("anpCode", "createdAt", "icmsRate", "id", "name", "updatedAt") SELECT "anpCode", "createdAt", "icmsRate", "id", "name", "updatedAt" FROM "FuelType";
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
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PmpfValue_fuelTypeId_fkey" FOREIGN KEY ("fuelTypeId") REFERENCES "FuelType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PmpfValue" ("createdAt", "endDate", "fuelTypeId", "id", "startDate", "updatedAt", "value") SELECT "createdAt", "endDate", "fuelTypeId", "id", "startDate", "updatedAt", "value" FROM "PmpfValue";
DROP TABLE "PmpfValue";
ALTER TABLE "new_PmpfValue" RENAME TO "PmpfValue";
CREATE TABLE "new_Record" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "spedFileId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Record_spedFileId_fkey" FOREIGN KEY ("spedFileId") REFERENCES "SpedFile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Record" ("content", "createdAt", "id", "spedFileId", "type", "updatedAt") SELECT "content", "createdAt", "id", "spedFileId", "type", "updatedAt" FROM "Record";
DROP TABLE "Record";
ALTER TABLE "new_Record" RENAME TO "Record";
CREATE TABLE "new_SpedFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SpedFile" ("content", "createdAt", "filename", "id", "updatedAt") SELECT "content", "createdAt", "filename", "id", "updatedAt" FROM "SpedFile";
DROP TABLE "SpedFile";
ALTER TABLE "new_SpedFile" RENAME TO "SpedFile";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "id", "password", "updatedAt", "username") SELECT "createdAt", "id", "password", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
