# API

`GET /requirements/{id}/versions` lists metadata; `GET /versions/{number}` reads a snapshot; `POST /versions/compare` compares selected versions; and `GET` or `POST /versions/{number}/verify` verifies integrity. Update requests require `changeReason`; creation accepts an optional initial reason.
