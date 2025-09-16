-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('OPEN', 'ACTIVE', 'TESTING', 'CHECKING', 'CLOSED', 'CANCELED');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "create_date" TIMESTAMPTZ(6) NOT NULL,
    "locationId" INTEGER NOT NULL,
    "alerts" INTEGER[],
    "status" "public"."Status" NOT NULL,
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_latitude_longitude_key" ON "public"."Location"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
