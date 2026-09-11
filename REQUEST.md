# Original Request

> ROLE: You are an autonomous AI agent running a self-directed build project. This is a test to 
> evaluate your ability to independently research, decide, coordinate, and execute end-to-end.
>
> OBJECTIVE
> Research and identify a type of software application that would meaningfully improve people's 
> lives or make something easier — something broadly useful, not niche or trivial. Then design, 
> build, QA, and deploy a fully working version of it yourself, without further input from me.
>
> RULES OF ENGAGEMENT
> - Do not ask me any clarifying questions.
> - Do not ask for permission before taking an action, EXCEPT where a one-time action genuinely 
>   requires a physical click from me (e.g., an OAuth consent screen, a DNS/domain confirmation, 
>   or approving a Proxmox resource request). Flag those clearly, in the moment, and keep moving 
>   on everything else.
> - Do not tell me what you're building while you're building it. Work silently until it's done 
>   or you hit a real blocker.
> - Make all product, design, and technical decisions yourself. Use your own judgment as if this 
>   were your own idea.
>
> USE YOUR OTHER AGENTS
> Don't do this solo if you have specialized agents available — delegate to them the way a real 
> team would:
> - Use a Research agent (or equivalent) to investigate the problem space and validate the idea 
>   before you commit to building it.
> - Use a QA agent (or equivalent) to actually test the finished application — functionality, 
>   usability, edge cases, and the login/access control boundary specifically — before you call 
>   it done.
> - Use any other specialized agents you have (e.g., for design, security review, deployment) 
>   wherever they'd genuinely improve the outcome.
> - In your final report and documentation, note which agents you used, for what, and what each 
>   one contributed or flagged.
>
> BUILD REQUIREMENTS
> 1. The end result must be genuinely usable the moment you hand it over — not a prototype or 
>    proof-of-concept.
> 2. You may provision a temporary LXC container on the Proxmox servers if needed for hosting, 
>    testing, or running services.
> 3. The interface must be clean and easy to use for a non-technical person on first visit.
> 4. The application must be publicly reachable at an online URL and usable by anyone who visits 
>    it. If any form of account/access control is needed to protect the underlying system, build 
>    a proper login/signup flow — regular visitors must NOT be able to alter or damage the core 
>    application, data, or configuration. Separate "user" access from "admin/owner" access.
> 5. Keep total token/compute cost under $20. If you project it will exceed that, stop, tell me 
>    the estimate and the reason, and wait for my go-ahead before continuing past that point.
> 6. Do not stop until the build is complete, QA'd, deployed, and verified working — or until you 
>    hit a genuine blocker you cannot resolve yourself (e.g., missing credential, hard 
>    infrastructure limit, required one-time click). If you hit a blocker, tell me exactly what 
>    it is and what you need from me to continue.
>
> WHEN YOU ARE DONE
> Report back with:
> 1. A clear "I'm done" statement.
> 2. What you built.
> 3. Why you chose this idea over other options you considered.
> 4. How it's meant to help people, and who the intended users are.
> 5. The URL and any login/access details I'll need.
> 6. Which agents you used (research, QA, etc.), what they did, and what they found.
> 7. Actual token/cost spent vs. the $20 budget.
>
> DELIVERABLE #2 — DOCUMENTATION
> In addition to the working application, produce a written document (for my later review) that 
> records:
> - This original request/prompt, in full.
> - Your research process and the options you considered before choosing.
> - The final decision and rationale.
> - Technical details: architecture, stack, where it's hosted (including any LXC/Proxmox setup), 
>   how login/access control works, and how to maintain or shut it down.
> - A summary of QA findings and any fixes made as a result.
> - Any blockers encountered and how they were resolved (or not).
>
> Begin now.
