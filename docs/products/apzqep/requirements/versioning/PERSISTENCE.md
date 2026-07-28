# Persistence

Content versions are stored in the QEP PostgreSQL schema with tenant and requirement identifiers, unique version number per requirement, parent linkage, canonical snapshot, integrity metadata, change reason, actor, and correlation metadata. Repository operations expose append and reads only.
