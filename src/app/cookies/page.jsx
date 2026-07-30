import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Politika e Cookies | AutoFlow",
  description:
    "Informacion mbi cookies dhe teknologjitë e ngjashme që përdor AutoFlow.",
};

export default function CookiesPage() {
  return (
    <LegalPageLayout
      eyebrow="Cookies dhe preferencat"
      title="Politika e Cookies"
      description="Kjo politikë shpjegon çfarë janë cookies, cilat kategori mund të përdorë AutoFlow dhe si mund t’i menaxhoni zgjedhjet tuaja."
    >
      <div className="legal-notice">
        AutoFlow nuk aktivizon cookies analitike ose marketingu pa pëlqimin e
        përdoruesit. Cookies teknikisht të domosdoshme mund të përdoren për
        login, siguri dhe funksionimin bazë të platformës.
      </div>

      <h2>1. Çfarë janë cookies?</h2>

      <p>
        Cookies janë skedarë të vegjël që ruhen në pajisjen e përdoruesit kur
        viziton një faqe interneti. Ato mund të ndihmojnë në ruajtjen e
        sesionit, preferencave dhe funksioneve teknike.
      </p>

      <p>
        AutoFlow mund të përdorë gjithashtu local storage ose teknologji të
        ngjashme për të ruajtur preferenca të caktuara.
      </p>

      <h2>2. Kategoritë e cookies</h2>

      <h3>2.1 Cookies të domosdoshme</h3>

      <p>
        Janë të nevojshme për funksionimin e faqes dhe nuk mund të çaktivizohen
        pa ndikuar te funksione të rëndësishme.
      </p>

      <p>Mund të përdoren për:</p>

      <ul>
        <li>Autentikimin dhe ruajtjen e sesionit;</li>
        <li>Mbrojtjen nga sulmet dhe abuzimet;</li>
        <li>Ruajtjen e preferencave të cookies;</li>
        <li>Balancimin e ngarkesës dhe funksionimin e serverit;</li>
        <li>Ruajtjen e përkohshme të informacionit të formularëve.</li>
      </ul>

      <h3>2.2 Cookies funksionale</h3>

      <p>
        Ruajnë preferenca si paraqitja, gjuha ose zgjedhje të tjera që
        përmirësojnë eksperiencën e përdoruesit.
      </p>

      <h3>2.3 Cookies analitike</h3>

      <p>
        Mund të përdoren për të kuptuar si vizitorët përdorin faqen, cilat faqe
        vizitojnë dhe nëse hasin gabime.
      </p>

      <p>
        Këto cookies do të aktivizohen vetëm pasi përdoruesi të japë pëlqimin,
        nëse AutoFlow instalon një shërbim analitik.
      </p>

      <h3>2.4 Cookies marketingu</h3>

      <p>
        Mund të përdoren për matjen e fushatave ose përmbajtje të personalizuar.
        AutoFlow nuk duhet t’i aktivizojë pa pëlqimin paraprak të përdoruesit.
      </p>

      <h2>3. Cookies që mund të përdorë AutoFlow</h2>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Emri ose lloji</th>
              <th>Qëllimi</th>
              <th>Kategoria</th>
              <th>Kohëzgjatja</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Cookie e sesionit Auth.js</td>
              <td>Autentikimi dhe ruajtja e sesionit të përdoruesit.</td>
              <td>E domosdoshme</td>
              <td>Sesion ose sipas konfigurimit</td>
            </tr>

            <tr>
              <td>CSRF / siguria</td>
              <td>Mbrojtja e kërkesave dhe formularëve.</td>
              <td>E domosdoshme</td>
              <td>Sesion ose afat i kufizuar</td>
            </tr>

            <tr>
              <td>autoflow-cookie-consent</td>
              <td>Ruan zgjedhjen e përdoruesit për cookies.</td>
              <td>E domosdoshme</td>
              <td>12 muaj</td>
            </tr>

            <tr>
              <td>Analytics</td>
              <td>
                Matja anonime ose e pseudonimizuar e përdorimit, vetëm nëse
                aktivizohet dhe pranohet.
              </td>
              <td>Analitike</td>
              <td>Sipas ofruesit</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>4. Pëlqimi</h2>

      <p>
        Kur vizitoni AutoFlow për herë të parë, mund t’ju shfaqet një banner që
        ju lejon:
      </p>

      <ul>
        <li>Të pranoni të gjitha kategoritë;</li>
        <li>Të refuzoni cookies jo të domosdoshme;</li>
        <li>Të personalizoni zgjedhjet tuaja.</li>
      </ul>

      <p>
        Mosveprimi nuk duhet të interpretohet si pëlqim për cookies jo të
        domosdoshme.
      </p>

      <h2>5. Ndryshimi ose tërheqja e pëlqimit</h2>

      <p>
        Përdoruesi mund të ndryshojë zgjedhjen duke fshirë preferencën e cookies
        nga shfletuesi ose duke përdorur butonin “Cilësimet e cookies”, kur ky
        funksion është i disponueshëm.
      </p>

      <h2>6. Menaxhimi nga shfletuesi</h2>

      <p>
        Shumica e shfletuesve lejojnë bllokimin ose fshirjen e cookies.
        Çaktivizimi i cookies të domosdoshme mund të pengojë login-in dhe
        funksionet e platformës.
      </p>

      <h2>7. Shërbimet e palëve të treta</h2>

      <p>
        Nëse AutoFlow integron shërbime të jashtme si analytics, hartat, video,
        pagesat ose widget-e të tjera, këta ofrues mund të përdorin cookies
        sipas politikave të tyre.
      </p>

      <p>
        Shërbimet që vendosin cookies jo të domosdoshme duhet të ngarkohen vetëm
        sipas zgjedhjes së përdoruesit.
      </p>

      <h2>8. Ndryshimet në këtë politikë</h2>

      <p>
        Kjo politikë mund të përditësohet kur shtohen teknologji, integrime ose
        kërkesa të reja ligjore.
      </p>

      <h2>9. Kontakti</h2>

      <p>
        Për pyetje rreth përdorimit të cookies, kontaktoni info@autoflow.al.
      </p>
    </LegalPageLayout>
  );
}
