import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeIsraeliId } from "@/lib/auth";

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

  // Detect format by checking header
  const headerFields = parseCSVLine(lines[0]);
  const firstHeader = headerFields[0]?.replace(/^\uFEFF/, "").trim().toLowerCase();
  const isUpdateFormat = firstHeader === "id";

  const dataLines = lines.slice(1);

  const results = {
    created: 0,
    updated: 0,
    errors: [] as string[],
  };

  for (let i = 0; i < dataLines.length; i++) {
    const lineNum = i + 2;
    const fields = parseCSVLine(dataLines[i]);

    try {
      if (isUpdateFormat) {
        // Update format: id, firstName, lastName, grade, childIsraeliId
        if (fields.length < 2) {
          results.errors.push(`שורה ${lineNum}: חסרים שדות`);
          continue;
        }

        const [id, , , , childIsraeliId] = fields;
        if (!id) {
          results.errors.push(`שורה ${lineNum}: חסר מזהה תלמיד`);
          continue;
        }

        const updateData: Record<string, unknown> = {};
        if (childIsraeliId !== undefined && childIsraeliId !== "") {
          const cleanChildId = normalizeIsraeliId(childIsraeliId);
          if (cleanChildId !== "000000000") {
            updateData.israeliId = cleanChildId;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.child.update({
            where: { id },
            data: updateData,
          });
          results.updated++;
        }
      } else {
        // Create format: firstName, lastName, grade, parent1Id, parent1Name, parent2Id, parent2Name, childIsraeliId
        if (fields.length < 5) {
          results.errors.push(
            `שורה ${lineNum}: חסרים שדות (נדרשים לפחות 5: שם פרטי, שם משפחה, כיתה, ת.ז. הורה 1, שם הורה 1)`
          );
          continue;
        }

        const [firstName, lastName, grade, parent1Id, parent1Name, parent2Id, parent2Name, childIsraeliId] = fields;

        if (!firstName || !lastName || !parent1Id || !parent1Name) {
          results.errors.push(
            `שורה ${lineNum}: שם פרטי, שם משפחה, ת.ז. הורה 1 ושם הורה 1 הם שדות חובה`
          );
          continue;
        }

        const cleanParent1Id = normalizeIsraeliId(parent1Id);
        if (cleanParent1Id === "000000000") {
          results.errors.push(`שורה ${lineNum}: ת.ז. הורה 1 לא תקינה`);
          continue;
        }

        const p1 = await prisma.parent.upsert({
          where: { israeliId: cleanParent1Id },
          update: { displayName: parent1Name },
          create: { israeliId: cleanParent1Id, displayName: parent1Name },
        });

        let p2Id: string | null = null;
        if (parent2Id && parent2Name) {
          const cleanParent2Id = normalizeIsraeliId(parent2Id);
          if (cleanParent2Id !== "000000000") {
            const p2 = await prisma.parent.upsert({
              where: { israeliId: cleanParent2Id },
              update: { displayName: parent2Name },
              create: { israeliId: cleanParent2Id, displayName: parent2Name },
            });
            p2Id = p2.id;
          }
        }

        let cleanChildId: string | null = null;
        if (childIsraeliId) {
          const normalized = normalizeIsraeliId(childIsraeliId);
          if (normalized !== "000000000") {
            cleanChildId = normalized;
          }
        }

        await prisma.child.create({
          data: {
            firstName,
            lastName,
            grade: grade || "",
            israeliId: cleanChildId,
            parent1Id: p1.id,
            parent2Id: p2Id,
          },
        });

        results.created++;
      }
    } catch (err) {
      results.errors.push(
        `שורה ${lineNum}: שגיאה - ${err instanceof Error ? err.message : "שגיאה לא ידועה"}`
      );
    }
  }

  return NextResponse.json(results);
}
