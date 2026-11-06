# Public Data Dictionary

The public dataset contains only fields intended for release.

| Field | Meaning |
| --- | --- |
| `id` | Stable record identifier generated from core fields and public sources. |
| `jurisdiction` | Municipality or county named in the evidence. |
| `county` | North Carolina county. |
| `population` | Population value from the working research, when available. |
| `populationYear` | Year for the population value, when stated. |
| `initiative` | Plain-language name for one documented system or effort. |
| `pillar` | One of six civic system pillars. |
| `category` | More specific service or operational category. |
| `technology` | Technology or use case described by the record. |
| `department` | Municipal department or organizational category. |
| `audience` | Intended public-facing or internal audience label. |
| `vendor` | Vendor named in the public evidence, when present. |
| `product` | Product named in the public evidence, when present. |
| `lifecycleStatus` | Operational, in progress, pilot, planned/budgeted, retired, or unconfirmed. |
| `aiRole` | AI-primary/dependent, AI-assisted, AI-capable/unconfirmed, needs review, or no published AI signal. |
| `genAiOnHomepage` | Whether the original AI study flagged a GenAI experience on the municipal homepage. |
| `origins` | Which internship study contributed the record. |
| `sources` | One or more public source objects with URL, domain, type, verification label, and origin. |

No public field includes staff contact information, raw private notes, rejected internal URL metadata, credentials, private pricing, or operational security details.
