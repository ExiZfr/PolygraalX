# 🚀 Configuration du Déploiement Automatique

## ✅ Étape 1 : Ajouter les Secrets GitHub

Va sur : https://github.com/ExiZfr/PolygraalX/settings/secrets/actions

Ajoute ces 4 secrets :

### 1. `SSH_HOST`
L'adresse IP de ton VPS
```
Exemple: 123.45.67.89
```

### 2. `SSH_USER`
Ton utilisateur SSH (probablement `root`)
```
root
```

### 3. `SSH_PORT`
Le port SSH (généralement 22)
```
22
```

### 4. `SSH_KEY`
Ta clé privée SSH

Sur ton VPS, récupère-la avec :
```bash
cat ~/.ssh/id_rsa
```

Copie **TOUT** le contenu (incluant `-----BEGIN` et `-----END`)

---

## ✅ Étape 2 : Push le Workflow

Une fois les secrets ajoutés, push ce commit :

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add auto-deploy workflow"
git push
```

---

## 🎉 C'est tout !

À partir de maintenant, **à chaque push sur `main`**, le déploiement se fera automatiquement :

1. ✅ Pull des changements
2. ✅ Installation des dépendances
3. ✅ Build de l'app
4. ✅ Redémarrage PM2

Tu verras les déploiements ici :
https://github.com/ExiZfr/PolygraalX/actions
