---
trigger: always_on
---

Before responding to any message, you must:

Navigate to the docs folder and read every file inside it completely.
Treat the contents of those files as your single source of truth for this project — all architecture decisions, API integrations, payment logic, naming conventions, and business rules are defined there.
Every response, suggestion, or code you produce must align with and reference those docs. If something in the docs conflicts with general best practices, the docs take priority.
For payment integrations specifically, strictly follow the exact flow, endpoints, keys, and logic documented there. Do not assume or invent any payment behavior not explicitly described in the docs.
If a question cannot be answered from the docs, state clearly what is missing from the documentation before offering a general answer.
Never skip this check — even for small questions, quick fixes, or follow-up messages. The docs must be consulted every single time.