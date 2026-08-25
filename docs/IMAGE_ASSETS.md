# Imagens educativas

Registro de origem, licença e transformações dos ativos visuais usados no
portal. As licenças foram verificadas na página do arquivo exato em 26 de julho
de 2026.

## Figuras de licença aberta

### Sistema lacrimal em português

- Arquivo de origem: `Tear_system-pt.svg`
- Autor: Jmarchn
- Página do arquivo:
  https://commons.wikimedia.org/wiki/File:Tear_system-pt.svg
- Arquivo original:
  https://upload.wikimedia.org/wikipedia/commons/d/d0/Tear_system-pt.svg
- Licença: Creative Commons Attribution-ShareAlike 3.0 Unported
- Licença: https://creativecommons.org/licenses/by-sa/3.0/
- SHA-256 do SVG baixado:
  `ee952333c4567b7e2eea5ddc3c2d32073bc5b3358bce699d43d1ae5f30001cb0`
- Alterações: conversão para AVIF, WebP e PNG, aplicação de fundo branco e
  redimensionamento. A versão adaptada continua sob CC BY-SA 3.0.

## Ilustrações originais geradas com IA

Modo de geração: ferramenta `imagegen` integrada ao ambiente Codex. As quatro
imagens são identificadas como ilustrações geradas com IA nas legendas. Duas
adotam estilo visual realista e duas são esquemáticas; nenhuma representa
fotografia clínica, exame, protocolo ou resultado clínico real.

### Filme lacrimal — visualização realista

Prompt final:

> Edit the supplied eye image for a Brazilian patient-education page about dry
> eye. Replace the detached translucent ribbons with a realistic, extremely thin
> tear film that remains fully adherent to and follows the curvature of the
> corneal surface. The film should read only as a subtle continuous moist optical
> sheen and delicate lipid interference highlights hugging the cornea after a
> blink; no layer may project into the air or extend away from the eye. Preserve
> the natural eye, eyelids, eyelashes, iris, three-quarter macro framing,
> white-to-pale-blue clinical background, soft studio lighting and horizontal
> 3:2 composition. No detached sheets, ribbons, streams, waves, droplets, labels,
> text, arrows, logo, watermark, UI, instruments, blood, redness, fantasy fluid,
> neon glow or uncanny anatomy.

### Componentes do filme lacrimal — corte microscópico realista

Prompt final:

> Create a realistic, professional medical visualization of the tear-film
> components replacing a simple numbered diagram. Show a highly magnified
> oblique cross-sectional view of the living corneal surface, with anatomically
> believable translucent corneal epithelial cells at the bottom; above them a
> continuous hydrated mucoaqueous tear phase with a subtle concentration
> gradient toward the epithelial glycocalyx; at the very top an extremely thin
> lipid film with delicate warm interference highlights. The interfaces must
> look integrated and dynamic, not like rigid slabs. Premium photorealistic
> medical CGI, horizontal 3:2 composition, white-to-pale-blue clinical
> background, optically clear aqua and pale teal fluids, natural translucent
> tissue and restrained pale gold on the lipid surface. No labels, numbers,
> arrows, brackets, text, logo, watermark, UI, large bubbles, fantasy liquid,
> neon glow, gore or instruments.

### Meibografia e AS-OCT

Prompt final:

> Create an original medical-editorial patient-education illustration for a
> Brazilian dry-eye information portal. Subject: complementary diagnostic
> imaging in dry eye, shown as a balanced two-panel composition with no dividing
> text. LEFT panel: a grayscale infrared-style meibography view of a gently
> everted lower eyelid, showing an organized pattern of elongated meibomian
> glands with a few realistic shortened or missing areas; clearly schematic,
> not a real patient scan. RIGHT panel: a clean grayscale AS-OCT-style
> cross-sectional image at the lower eyelid-cornea junction, showing the small
> triangular tear meniscus and layered ocular tissues with subtle teal
> highlights. No labels, arrows, letters, numbers, logos, watermarks, patient
> identifiers, UI, measurement calipers, or device branding. Anatomically
> plausible, calm and non-alarming, sophisticated diagnostic-imaging aesthetic,
> non-photorealistic. Palette: grayscale, deep navy, teal, pale aqua, white. Soft
> editorial framing and generous negative space; readable at article width.
> Aspect ratio 3:2, high resolution.

### Luz intensa pulsada

Prompt final:

> Create an original, calm medical-editorial illustration for a Brazilian
> dry-eye patient-education portal. Subject: an ophthalmic intense pulsed light
> (IPL) treatment session for selected patients with meibomian gland
> dysfunction. Show a close three-quarter view of an adult patient resting with
> the eye fully closed and protected by an opaque professional ocular shield; a
> clinician's gloved hand holds a generic, unbranded IPL handpiece near the skin
> just below the lower eyelid/upper cheek, emitting one controlled soft amber
> pulse. The light must clearly target periocular skin, never the exposed eye.
> No labels, arrows, text, letters, logos, watermarks, device brand, clinic
> setting, marketing mood, before/after framing, or promises of benefit.
> Anatomically plausible, respectful, reassuring, non-photorealistic medical
> illustration. Palette: deep navy, teal, pale aqua, white, with a restrained
> warm amber light pulse. Clean horizontal composition, soft diffuse lighting,
> generous negative space, suitable for a white editorial article card. Aspect
> ratio 3:2, high resolution.

## Figuras de licença aberta — Hwang et al., 2013

Artigo: Hwang HS, Shin JG, Lee BH, Eom TJ, Joo C-K. In Vivo 3D
Meibography of the Human Eyelid Using Real Time Imaging Fourier-Domain
OCT. _PLoS ONE_. 2013;8(6):e67143.

- DOI: https://doi.org/10.1371/journal.pone.0067143
- PMID: 23805297 · PMCID: PMC3689717
- Licença: Creative Commons Attribution 4.0 International
  (Crossref, conferida em 25 de agosto de 2026)
- Licença: https://creativecommons.org/licenses/by/4.0/
- O artigo declara aprovação do IRB do Seoul St. Mary's Hospital e
  consentimento escrito dos participantes. As figuras usadas mostram
  pálpebra evertida e glândulas, sem identificação facial.
- Arquivos-fonte: TIFFs originais da PLOS
  (`article/figure/image?size=original&id=10.1371/journal.pone.0067143.g00N`)
- Alterações: conversão para JPEG, AVIF e WebP; a figura 4 foi
  redimensionada para 1200 px de largura. Sem recorte de painéis, letras
  ou retângulos do campo.
- Regenerar: `node scripts/process-hwang-meibography-figures.mjs`

| Figura | SHA-256 do TIFF                                                    | Uso no site                              |
| ------ | ------------------------------------------------------------------ | ---------------------------------------- |
| 4      | `f784325bc915f94b8b3e702224adacffe180d090148d5ccc053f6bff9bfab135` | `/diagnostico` e o guia de meibografia   |
| 6      | `c2514189d33f60ab70edf01efd807afb5f3d24c90a684b87d9d5a3a2e02df0ec` | `/diagnostico` e o guia de meibografia   |
| 9      | `688583fb9d35b4491b4a6649ba902cd6371680a79d381c50ab77f05bfcc6be0c` | `/superficie/artigos/alem-do-meiboscore` |

## SUPERFÍCIE — Gate 3

Ativos editoriais criados em 7 de agosto de 2026 para a landing da revista e a
página da Edição Fundadora. As imagens foram geradas com a ferramenta
`imagegen` integrada ao ambiente Codex e não representam exame, paciente ou
resultado clínico real.

### Hero de interferometria

- Arquivo-fonte: `public/images/superficie/hero-interferometria.png`
- Derivados responsivos: AVIF e WebP em 768 e 1536 px.
- Uso: hero de `/superficie`.
- Direção de arte: macro biomédica abstrata da superfície corneana e do filme
  lacrimal, com interferência óptica em azul, teal e dourado; sem texto, marca,
  instrumento ou anatomia desagradável.
- Observação editorial: ilustração conceitual, não imagem diagnóstica.

### Capa da Edição Fundadora nº 0

- Arquivo-fonte: `public/images/superficie/capa-edicao-00.png`
- Derivados responsivos: AVIF e WebP em 600 e 1054 px.
- Uso: `/superficie` e `/superficie/edicao-00`.
- Origem criativa: reconstrução frontal, com auxílio de IA, baseada na capa de
  referência fornecida pelo responsável editorial em arquivo privado.
- Direção de arte: capa off-white, marca SUPERFÍCIE, diagrama ocular abstrato,
  título da Edição Fundadora e sistema tipográfico navy, teal e dourado.
- Estado: peça de pré-lançamento; a edição permanece identificada como “em
  produção”.

### Open Graph da SUPERFÍCIE

- Arquivo-fonte: `public/images/superficie/og-superficie-source.png`
- Arquivo publicado: `public/images/superficie/og-superficie.png` (1200 × 630).
- Uso: Open Graph e Twitter Card das páginas da SUPERFÍCIE no Gate 3.
- Direção de arte: fundo navy, wordmark SUPERFÍCIE, assinatura editorial e
  detalhe científico discreto. Não é screenshot da homepage.
