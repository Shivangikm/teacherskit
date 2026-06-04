import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, BookOpen, FileText, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Teaching Studio — Generate Complete Lesson Kits" },
      { name: "description", content: "Generate full lesson plans, worksheets, and quizzes in seconds for any subject, grade, and topic." },
      { property: "og:title", content: "AI Teaching Studio" },
      { property: "og:description", content: "Generate full lesson plans, worksheets, and quizzes in seconds." },
    ],
  }),
  component: Index,
});

const WEBHOOK_URL = "https://shivangi.app.n8n.cloud/webhook/lesson-kit";

type LessonKit = {
  lesson_plan: {
    warmup: string;
    concepts: string[];
    activity: string;
    recap: string;
    homework: string;
  };
  worksheet: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
  quiz: {
    mcqs: { q: string; options: string[]; answer: string }[];
    short_answers: { q: string; model_answer: string }[];
    rubric: string;
  };
};

function Index() {
  const [form, setForm] = useState({
    subject: "",
    grade: "",
    topic: "",
    duration: "",
    objectives: "",
    language: "English",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kit, setKit] = useState<LessonKit | null>(null);

  const update = (k: keyof typeof form) => (e: { target: { value: string } } | string) =>
    setForm((f) => ({ ...f, [k]: typeof e === "string" ? e : e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setKit(null);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      const payload: LessonKit = Array.isArray(data) ? data[0] : data;
      setKit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">AI Teaching Studio</h1>
            <p className="text-sm text-muted-foreground">Complete lesson kits in seconds</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Generate a Lesson Kit</CardTitle>
            <p className="text-sm text-muted-foreground">
              Fill in the details and we'll build a lesson plan, worksheet, and quiz for you.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-5 md:grid-cols-2">
              <Field label="Subject">
                <Input required value={form.subject} onChange={update("subject")} placeholder="e.g. Science" />
              </Field>
              <Field label="Grade">
                <Input required value={form.grade} onChange={update("grade")} placeholder="e.g. Grade 6" />
              </Field>
              <Field label="Topic">
                <Input required value={form.topic} onChange={update("topic")} placeholder="e.g. Photosynthesis" />
              </Field>
              <Field label="Duration">
                <Input required value={form.duration} onChange={update("duration")} placeholder="e.g. 45 minutes" />
              </Field>
              <Field label="Language">
                <Select value={form.language} onValueChange={(v) => setForm((f) => ({ ...f, language: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="md:col-span-2">
                <Field label="Objectives">
                  <Textarea
                    required
                    rows={4}
                    value={form.objectives}
                    onChange={update("objectives")}
                    placeholder="What should students learn or be able to do?"
                  />
                </Field>
              </div>
              <div className="md:col-span-2 flex items-center justify-between gap-4">
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" size="lg" disabled={loading} className="ml-auto">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" /> Generate Lesson Kit</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {loading && (
          <div className="mt-10 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-foreground font-medium">Crafting your lesson kit…</p>
            <p className="text-sm text-muted-foreground">This usually takes 20–30 seconds.</p>
          </div>
        )}

        {kit && <Results kit={kit} />}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function Results({ kit }: { kit: LessonKit }) {
  return (
    <Card className="mt-10 border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Your Lesson Kit</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plan">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan"><BookOpen className="mr-2 h-4 w-4" />Lesson Plan</TabsTrigger>
            <TabsTrigger value="worksheet"><FileText className="mr-2 h-4 w-4" />Worksheet</TabsTrigger>
            <TabsTrigger value="quiz"><GraduationCap className="mr-2 h-4 w-4" />Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="mt-6 space-y-6">
            <Section title="Warm-up">{kit.lesson_plan?.warmup}</Section>
            <Section title="Concepts">
              <ul className="list-disc space-y-1 pl-5">
                {kit.lesson_plan?.concepts?.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </Section>
            <Section title="Activity">{kit.lesson_plan?.activity}</Section>
            <Section title="Recap">{kit.lesson_plan?.recap}</Section>
            <Section title="Homework">{kit.lesson_plan?.homework}</Section>
          </TabsContent>

          <TabsContent value="worksheet" className="mt-6 space-y-6">
            {(["easy", "medium", "hard"] as const).map((level) => (
              <div key={level} className="rounded-lg border border-border bg-secondary/30 p-5">
                <h3 className="mb-3 text-base font-semibold capitalize text-foreground">{level}</h3>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
                  {kit.worksheet?.[level]?.map((q, i) => <li key={i}>{q}</li>)}
                </ol>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="quiz" className="mt-6 space-y-8">
            <div>
              <h3 className="mb-3 text-base font-semibold text-foreground">Multiple Choice</h3>
              <div className="space-y-4">
                {kit.quiz?.mcqs?.map((m, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <p className="font-medium text-foreground">{i + 1}. {m.q}</p>
                    <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {m.options?.map((o, j) => <li key={j}>• {o}</li>)}
                    </ul>
                    <p className="mt-3 text-sm font-medium text-accent-foreground">
                      <span className="rounded bg-accent px-2 py-0.5">Answer: {m.answer}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-base font-semibold text-foreground">Short Answers</h3>
              <div className="space-y-4">
                {kit.quiz?.short_answers?.map((s, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <p className="font-medium text-foreground">{i + 1}. {s.q}</p>
                    <p className="mt-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Model answer: </span>{s.model_answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <Section title="Rubric">{kit.quiz?.rubric}</Section>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
