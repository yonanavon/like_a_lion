-- AlterTable
ALTER TABLE "children" ADD COLUMN "israeli_id_child" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "children_israeli_id_child_key" ON "children"("israeli_id_child");

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "options" TEXT[],
    "correct_answer_index" INTEGER NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_answers" (
    "id" TEXT NOT NULL,
    "child_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_answer_index" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_answers_child_id_question_id_key" ON "question_answers"("child_id", "question_id");

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_answers" ADD CONSTRAINT "question_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
