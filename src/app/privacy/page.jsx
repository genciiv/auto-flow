import LegalPageLayout from "@/components/legal/LegalPageLayout";

export const metadata = {
  title: "Politika e Privatësisë | AutoFlow",
  description:
    "Informacion mbi mënyrën se si AutoFlow mbledh, përdor dhe mbron të dhënat personale.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Dokument ligjor"
      title="Politika e Privatësisë"
      description="Kjo politikë shpjegon se çfarë të dhënash personale përpunon AutoFlow, përse i përpunon, sa kohë i ruan dhe cilat janë të drejtat e përdoruesve."
    >
      <div className="legal-notice">
        AutoFlow respekton privatësinë dhe synon të përpunojë vetëm të dhënat që
        janë të nevojshme për funksionimin, sigurinë dhe përmirësimin e
        platformës.
      </div>

      <h2>1. Kush është përgjegjës për të dhënat?</h2>

      <p>
        Përpunimi i të dhënave personale nëpërmjet platformës AutoFlow
        administrohet nga operatori i AutoFlow, me seli në Republikën e
        Shqipërisë.
      </p>

      <p>
        Për pyetje, kërkesa ose ushtrimin e të drejtave në lidhje me të dhënat
        personale, mund të kontaktoni:
      </p>

      <ul>
        <li>Email: info@autoflow.al</li>
        <li>Vendndodhja: Shqipëri</li>
      </ul>

      <h2>2. Fusha e zbatimit</h2>

      <p>
        Kjo politikë zbatohet për vizitorët e faqes, bizneset që aplikojnë për
        përdorimin e AutoFlow, pronarët e bizneseve, anëtarët e stafit,
        klientët, përdoruesit e marketplace-it dhe personat e tjerë që
        ndërveprojnë me platformën.
      </p>

      <h2>3. Të dhënat që mund të mbledhim</h2>

      <h3>3.1 Të dhëna të llogarisë</h3>

      <ul>
        <li>Emri dhe mbiemri;</li>
        <li>Adresa e email-it;</li>
        <li>Numri i telefonit;</li>
        <li>Fjalëkalimi në formë të koduar;</li>
        <li>Roli dhe autorizimet e përdoruesit;</li>
        <li>Statusi i verifikimit dhe aktivizimit të llogarisë.</li>
      </ul>

      <h3>3.2 Të dhëna të biznesit</h3>

      <ul>
        <li>Emri tregtar dhe lloji i biznesit;</li>
        <li>Adresa dhe zona e aktivitetit;</li>
        <li>Kontaktet e biznesit;</li>
        <li>NIPT-i, kur kërkohet;</li>
        <li>Shërbimet, çmimet, oraret dhe informacionet publike;</li>
        <li>Të dhëna të abonimit dhe planit të përdorimit.</li>
      </ul>

      <h3>3.3 Të dhëna të klientëve dhe automjeteve</h3>

      <ul>
        <li>Emri dhe kontaktet e klientit;</li>
        <li>Marka, modeli, viti dhe targa e automjetit;</li>
        <li>Numri VIN, kur vendoset nga përdoruesi;</li>
        <li>Historiku i shërbimeve dhe riparimeve;</li>
        <li>Rezervimet, porositë, faturat dhe pagesat;</li>
        <li>Shënime të vendosura nga biznesi.</li>
      </ul>

      <h3>3.4 Të dhëna të marketplace-it</h3>

      <ul>
        <li>Titulli dhe përshkrimi i publikimit;</li>
        <li>Fotografitë e produktit ose automjetit;</li>
        <li>Çmimi dhe vendndodhja;</li>
        <li>Kontaktet e shitësit ose biznesit;</li>
        <li>Mesazhet ose kërkesat për informacion.</li>
      </ul>

      <h3>3.5 Të dhëna teknike</h3>

      <ul>
        <li>Adresa IP;</li>
        <li>Lloji i pajisjes dhe shfletuesit;</li>
        <li>Data dhe ora e aksesit;</li>
        <li>Informacione të sesionit;</li>
        <li>Regjistrime teknike dhe sigurie;</li>
        <li>Veprime administrative dhe activity logs.</li>
      </ul>

      <h2>4. Përse i përdorim të dhënat?</h2>

      <p>Të dhënat mund të përdoren për:</p>

      <ul>
        <li>Krijimin dhe administrimin e llogarive;</li>
        <li>Verifikimin e email-it dhe rikuperimin e llogarisë;</li>
        <li>Shqyrtimin e aplikimeve të bizneseve;</li>
        <li>Ofrimin e funksioneve të platformës;</li>
        <li>Menaxhimin e klientëve, automjeteve dhe serviseve;</li>
        <li>Menaxhimin e rezervimeve, faturave dhe stokut;</li>
        <li>Publikimin dhe administrimin e marketplace-it;</li>
        <li>Dërgimin e njoftimeve që lidhen me shërbimin;</li>
        <li>Parandalimin e abuzimit dhe incidenteve të sigurisë;</li>
        <li>Përmbushjen e detyrimeve ligjore;</li>
        <li>Përmirësimin e funksionimit të platformës.</li>
      </ul>

      <h2>5. Bazat ligjore të përpunimit</h2>

      <p>Përpunimi mund të mbështetet në:</p>

      <ul>
        <li>
          Zbatimin e një kontrate ose marrjen e masave përpara lidhjes së saj;
        </li>
        <li>Përmbushjen e një detyrimi ligjor;</li>
        <li>
          Interesin legjitim për sigurinë, administrimin dhe përmirësimin e
          shërbimit;
        </li>
        <li>Pëlqimin e përdoruesit, kur ai kërkohet;</li>
        <li>
          Mbrojtjen e të drejtave dhe interesave ligjore të AutoFlow ose
          përdoruesve të tij.
        </li>
      </ul>

      <h2>6. Roli i bizneseve në platformë</h2>

      <p>
        Kur një biznes përdor AutoFlow për të regjistruar të dhënat e klientëve,
        stafit, automjeteve dhe serviseve të tij, biznesi mund të jetë
        kontrolluesi i këtyre të dhënave, ndërsa AutoFlow mund të veprojë si
        përpunues teknik sipas udhëzimeve të biznesit.
      </p>

      <p>
        Biznesi është përgjegjës për ligjshmërinë, saktësinë dhe transparencën e
        të dhënave që vendos në platformë.
      </p>

      <h2>7. Me kë mund t’i ndajmë të dhënat?</h2>

      <p>
        Të dhënat mund të përpunohen nga ofrues teknikë që ndihmojnë në
        funksionimin e platformës, si:
      </p>

      <ul>
        <li>Ofrues të hostimit dhe infrastrukturës cloud;</li>
        <li>Ofrues të bazave të të dhënave dhe ruajtjes së skedarëve;</li>
        <li>Ofrues të dërgimit të email-eve;</li>
        <li>Ofrues të autentikimit dhe sigurisë;</li>
        <li>Ofrues pagesash, nëse aktivizohen pagesa online;</li>
        <li>Këshilltarë profesionalë dhe autoritete publike, kur kërkohet.</li>
      </ul>

      <p>
        Këta ofrues duhet të përdorin të dhënat vetëm për shërbimin e përcaktuar
        dhe sipas detyrimeve të zbatueshme të sigurisë dhe konfidencialitetit.
      </p>

      <h2>8. Transferimet ndërkombëtare</h2>

      <p>
        Disa ofrues teknologjikë mund ta ruajnë ose përpunojnë informacionin
        jashtë Shqipërisë. Kur ndodh një transferim i tillë, synojmë të përdorim
        masa dhe garanci të përshtatshme ligjore dhe kontraktuale.
      </p>

      <h2>9. Sa kohë i ruajmë të dhënat?</h2>

      <p>
        Të dhënat ruhen vetëm për aq kohë sa janë të nevojshme për qëllimin për
        të cilin janë mbledhur ose për aq kohë sa kërkohet nga ligji.
      </p>

      <ul>
        <li>
          Të dhënat e llogarisë ruhen gjatë kohës që llogaria është aktive;
        </li>
        <li>
          Të dhënat kontraktuale dhe financiare mund të ruhen sipas afateve
          ligjore;
        </li>
        <li>Regjistrimet e sigurisë ruhen për një periudhë të kufizuar;</li>
        <li>
          Të dhënat e fshira mund të mbeten përkohësisht në kopjet rezervë;
        </li>
        <li>
          Informacioni mund të ruhet më gjatë kur është i nevojshëm për një
          pretendim ligjor.
        </li>
      </ul>

      <h2>10. Siguria</h2>

      <p>
        AutoFlow përdor masa teknike dhe organizative për të mbrojtur të dhënat,
        përfshirë kontrollin e aksesit, autentikimin, ndarjen e roleve, kodimin
        e fjalëkalimeve, regjistrimin e veprimeve administrative dhe kopjet
        rezervë.
      </p>

      <p>
        Asnjë sistem nuk mund të garantojë siguri absolute. Përdoruesit duhet të
        mbajnë të fshehta kredencialet e tyre dhe të njoftojnë menjëherë për çdo
        përdorim të paautorizuar.
      </p>

      <h2>11. Të drejtat e përdoruesit</h2>

      <p>Në varësi të kushteve ligjore, përdoruesi mund të kërkojë:</p>

      <ul>
        <li>Informacion dhe akses në të dhënat personale;</li>
        <li>Korrigjimin e të dhënave të pasakta;</li>
        <li>Fshirjen e të dhënave;</li>
        <li>Kufizimin e përpunimit;</li>
        <li>Kundërshtimin ndaj përpunimit;</li>
        <li>Transferimin e të dhënave, kur zbatohet;</li>
        <li>Tërheqjen e pëlqimit;</li>
        <li>
          Mosnënshtrimin ndaj një vendimi të bazuar vetëm në përpunim automatik,
          kur zbatohet.
        </li>
      </ul>

      <p>
        Për ushtrimin e këtyre të drejtave, dërgoni një kërkesë në
        info@autoflow.al. Mund të kërkojmë informacion për verifikimin e
        identitetit përpara se të përpunojmë kërkesën.
      </p>

      <h2>12. E drejta për ankesë</h2>

      <p>
        Përdoruesi ka të drejtë të paraqesë ankesë pranë Komisionerit për të
        Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale në Republikën
        e Shqipërisë.
      </p>

      <h2>13. Të miturit</h2>

      <p>
        AutoFlow nuk synon përdorimin e drejtpërdrejtë nga fëmijët. Personat që
        krijojnë një llogari duhet të kenë aftësinë ligjore për të pranuar
        kushtet ose autorizimin e nevojshëm.
      </p>

      <h2>14. Ndryshimet e politikës</h2>

      <p>
        Kjo politikë mund të përditësohet për shkak të ndryshimeve ligjore,
        teknike ose funksionale. Versioni i ri do të publikohet në këtë faqe dhe
        do të shënohet data e përditësimit.
      </p>
    </LegalPageLayout>
  );
}
