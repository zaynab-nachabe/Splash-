# Livrable SPLASH! – Tests et documentation OPS

## 1. État Actuel du Projet

### Status: 🟡 Partiellement Opérationnel

#### Infrastructure
- ✅ Conteneurs Docker en production
- ✅ Healthchecks opérationnels
- ✅ Communication inter-conteneurs
- ✅ Pipeline CI/CD

#### Tests
- ⚠️ Tests E2E: 9 échecs sur la dernière exécution

#### Healthchecks Status
```bash
Backend  [localhost:8081] : ✅ UP (last check: 200 OK)
Frontend [localhost:8080] : ✅ UP (last check: 200 OK)
E2E Tests: ⚠️ 9 Failed, 23 Passed
```

---

## 2. Objectifs des tests

Afin d’évaluer l’efficacité, l’utilisabilité et l’intérêt pédagogique de notre jeu de frappe clavier destiné aux enfants atteints de dysgraphie et/ou dyslexie, nous avons structuré notre campagne de tests autour de trois grands axes :

- **Intérêt thérapeutique** : Capacité du jeu à améliorer les compétences en dactylographie.
- **Intérêt de suivi** : Capacité à tracer et analyser les performances pour personnaliser l’expérience.
- **Utilisabilité** : Capacité de l’enfant et de l’ergothérapeute à utiliser efficacement le jeu.

---

## 3. Stratégie de tests

### a. **Tests d’utilisabilité**
Objectif : S’assurer que l’interface est intuitive et que l’effort de l’utilisateur est consacré à l’apprentissage plutôt qu’à comprendre l’outil.

- Vérification de la navigation pour l’enfant et l’ergothérapeute.
- Simulations avec différentes vitesses de lecture pour prendre en compte les temps de traitement cognitifs :
  - Enfants non dyslexiques : 1 à 2 secondes après lecture.
  - Enfants dyslexiques : 3 à 5 secondes.
- Tests de clarté des interfaces, retours visuels/audio, et accessibilité.

---

### b. **Tests liés au suivi (tracking)**
Objectif : Vérifier que le suivi des progrès est fiable et exploitable par l’ergothérapeute.

- Vérification de la génération et lisibilité des statistiques :
  - Statistiques de base (vitesse, précision, erreurs).
  - Statistiques historiques et moyennes.
- Tests multi-utilisateurs : distinguer les profils, conserver les historiques individuels.
- Tests de personnalisation basés sur les données collectées :
  - Adaptation des configurations de jeu selon les progrès détectés.

---

### c. **Tests d’intérêt thérapeutique**
Objectif : Évaluer si le jeu contribue effectivement à améliorer les compétences de frappe.

- Simulations avec différentes configurations de lettres selon les difficultés spécifiques détectées.
- Suivi sur plusieurs séances pour évaluer l’évolution des performances.
- Préparation d’analyses comparatives (pré/post utilisation) à intégrer lors de la mise en production.

---

## 4. Scénarios de test détaillés

### **Tests d’accessibilité et de jouabilité**
- Différentes vitesses de lecture avec timeout ajustable.
- Possibilité de jouer sans devoir taper beaucoup (accessibilité dyslexie).
- Tests de tous les types de questions.
- Combinaisons de configurations (longueur de jeu, types d’exercices).

### **Tests de suivi et personnalisation**
- Statistiques de base.
- Historique des sessions.
- Calcul de moyennes.
- Comportement en multi-utilisateur.

### **Tests de paramétrage**
- Modification de la config côté ergothérapeute.
- Personnalisation de la config enfant.
- Sauvegarde persistante des paramètres.
- Génération dynamique de lettres selon les stats.

### **Tests des utilisateurs**
- Ajout/suppression/sélection d’utilisateur.
- Ajout et réinitialisation de conditions.
- Gestion de doublons (mêmes prénoms).

### **Tests du caractère ludique**
- Rejouabilité (envie de recommencer).
- Système de récompenses (ex : poissons).
- Test des éléments de gratification et motivation.

---

## 5. Documentation OPS

### A. Démarrage du projet
```bash
# Lancer l'application en production
docker-compose up -d

# Vérifier l'état des services
docker-compose ps

# Lancer les tests E2E
docker-compose -f docker-compose.e2e.yml up --build

# Consulter les logs
docker-compose logs -f
```

### B. Monitoring
- Healthchecks toutes les 30s
- Retry: 3 tentatives
- Timeout: 10s
- Start period: 40s

### C. Tests E2E
Dernière exécution:
- Total: 32 tests
- Réussis: 23
- Échoués: 9
- Principaux échecs:
  - Navigation utilisateur (3 tests)
  - Persistance des données (4 tests)
  - Performance du jeu (2 tests)

---

## 6. Conclusion
Les tests réalisés valident la pertinence du jeu du point de vue :
- de l'enfant utilisateur (facilité, plaisir) ;
- de l’ergothérapeute (outil d’accompagnement et de mesure) ;
- des objectifs pédagogiques (apprentissage progressif et adaptatif).

Credit : Copilot (Please help me clean up my markdown)