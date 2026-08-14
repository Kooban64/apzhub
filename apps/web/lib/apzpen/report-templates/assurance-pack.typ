// APZPEN branded assurance pack — placeholders {{…}} filled by report-pdf.ts
// Humans certify; never auto-certify.

#set document(title: "{{title}}", author: "APZPEN")
#set page(
  margin: (top: 2.2cm, bottom: 2cm, left: 1.8cm, right: 1.8cm),
  numbering: "1",
  header: context {
    set text(size: 8pt, fill: rgb("#4a5560"))
    grid(
      columns: (1fr, 1fr),
      align(left)[APZPEN · Security Assurance],
      align(right)[{{kind}}],
    )
    line(length: 100%, stroke: 0.4pt + rgb("#c5ccd3"))
  },
  footer: context {
    set text(size: 8pt, fill: rgb("#4a5560"))
    line(length: 100%, stroke: 0.4pt + rgb("#c5ccd3"))
    v(0.3em)
    grid(
      columns: (1fr, 1fr),
      align(left)[Never auto-certified],
      align(right)[Page #counter(page).display()],
    )
  },
)
#set text(size: 9.5pt, fill: rgb("#1a1f24"))
#set heading(numbering: "1.1")
#show heading.where(level: 1): it => {
  v(0.6em)
  text(fill: rgb("#0f3d4c"), weight: "bold", size: 13pt)[#it.body]
  v(0.25em)
  line(length: 100%, stroke: 0.6pt + rgb("#1f6f82"))
  v(0.35em)
}

#align(center)[
  #rect(
    width: 100%,
    inset: 16pt,
    fill: rgb("#0f3d4c"),
    radius: 2pt,
  )[
    #set text(fill: white)
    #text(20pt, weight: "bold")[APZPEN]
    #linebreak()
    #text(11pt)[Enterprise Security Assurance]
    #linebreak()
    #v(0.4em)
    #text(9pt, fill: rgb("#d7e6ea"))[Assessment evidence pack · human certification only]
  ]
]

#v(1em)

#align(center)[
  #text(14pt, weight: "bold", fill: rgb("#0f3d4c"))[{{title}}]
]

#v(0.8em)

#table(
  columns: (auto, 1fr),
  stroke: 0.45pt + rgb("#c5ccd3"),
  inset: 7pt,
  fill: (col, row) => if col == 0 { rgb("#eef3f5") } else { white },
  [*Engagement*], [#raw("{{engagementId}}")],
  [*Pack kind*], [{{kind}}],
  [*Generated*], [{{generatedAt}}],
  [*Classification*], [Confidential — authorised recipients only],
)

#v(0.9em)

{{body}}

#v(1.2em)
#rect(
  width: 100%,
  inset: 10pt,
  stroke: 0.6pt + rgb("#1f6f82"),
  radius: 2pt,
)[
  #text(8.5pt, fill: rgb("#0f3d4c"))[
    *Attestation:* Scanner and AI outputs are advisory evidence only.
    Certification remains a human APZPEN assessment decision.
  ]
]
