# Overview

[Spectral](https://stoplight.io/open-source/spectral) is a powerful and widely adopted open‑source linter for OpenAPI and AsyncAPI specifications. If your organization produces API contracts, you should strongly consider (or are already) using Spectral as part of your design and governance workflow.

We have relied on Spectral for years and value its flexibility and rule authoring model. During real‑world, large‑scale use we encountered a few practical gaps. This project documents and shares the enhancements and workflow patterns we developed to address those gaps so that teams can improve consistency, quality, and governance without adding friction.

## Enhancements Provided

1. **Scalable multi‑file linting**  
   Spectral’s CLI traditionally targets a single file per invocation. In repositories containing dozens or hundreds of contracts, this makes comprehensive validation cumbersome for local development and CI/CD. Our approach enables efficient, concurrent linting across all contracts with a single command, supporting both pre‑commit checks and pipeline enforcement.
2. **Embedded, maintainable rule documentation**  
   Clear rationale behind each rule accelerates onboarding and fosters shared API design principles. We integrate human‑readable guidance directly alongside rule configuration so engineers understand not only what failed, but why the rule exists and how to remediate.
3. **Fine‑grained, auditable exceptions**  
   Mature API governance acknowledges legitimate edge cases. We provide a structured, reviewable mechanism to declare narrowly scoped exceptions without weakening overall standards. Exceptions are traceable, time‑bound (optionally), and CI/CD aware—allowing pipelines to pass while preserving visibility and accountability.

## Benefits

- Faster feedback loops for contract authors
- Consistent enforcement across local and automated environments
- Lower onboarding time through in‑context education
- Reduced rule "fatigue" by distinguishing genuine violations from approved exceptions
- Improved auditability and governance transparency

## Intended Audience

API architects, platform and developer experience teams, and engineers responsible for designing, reviewing, or governing REST or event‑driven contracts.

## Next Steps

Explore the rule set and configuration examples, then integrate the multi‑file linting command into your development workflow. Contributions and suggestions are welcome.
