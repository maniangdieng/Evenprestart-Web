"use client";

import { useState } from "react";
import { CircleCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONTACT_EMAIL = "contact@eventprestart.sn";

export const CONTACT_SUBJECTS = [
  { value: "reservation", label: "Réserver un talent" },
  { value: "recherche", label: "Demande sur mesure" },
  { value: "artiste", label: "Devenir artiste / technicien" },
  { value: "partenariat", label: "Partenariat" },
  { value: "autre", label: "Autre question" },
] as const;

type SubjectValue = (typeof CONTACT_SUBJECTS)[number]["value"];

const EVENT_SUBJECTS: SubjectValue[] = ["reservation", "recherche"];

const INPUT_CLASS =
  "mt-1.5 w-full rounded-xl border border-navy/15 bg-white px-3.5 py-2.5 text-sm font-normal text-navy outline-none transition-colors placeholder:text-navy/30 focus:border-lime focus:ring-2 focus:ring-lime/20";

export function ContactForm({ initialSubject }: { initialSubject?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: (CONTACT_SUBJECTS.some((s) => s.value === initialSubject)
      ? initialSubject
      : "reservation") as SubjectValue,
    eventDate: "",
    eventLocation: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const showEventFields = EVENT_SUBJECTS.includes(form.subject);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subjectLabel = CONTACT_SUBJECTS.find((s) => s.value === form.subject)?.label ?? "Contact";
    const lines = [
      form.message,
      "",
      showEventFields && form.eventDate ? `Date de l'événement : ${form.eventDate}` : null,
      showEventFields && form.eventLocation ? `Lieu : ${form.eventLocation}` : null,
      `— ${form.name} (${form.email}${form.phone ? `, ${form.phone}` : ""})`,
    ].filter((l) => l !== null);
    const subject = encodeURIComponent(`[${subjectLabel}] ${form.name}`);
    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex w-full flex-col items-center rounded-3xl border border-navy/10 bg-white p-10 text-center shadow-lg shadow-navy/5">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime/15 text-lime-dark">
          <CircleCheck className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-navy">Presque terminé !</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Votre messagerie s&apos;est ouverte avec votre message pré-rempli : il ne vous reste
          qu&apos;à l&apos;envoyer. Si rien ne s&apos;est ouvert, écrivez-nous directement à{" "}
          <span className="font-semibold text-navy">{CONTACT_EMAIL}</span>.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 text-sm font-semibold text-lime-dark hover:underline"
        >
          Modifier mon message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-3xl border border-navy/10 bg-white p-6 shadow-lg shadow-navy/5 sm:p-8"
    >
      <h2 className="font-display text-xl font-bold text-navy">Envoyez-nous un message</h2>
      <p className="mt-1 text-sm text-muted">Réponse sous 24h ouvrées.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-navy">
          Nom complet
          <input
            required
            value={form.name}
            onChange={update("name")}
            placeholder="Awa Diop"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            placeholder="awa@exemple.com"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Téléphone <span className="font-normal text-muted">(facultatif)</span>
          <input
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="+221 77 123 45 67"
            className={INPUT_CLASS}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Sujet
          <select value={form.subject} onChange={update("subject")} className={INPUT_CLASS}>
            {CONTACT_SUBJECTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {showEventFields && (
          <>
            <label className="block text-sm font-semibold text-navy">
              Date de l&apos;événement <span className="font-normal text-muted">(facultatif)</span>
              <input
                type="date"
                value={form.eventDate}
                onChange={update("eventDate")}
                className={INPUT_CLASS}
              />
            </label>
            <label className="block text-sm font-semibold text-navy">
              Lieu <span className="font-normal text-muted">(facultatif)</span>
              <input
                value={form.eventLocation}
                onChange={update("eventLocation")}
                placeholder="Dakar, Saly…"
                className={INPUT_CLASS}
              />
            </label>
          </>
        )}

        <label className="block text-sm font-semibold text-navy sm:col-span-2">
          Message
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={update("message")}
            placeholder="Parlez-nous de votre projet : type d'événement, nombre d'invités, ambiance souhaitée…"
            className={`${INPUT_CLASS} resize-y`}
          />
        </label>
      </div>

      <Button type="submit" className="mt-6 w-full">
        <Send className="h-4 w-4" /> Envoyer le message
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        En envoyant ce formulaire, vous acceptez nos conditions générales et notre politique de
        données personnelles.
      </p>
    </form>
  );
}
