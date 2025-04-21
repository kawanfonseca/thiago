-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SpedFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_SpedFile" ("content", "createdAt", "endDate", "filename", "id", "startDate") SELECT "content", "createdAt", "endDate", "filename", "id", "startDate" FROM "SpedFile";
DROP TABLE "SpedFile";
ALTER TABLE "new_SpedFile" RENAME TO "SpedFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
