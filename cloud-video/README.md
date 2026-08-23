# cloud-video/

**Point other Cursor chats / agents here.**

Path (absolute):
```
C:\Users\jessi\Desktop\aftercut\cloud-video
```

Local Browser = screenshots only.  
**Video** = Cursor **Cloud Agent** + **Computer Use** → **Artifacts** (mp4-style demos).

## Chat paste (one liner)

```
Read C:\Users\jessi\Desktop\aftercut\cloud-video\README.md and run the launcher for my video. Need CURSOR_API_KEY in shell. Use Computer Use + video Artifacts.
```

## Files

| File | Role |
|---|---|
| `launch.mjs` | Generic Cloud Agent API launcher (any GitHub repo) |
| `film.mjs` | AFTERCUT jam film preset (`presets/aftercut-film.md`) |
| `presets/` | Prompt templates — add your own |
| `env.example` | Key *names* only (never real secrets) |

## Run AFTERCUT film

```powershell
cd C:\Users\jessi\Desktop\aftercut
$env:CURSOR_API_KEY = "cursor_..."   # dashboard → Integrations
# MINDS_* picked up from aftercut .env.local if present
node cloud-video\film.mjs
```

## Run AgroLink film

```powershell
cd C:\Users\jessi\Desktop\aftercut
$env:CURSOR_API_KEY = "cursor_..."
node cloud-video\agrolink-film.mjs
```

Preset: `presets/agrolink-film.md` → repo `henrysammarfo/agrolink`, live demo `https://agrolink-omega.vercel.app`.

## Run AXIS film

```powershell
cd C:\Users\jessi\Desktop\aftercut
$env:CURSOR_API_KEY = "cursor_..."
node cloud-video\axis-film.mjs
```

Preset: `presets/axis-film.md` → repo `henrysammarfo/axis`, live demo `https://axis-mainnet.vercel.app`.

## Run OPAL film

```powershell
cd C:\Users\jessi\Desktop\aftercut
$env:CURSOR_API_KEY = "cursor_..."
node cloud-video\opal-film.mjs
```

Preset: `presets/opal-film.md` → repo `henrysammarfo/tryopal`, live demo `https://tryopal.asia`. Default model: `composer-2.5` (Cloud Agent API; opus/gpt-5 slugs return 400).

## Run any other product video

```powershell
cd C:\Users\jessi\Desktop\aftercut   # or any cwd
$env:CURSOR_API_KEY = "cursor_..."
$env:CLOUD_REPO = "https://github.com/owner/repo"
$env:CLOUD_REF = "main"
$env:CLOUD_NAME = "My demo video"
$env:CLOUD_MODEL = "composer-2.5"    # pin — bare gpt-5 returns 400
$env:CLOUD_PROMPT = "Use Computer Use. Full E2E UI film. Video Artifact required (not screenshots-only). Click path: ..."
# optional VM secrets as JSON:
# $env:CLOUD_ENV_VARS = '{"SOME_API_KEY":"..."}'
node C:\Users\jessi\Desktop\aftercut\cloud-video\launch.mjs
```

Or put the walk script in a file:

```powershell
$env:CLOUD_PROMPT_FILE = "C:\Users\jessi\Desktop\aftercut\cloud-video\presets\my-walk.md"
node C:\Users\jessi\Desktop\aftercut\cloud-video\launch.mjs
```

## Magmos film artifacts (committed)

Recorded walkthrough lives in-repo (not just Cursor Artifacts):

```
cloud-video/artifacts/magmos/magmos-live-walkthrough.mp4
cloud-video/artifacts/magmos/screenshots/
```

Site: https://magmoslabs.vercel.app · preview via `MAGMOS_FILM_URL` env (never commit the token).

## Output

Script prints JSON with:
- `url` → open `https://cursor.com/agents/bc-…`
- `agentId` / `runId`
- watch **Artifacts** for the **video**

## Rules

1. Never commit `CURSOR_API_KEY` or app secrets  
2. Pin model (`composer-2.5` works)  
3. Secrets → shell / `.env.local` / `CLOUD_ENV_VARS`, not the prompt if avoidable  
4. Multi-root workspaces: prefer API (this folder) over in-chat Task `environment:cloud`

API: `POST https://api.cursor.com/v1/agents` (Basic auth with API key).
