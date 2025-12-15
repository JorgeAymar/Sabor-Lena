import React from 'react';
import { prisma } from '@/lib/prisma';
import CustomersClient from '@/components/CustomersClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <CustomersClient customers={customers} />;
}
