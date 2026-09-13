require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const bcrypt = require('bcryptjs');

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users ---
  const [manager1, manager2, tech1, tech2, tech3, emp1, emp2, emp3] =
    await Promise.all([
      prisma.user.create({ data: { email: 'manager1@company.com', passwordHash, name: 'Manager One', role: 'MANAGER' } }),
      prisma.user.create({ data: { email: 'manager2@company.com', passwordHash, name: 'Manager Two', role: 'MANAGER' } }),
      prisma.user.create({ data: { email: 'tech1@company.com', passwordHash, name: 'Tech One', role: 'TECHNICAL' } }),
      prisma.user.create({ data: { email: 'tech2@company.com', passwordHash, name: 'Tech Two', role: 'TECHNICAL' } }),
      prisma.user.create({ data: { email: 'tech3@company.com', passwordHash, name: 'Tech Three', role: 'TECHNICAL' } }),
      prisma.user.create({ data: { email: 'emp1@company.com', passwordHash, name: 'Employee One', role: 'EMPLOYEE' } }),
      prisma.user.create({ data: { email: 'emp2@company.com', passwordHash, name: 'Employee Two', role: 'EMPLOYEE' } }),
      prisma.user.create({ data: { email: 'emp3@company.com', passwordHash, name: 'Employee Three', role: 'EMPLOYEE' } }),
    ]);

  // --- Tickets ---
  const ticketDefs = [
    { title: 'Laptop won\'t turn on', category: 'IT_SUPPORT', priority: 'HIGH', status: 'OPEN', createdBy: emp1 },
    { title: 'Broken AC in room 204', category: 'FACILITIES', priority: 'MEDIUM', status: 'OPEN', createdBy: emp2 },
    { title: 'Payroll question', category: 'HR', priority: 'LOW', status: 'OPEN', createdBy: emp3 },
    { title: 'VPN access request', category: 'IT_SUPPORT', priority: 'MEDIUM', status: 'ASSIGNED', createdBy: emp1, assignedTo: tech1 },
    { title: 'Printer jam on 3rd floor', category: 'FACILITIES', priority: 'LOW', status: 'ASSIGNED', createdBy: emp2, assignedTo: tech2 },
    { title: 'Email account locked', category: 'IT_SUPPORT', priority: 'CRITICAL', status: 'IN_PROGRESS', createdBy: emp3, assignedTo: tech1 },
    { title: 'Leaking pipe in break room', category: 'FACILITIES', priority: 'HIGH', status: 'IN_PROGRESS', createdBy: emp1, assignedTo: tech3 },
    { title: 'New hire onboarding docs missing', category: 'HR', priority: 'MEDIUM', status: 'IN_PROGRESS', createdBy: emp2, assignedTo: tech2 },
    { title: 'Monitor flickering', category: 'IT_SUPPORT', priority: 'LOW', status: 'RESOLVED', createdBy: emp3, assignedTo: tech1 },
    { title: 'Parking pass request', category: 'OTHER', priority: 'LOW', status: 'RESOLVED', createdBy: emp1, assignedTo: tech3 },
    { title: 'Software license renewal', category: 'IT_SUPPORT', priority: 'MEDIUM', status: 'CLOSED', createdBy: emp2, assignedTo: tech2 },
    { title: 'Conference room booking system down', category: 'OTHER', priority: 'HIGH', status: 'CLOSED', createdBy: emp3, assignedTo: tech1 },
  ];

  let counter = 1;
  for (const def of ticketDefs) {
    const ticketNumber = `TKT-${String(counter).padStart(3, '0')}`;
    counter++;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        title: def.title,
        description: `Details for: ${def.title}`,
        category: def.category,
        priority: def.priority,
        status: def.status,
        createdById: def.createdBy.id,
        assignedToId: def.assignedTo ? def.assignedTo.id : null,
      },
    });

    // Activity: creation event
    await prisma.activity.create({
      data: {
        ticketId: ticket.id,
        userId: def.createdBy.id,
        type: 'STATUS_CHANGE',
        fromStatus: null,
        toStatus: 'OPEN',
      },
    });

    // Activity: assignment + progression, if applicable
    if (def.assignedTo) {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          userId: manager1.id,
          type: 'ASSIGNMENT',
          toStatus: 'ASSIGNED',
        },
      });
    }

    if (['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(def.status)) {
      await prisma.activity.create({
        data: {
          ticketId: ticket.id,
          userId: def.assignedTo.id,
          type: 'COMMENT',
          content: 'Started looking into this.',
        },
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });