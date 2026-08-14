// APZQEP F12 — Security Bill of Health (substantive draft)
// Placeholders {{…}} filled by report-pack.ts. Humans publish; never auto-certify.

#set document(title: "Security Bill of Health (DRAFT)")
#set page(margin: 1.8cm, numbering: "1")
#set text(size: 9.5pt)
#set heading(numbering: "1.1")

#let change_event_id = "{{changeEventId}}"
#let pack_id = "{{packId}}"
#let generated_at = "{{generatedAt}}"
#let assessment_band = "{{assessmentBand}}"
#let assessment_headline = "{{assessmentHeadline}}"
#let assessment_narrative = "{{assessmentNarrative}}"
#let strengths_block = "{{strengthsBlock}}"
#let concerns_block = "{{concernsBlock}}"
#let scope_summary = "{{scopeSummary}}"
#let methodology_block = "{{methodologyBlock}}"
#let severity_line = "{{severityLine}}"
#let severity_total = "{{severityTotal}}"
#let tools_block = "{{toolsBlock}}"
#let findings_block = "{{findingsBlock}}"
#let actions_block = "{{actionsBlock}}"
#let residual = "{{residualRisk}}"
#let signoff = "{{signOffLine}}"
#let doc_subtitle = "{{docSubtitle}}"
#let status_line = "{{statusLine}}"

#align(center)[
  #text(18pt, weight: "bold")[Security Bill of Health]
  #linebreak()
  #text(11pt)[#doc_subtitle]
  #linebreak()
  #text(9pt, fill: luma(80))[APZQEP · never auto-certified · human sign-off required]
]

#v(0.8em)

#table(
  columns: (auto, 1fr),
  stroke: 0.4pt + luma(180),
  inset: 6pt,
  [*Pack ID*], [#pack_id],
  [*Change*], [#raw(change_event_id)],
  [*Generated*], [#generated_at],
  [*Assessment*], [*#assessment_band* — #assessment_headline],
  [*Status*], [#status_line],
)

= Executive summary

#assessment_narrative

== What went well
#strengths_block

== What needs attention
#concerns_block

= Engagement scope — what was tested

#scope_summary

#methodology_block

= Severity rollup

#severity_line \
Detailed findings counted: *#severity_total*

= Tool results
#tools_block

= Detailed findings — what was found
#findings_block

= Remediation plan — what needs to happen
#actions_block

= Residual risk (human)
#residual

= Sign-off
#signoff

#v(1.2em)
#text(8pt, fill: luma(100))[
  This document covers both favourable and adverse outcomes. It is not a GO/NO-GO decision.
  Publish only after human review (RPT-009 / Flagship F12).
]
