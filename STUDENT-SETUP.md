# 🚀 AI Academy 2026 - Setup Guide

Tento návod ťa prevedie nastavením všetkých nástrojov, ktoré budeš potrebovať.

**Časový odhad:** 15-20 minút

---

## Krok 1: GitHub účet (5 min)

### Ak NEMÁŠ GitHub účet:

1. Choď na [github.com](https://github.com)
2. Klikni **Sign up**
3. Použi svoj **pracovný email** (kvôli identifikácii)
4. Username: odporúčam `meno-priezvisko` alebo `mpriezvisko`

### Ak MÁŠ GitHub účet:

1. Over, že si prihlásený
2. Skontroluj, že máš nastavený správny email

---

## Krok 2: Vytvor si repozitár (3 min)

### Možnosť A: Fork template (odporúčané)

1. Choď na: `https://github.com/kyndryl-ai-academy/student-template`
2. Klikni **"Use this template"** → **"Create a new repository"**
3. Názov: `ai-academy-2026`
4. Visibility: **Public** (potrebné pre dashboard)
5. Klikni **Create repository**

### Možnosť B: Manuálne vytvorenie

```bash
# Klonovať template
git clone https://github.com/kyndryl-ai-academy/student-template.git ai-academy-2026
cd ai-academy-2026

# Zmeniť remote na tvoj vlastný repo
git remote remove origin
git remote add origin https://github.com/TVOJ-USERNAME/ai-academy-2026.git
git push -u origin main
```

---

## Krok 3: Nastav webhook (2 min)

Toto umožní automatické zaznamenávanie tvojich submisií na dashboard.

1. V tvojom repozitári choď na **Settings** → **Webhooks**
2. Klikni **Add webhook**
3. Vyplň:
   - **Payload URL:** `https://ai-academy-dashboard.vercel.app/api/webhook/github`
   - **Content type:** `application/json`
   - **Secret:** `[dostaneš od mentora]`
   - **Events:** Select **"Just the push event"**
4. Klikni **Add webhook**

✅ Teraz každý push do repozitára sa automaticky zaznamená!

---

## Krok 4: Vyplň svoje údaje (2 min)

1. Otvor súbor `README.md` v tvojom repozitári
2. Vyplň sekciu **"O mne"**:
   ```markdown
   ## 👤 O mne

   | | |
   |---|---|
   | **Meno** | Jana Nováková |
   | **Rola** | FDE |
   | **Tím** | Alpha |
   | **Stream** | Tech |
   ```
3. Commit a push:
   ```bash
   git add README.md
   git commit -m "Add my info"
   git push
   ```

---

## Krok 5: Registrácia v dashboarde (1 min)

1. Choď na: `https://ai-academy-dashboard.vercel.app/register`
2. Vyplň formulár:
   - GitHub username
   - Meno
   - Email
   - Rola (vyber z dropdown)
   - Tím (pridelený mentorom)
3. Klikni **Register**

✅ Mal by si sa objaviť na leaderboarde!

---

## Krok 6: Test submisie (2 min)

Overme, že všetko funguje:

1. Otvor súbor `day-01-agent-foundations/README.md`
2. Pridaj niečo (napr. svoje meno)
3. Commit a push:
   ```bash
   git add .
   git commit -m "Test submission"
   git push
   ```
4. Choď na dashboard → Mal by si vidieť svoju aktivitu!

---

## 🔧 Troubleshooting

### Webhook nefunguje

- Over, že URL je správna
- Over, že secret je správny (dostaneš od mentora)
- Skontroluj **Recent Deliveries** v GitHub webhook settings

### Nevidím sa na dashboarde

- Over, že si sa zaregistroval
- Over, že tvoj GitHub username je správne napísaný

### Push nejde

```bash
# Ak nemáš práva, skús:
git remote set-url origin https://TVOJ-USERNAME@github.com/TVOJ-USERNAME/ai-academy-2026.git
```

---

## 📱 Rýchle linky

| Nástroj | URL |
|---------|-----|
| Dashboard | `https://ai-academy-dashboard.vercel.app` |
| Template repo | `https://github.com/kyndryl-ai-academy/student-template` |
| Webhook URL | `https://ai-academy-dashboard.vercel.app/api/webhook/github` |
| Slack #ai-academy-help | [link] |

---

## ✅ Checklist

- [ ] GitHub účet vytvorený/overený
- [ ] Repozitár `ai-academy-2026` vytvorený
- [ ] Webhook nastavený
- [ ] Údaje v README vyplnené
- [ ] Registrácia v dashboarde
- [ ] Test push úspešný

**Si pripravený na Deň 1!** 🎉

---

*Ak máš problémy, napíš na Slack #ai-academy-help alebo kontaktuj mentora.*
