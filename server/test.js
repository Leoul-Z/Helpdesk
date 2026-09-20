const prisma = require('./prisma/database.js');

async function main() {
  try {
    const res = await prisma.ticket.findMany({
      where: {
        status: undefined,
        OR: [
          { title: { contains: 'TKT', mode: 'insensitive' } },
          { ticketNumber: { contains: 'TKT', mode: 'insensitive' } }
        ]
      }
    });
    console.log("Success. Found:", res.length);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
