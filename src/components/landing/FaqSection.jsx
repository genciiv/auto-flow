const faqs = [
  {
    question: "A është AutoFlow vetëm për servise?",
    answer:
      "Jo. Platforma është për servise, gomisteri, lavazhe, autoelektrikë, dyqane pjesësh dhe biznese automotive.",
  },
  {
    question: "A mund të shtoj shërbimet e mia?",
    answer:
      "Po. Çdo biznes mund të krijojë shërbimet, çmimet dhe paketat e veta.",
  },
  {
    question: "A ka magazinë për pjesët?",
    answer:
      "Po. Çdo servis ka magazinën e vet dhe stoku përditësohet automatikisht kur përdoret një pjesë.",
  },
  {
    question: "A do ketë marketplace?",
    answer:
      "Po. Marketplace do të ketë pjesë këmbimi, makina, motorë, vegla dhe pajisje.",
  },
];

export default function FaqSection() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            FAQ
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Pyetje të shpeshta
          </h2>
        </div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-3xl border border-slate-200 bg-white p-6"
            >
              <h3 className="font-bold text-slate-950">{faq.question}</h3>
              <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
