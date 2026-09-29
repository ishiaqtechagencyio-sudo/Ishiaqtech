# Cascade

Goal planning (yearly → monthly → weekly → daily) plus manual time tracking.

## Local mode (default)
Open `cascade.html` (or `index.html`). Data lives in that browser only. No passwords, no sharing.

## Cloud mode (real accounts, shared team)
1. Create a free project at supabase.com.
2. In the SQL editor, run `supabase/schema.sql`.
3. Project Settings → API: copy the Project URL and the `anon` public key into `config.js`.
4. Run `sh build.sh` to refresh `cascade.html`, then host the folder on any static host.
5. Sign up as `ishitechagency.io@gmail.com` first. That account becomes the team admin.
6. Admin → Invite members. Invited people create an account with the invited email and join the team.

Keep email confirmation on in Supabase Auth settings (it stops someone claiming the admin email before you do).

Privacy is enforced by row-level security in the database: members see only their own data; the admin sees team members' yearly and monthly goals, time entries and daily stats, never their weekly or daily goals, and cannot edit anything of theirs.
