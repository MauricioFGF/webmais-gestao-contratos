-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('SERVICO', 'PRODUTO', 'ASSINATURA');

-- AlterTable
ALTER TABLE "contracts" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BRL',
ADD COLUMN     "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "type" "ContractType" NOT NULL DEFAULT 'SERVICO';

-- CreateTable
CREATE TABLE "contract_items" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "contract_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contract_items" ADD CONSTRAINT "contract_items_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: contratos existentes ganham um item único com o valor atual,
-- preservando a regra "value = soma dos itens - desconto" para todo o histórico.
INSERT INTO "contract_items" ("id", "contractId", "description", "quantity", "unitPrice")
SELECT gen_random_uuid(), "id", 'Contrato', 1, "value"
FROM "contracts";
