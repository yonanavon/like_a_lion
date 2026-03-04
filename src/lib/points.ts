import { prisma } from "./prisma";
import { countActiveDays, getIsraelToday, parseDate } from "./dates";

export async function calculateChildPoints(childId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: "singleton" },
  });

  if (!campaign) {
    return { totalPoints: 0, percentage: 0, maxPoints: 0 };
  }

  const activeTasks = await prisma.task.findMany({
    where: { isActive: true },
  });

  const today = parseDate(getIsraelToday());
  const activeDays = countActiveDays(
    campaign.startDate,
    today,
    campaign.activeWeekdays
  );

  const maxPoints =
    activeDays * activeTasks.reduce((sum, t) => sum + t.points, 0);

  const completions = await prisma.taskCompletion.findMany({
    where: { childId },
    include: { task: true },
  });

  const totalPoints = completions.reduce(
    (sum, c) => sum + c.task.points,
    0
  );

  const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;

  return { totalPoints, percentage, maxPoints };
}
