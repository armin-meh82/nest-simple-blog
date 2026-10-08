-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "likesCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT DEFAULT 'default-avatar.png',
ADD COLUMN     "bio" TEXT DEFAULT '',
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
