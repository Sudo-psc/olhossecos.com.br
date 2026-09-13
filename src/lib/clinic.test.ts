import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { clinic, clinicAddressLine } from "./clinic.ts";
import { responsibleDoctor } from "./doctor.ts";

test("a clínica presencial não se confunde com o domínio editorial", () => {
  assert.equal(clinic.url, "https://saraivavision.com.br");
  assert.doesNotMatch(clinic.url, /olhossecos/u);
  assert.equal(clinic.addressLocality, "Caratinga");
  assert.equal(clinic.telephoneDisplay, "(33) 99860-1427");
  assert.equal(clinic.whatsappUrl, "https://wa.me/5533998601427");
  assert.match(clinicAddressLine, /Catarina Maria Passos/u);
});

test("os rodapés carregam a ponte ética sem cupom nem diagnóstico online", async () => {
  const footers = [
    "src/components/Footer.astro",
    "src/components/superficie/SuperficieFooter.astro",
  ];

  for (const path of footers) {
    const source = await readFile(path, "utf8");
    assert.match(source, /clinic\.url/u, `${path} sem link da clínica`);
    assert.match(source, /clinic\.whatsappUrl/u, `${path} sem WhatsApp`);
    assert.match(
      source,
      /responsibleDoctor\.registration/u,
      `${path} sem CRM/RQE`,
    );
    assert.match(
      source,
      /Não faz diagnóstico online|Sem diagnóstico online/u,
      `${path} sem o aviso ético`,
    );
    assert.doesNotMatch(
      source,
      /R\$\s*50|Bônus Exclusivo|diagnóstico preliminar/iu,
    );
  }
});

test("o registro do rodapé continua vindo do módulo do médico", () => {
  assert.equal(responsibleDoctor.registration, "CRM-MG 69.870 · RQE 71.903");
});
