# Academy code guidelines

The academy code (institution code) is the permanent, platform-wide identifier a
Mobius employee chooses when provisioning an academy in the admin console.
It is an internal tenant ID **and** the registration invite key — families type
it into the registration forms — but it no longer appears at login (email +
password locates the tenant via the registry directory).

## Hard rules (system-enforced)

These are checked by the provisioning endpoint and a registry `CHECK`
constraint (`^[A-Za-z0-9_-]{3,32}$`, `CITEXT UNIQUE`):

1. **3–32 characters**: letters, digits, `_` or `-` only. No spaces.
2. **Globally unique, case-insensitively** — `UW123` and `uw123` are the same
   code and cannot coexist.
3. **Stored uppercase.** The provisioning endpoint trims and uppercases the
   code before validating/storing (2026-08-11); the admin console's code field
   uppercases as you type. Whatever casing goes in, `BRIGHT01` is what exists.
4. **Immutable.** There is no rename flow, deliberately: the code is embedded
   in every JWT, every `user_directory` row, the registry mapping, and any
   printed/sent registration invite. Choose it like a permanent ID.

## Conventions (follow unless there's a reason not to)

1. **Uppercase letters and digits only.** Lookups are case-insensitive, but one
   canonical written form (`BRIGHT01`, never `bright01`) keeps invites,
   support conversations, and the admin console consistent. Skip `_` and `-`
   — they read badly over the phone.
2. **4–10 characters.** Long enough to be recognizable, short enough to say
   aloud and type on a phone. The 32-char ceiling is a technical bound, not a
   target.
3. **Derive it from the academy name**: a memorable stem (3–8 letters), plus a
   2-digit disambiguator only if the stem is taken — `BRIGHT01` for Bright
   Minds Academy, `UW123` for Univer Prep. The code should be guessable-back
   ("whose code is this?") by a Mobius employee reading a support ticket.
4. **Avoid ambiguous characters where possible.** Families receive codes
   verbally and in print: prefer stems without `O`/`0` and `I`/`1`/`L`
   collisions (`BRIGHT01` is fine — the digits are clearly a suffix).
5. **No personal data** — never a person's name, email, or phone fragment. The
   code outlives owners and shows up in logs.
6. **Reserved stems** — never assign to a real academy: anything starting with
   `TEST`, `DEMO`, `SANDBOX`, `MOBIUS`, or `ADMIN`. These are for internal
   and sandbox tenants so they're recognizable at a glance in the registry
   and excludable from finance reporting.

## Where the code is used (why it's immutable)

- Registry: `institutions.code → conn_string` (which database serves the tenant)
- Every access/refresh JWT: `tenantCode` claim
- Registry login directory: `user_directory.code` (email → tenant)
- Registration forms: required field, sent as `X-Institution-Code`
- Admin console: provisioning, per-academy config, finance rows

## Not yet enforced (candidates if codes proliferate)

- Server-side rejection of reserved stems for non-internal academies
