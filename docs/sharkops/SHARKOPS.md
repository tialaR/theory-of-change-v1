# SharkOps

SharkOps is a project-governance engine for new applications, refactors and architectural restructures.

Its central principle is **Knowledge as Code**: important project knowledge must live in the repository, be versioned, verified and usable by humans and agents.

## Attack language

- **Target acquired:** the repository was identified.
- **Bite queued:** a change package exists but is not ready.
- **Gate breach:** an executable contract failed.
- **No regression detected:** the inspected contract passed.
- **Attack posture controlled:** changes are explicit, reversible and verified.

## Rules

1. No approved architectural decision may live only in chat.
2. Every validated rule must become an executable gate.
3. No bite is READY without apply, verify and rollback.
4. SharkOps orchestrates existing project gates before replacing or extending them.
5. Product identity and renaming require an explicit recorded decision.
