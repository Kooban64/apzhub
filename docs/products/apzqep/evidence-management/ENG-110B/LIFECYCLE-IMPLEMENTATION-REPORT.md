# Lifecycle Implementation Report — APZQEP-ENG-110B

States: captured → validated → classified → associated → in_review → approved/rejected/quarantined → sealed/retained → archived → disposed.

Orthogonal: `legalHold`. Invalid transitions throw domain errors.
