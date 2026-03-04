import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create campaign settings
  await prisma.campaign.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      startDate: new Date("2026-03-01"),
      activeWeekdays: [0, 1, 2, 3, 4, 5], // Sun-Fri
    },
  });

  // Create sample tasks
  const tasks = [
    { name: "קריאת שמע", icon: "BookOpen", color: "#3B82F6", points: 1 },
    { name: "תפילה", icon: "HandHeart", color: "#8B5CF6", points: 1 },
    { name: "לימוד תורה", icon: "Book", color: "#10B981", points: 2 },
    { name: "מעשה טוב", icon: "Heart", color: "#EF4444", points: 1 },
    { name: "כיבוד הורים", icon: "Star", color: "#F59E0B", points: 1 },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.name }, // will fail, create new
      update: {},
      create: task,
    });
  }

  console.log("Seed completed!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
