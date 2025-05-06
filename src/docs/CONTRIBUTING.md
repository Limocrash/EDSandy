# CONTRIBUTING.MD

>[!IMPORTANT]
>
> As we are moving to a new architectural structure for
> something like the 4th or 5th time between various instances of Claude
> and ChatGPT, I think it's important to begin documenting an architectural
> standard we can implement in this and all future dev projects of the same nature
> (i.e., anything that involves a spreadsheet or database with an html webapp
> interface that have separate repositories). As we move forward, I would like to
> begin recording important notes like the doc block in UT_Globals.js re: what  
> a Config! should look like, or the doc block below regarding using
> /CORE folder files to contain all onOpen(), onEdit(), onPost() and doGet()
> functions. This info will go into CONTRIBUTING.md and be fed to new chats, and
> also appear in blocks like the one above in the code itself, so each chat instance
> understands the conventionse we are using and doesn't go off on its own tangents.

## Trigger / Web‑App conventions

* Only **CORE_Bootstrap.gs** defines onOpen, onEdit, doGet, doPost.
* All modules add menu items via CORE_Menu.register(…) or registerTesting(…).
* All new web‑app endpoints expose pure functions and are wired in CORE_Dispatch.
