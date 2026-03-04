import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "לא נבחר קובץ" }, { status: 400 });
  }

  const text = await file.text();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return NextResponse.json(
      { error: "הקובץ חייב להכיל כותרת ולפחות שורה אחת של נתונים" },
      { status: 400 }
    );
  }

  // Skip header line
  const dataLines = lines.slice(1);

  const results = {
    created: 0,
    errors: [] as string[],
  };

  for (let i = 0; i < dataLines.length; i++) {
    const lineNum = i + 2; // 1-based + header
    const fields = parseCSVLine(dataLines[i]);

    // Expected: firstName, lastName, grade, parent1Id, parent1Name, parent2Id, parent2Name
    if (fields.length < 5) {
      results.errors.push(
        `שורה ${lineNum}: חסרים שדות (נדרשים לפחות 5: שם פרטי, שם משפחה, כיתה, ת.ז. הורה 1, שם הורה 1)`
      );
      continue;
    }

    const [firstName, lastName, grade, parent1Id, parent1Name, parent2Id, parent2Name] = fields;

    if (!firstName || !lastName || !parent1Id || !parent1Name) {
      results.errors.push(
        `שורה ${lineNum}: שם פרטי, שם משפחה, ת.ז. הורה 1 ושם הורה 1 הם שדות חובה`
      );
      continue;
    }

    const cleanParent1Id = parent1Id.replace(/\D/g, "");
    if (!cleanParent1Id) {
      results.errors.push(`שורה ${lineNum}: ת.ז. הורה 1 לא תקינה`);
      continue;
    }

    try {
      const p1 = await prisma.parent.upsert({
        where: { israeliId: cleanParent1Id },
        update: { displayName: parent1Name },
        create: { israeliId: cleanParent1Id, displayName: parent1Name },
      });

      let p2Id: string | null = null;
      if (parent2Id && parent2Name) {
        const cleanParent2Id = parent2Id.replace(/\D/g, "");
        if (cleanParent2Id) {
          const p2 = await prisma.parent.upsert({
            where: { israeliId: cleanParent2Id },
            update: { displayName: parent2Name },
            create: { israeliId: cleanParent2Id, displayName: parent2Name },
          });
          p2Id = p2.id;
        }
      }

      await prisma.child.create({
        data: {
          firstName,
          lastName,
          grade: grade || "",
          parent1Id: p1.id,
          parent2Id: p2Id,
        },
      });

      results.created++;
    } catch (err) {
      results.errors.push(
        `שורה ${lineNum}: שגיאה - ${err instanceof Error ? err.message : "שגיאה לא ידועה"}`
      );
    }
  }

  return NextResponse.json(results);
}
