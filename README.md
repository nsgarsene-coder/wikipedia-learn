 Wikipedia Learn

 Transformez n'importe quel sujet Wikipedia en parcours d'apprentissage interactif et gamifié.

[Voir le projet en live]https://wikipedia-learn-hetic-6wkprh5rx-nsgarsene-coders-projects.vercel.app/)



##  À propos

Wikipedia contient la connaissance du monde entier — mais personne ne sait vraiment *apprendre* avec. Les articles sont denses, sans structure pédagogique, sans progression, sans engagement.

**Wikipedia Learn** résout ce problème en transformant automatiquement n'importe quel article Wikipedia en une expérience d'apprentissage structurée, progressive et gamifiée.



## Fonctionnalités

-  **Recherche dynamique** — n'importe quel sujet Wikipedia fonctionne instantanément
-  **Carte mentale interactive** — les concepts clés représentés en cercles déverrouillables progressivement
-  **Quiz chronométrés** — 15 secondes par question, 3 questions par nœud
-  **Système XP** — chaque bonne réponse rapporte des points d'expérience
-  **Musiques débloquables** — récompenses audio selon le niveau atteint
-  **Page Achievements** — suivi de la progression globale
-  **Responsive** — adapté mobile et desktop



##  Parcours utilisateur

```
Recherche un sujet
      ↓
Explore les chapitres clés (cartes visuelles + images Wikipedia)
      ↓
Navigue dans la carte mentale (cercles verrouillés/déverrouillés)
      ↓
Lit le contenu du nœud sélectionné
      ↓
Teste sa compréhension (quiz 15s)
      ↓
Gagne des XP → débloque musiques et nœuds suivants




##  Stack technique

| Technologie | Usage |
| **React 19** | Framework UI |
| **TypeScript** | Typage statique |
| **Vite 7** | Bundler |
| **Tailwind CSS 4** | Styling |
| **Framer Motion** | Animations |
| **Wouter** | Routing |
| **Wikipedia REST API** | Contenu dynamique |
| **Vercel** | Déploiement |



##  Lancer le projet en local

```bash
# Cloner le repo
git clone https://github.com/nsgarsene-coder/wikipedia-learn.git
cd wikipedia-learn

# Installer les dépendances (pnpm requis)
pnpm install

# Lancer le serveur de développement
pnpm run dev


>  Ce projet utilise **pnpm**. Si vous n'avez pas pnpm : `npm install -g pnpm`

##  Structure du projet

```
wikipedia-learn/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Accueil + recherche
│   │   │   ├── SearchResults.tsx     # Résultats + chapitres
│   │   │   ├── MindmapPage.tsx       # Carte mentale interactive
│   │   │   ├── QuizPage.tsx          # Quiz chronométré
│   │   │   ├── RevisionPage.tsx      # Page de révision
│   │   │   ├── AchievementsPage.tsx  # Achievements
│   │   │   └── AuthPage.tsx          # Login / Register
│   │   ├── components/               # Composants réutilisables
│   │   ├── hooks/
│   │   │   └── useWikipedia.ts       # Hook API Wikipedia
│   │   ├── contexts/
│   │   │   └── AppContext.tsx        # État global (XP, progression)
│   │   └── App.tsx                   # Routing principal
├── server/
│   └── index.ts                      # Serveur Express
└── vercel.json                        # Config déploiement
```

---

##  API Wikipedia

Le projet exploite deux endpoints de l'API Wikipedia FR :

```
# Résumé d'un article
GET https://fr.wikipedia.org/api/rest_v1/page/summary/{titre}

# Recherche et sections
GET https://fr.wikipedia.org/w/api.php?action=query&...
```

Aucune clé API n'est requise — l'API Wikipedia est ouverte et gratuite.

---

##  Auteur

**Arsène N'Sougan**
Étudiant Data & AI — HETIC Paris
GitHub : [@nsgarsene-coder](https://github.com/nsgarsene-coder)
**Mohamed ALI**
Etudiant en DATA &IA _HETIC Paris
Github : https://github.com/Ali77225
**ALANE FOKO**
Etudiant en DATA & IA _HETIC Paris
Github: https://github.com/alanedeffo04-wq
**YASSINE ELAAROUSSI**
Etudiant en DATA & IA _ HETIC Paris
Github: https://github.com/Quix-0


---

##  Licence

Ce projet est réalisé dans le cadre d'un sprint de coding HETIC B1.
Le contenu affiché provient de Wikipedia sous licence [Creative Commons CC BY-SA](https://creativecommons.org/licenses/by-sa/4.0/).
