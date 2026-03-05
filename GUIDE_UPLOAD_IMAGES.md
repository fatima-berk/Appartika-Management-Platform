# Guide de dépannage - Upload d'images d'appartement

## Problèmes courants et solutions

### 1. Ajouter la colonne `file_path` à la base de données

**Option A : Via migration Laravel**
```bash
cd backend
php artisan migrate
```

**Option B : Via SQL direct (phpMyAdmin)**
Exécutez le fichier `ADD_FILE_PATH_COLUMN.sql` dans phpMyAdmin ou exécutez cette commande SQL :

```sql
ALTER TABLE `apartment_images` 
ADD COLUMN `file_path` VARCHAR(255) NULL AFTER `image_url`;
```

### 2. Créer le lien symbolique storage

Laravel a besoin d'un lien symbolique pour servir les fichiers stockés. Exécutez :

```bash
cd backend
php artisan storage:link
```

Cela créera un lien de `public/storage` vers `storage/app/public`.

### 3. Vérifier les permissions

Assurez-vous que les dossiers de stockage ont les bonnes permissions :

```bash
cd backend
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### 4. Vérifier la configuration CORS

Assurez-vous que votre fichier `backend/config/cors.php` autorise les requêtes depuis votre frontend.

### 5. Vérifier les logs

**Logs Laravel :**
```bash
cd backend
tail -f storage/logs/laravel.log
```

**Logs navigateur :**
Ouvrez la console du navigateur (F12) et regardez les messages dans l'onglet Console.

### 6. Tester l'upload manuellement

Ouvrez la console du navigateur et testez :

```javascript
// Vérifier que le token est présent
console.log(localStorage.getItem('token'));

// Vérifier que l'utilisateur est connecté
console.log(localStorage.getItem('user'));
```

### 7. Vérifier que le serveur Laravel est démarré

```bash
cd backend
php artisan serve
```

Le serveur doit être accessible sur `http://127.0.0.1:8000`

## Checklist de vérification

- [ ] La colonne `file_path` existe dans la table `apartment_images`
- [ ] Le lien symbolique `public/storage` existe
- [ ] Les permissions sur `storage/app/public` sont correctes
- [ ] Le serveur Laravel est démarré
- [ ] Vous êtes connecté (token présent dans localStorage)
- [ ] Vous êtes le propriétaire de l'appartement
- [ ] Le fichier image est valide (format et taille < 5MB)

## Messages d'erreur courants

### "Colonne 'file_path' introuvable"
→ Exécutez la migration ou le script SQL pour ajouter la colonne

### "The stream or file could not be opened"
→ Vérifiez les permissions sur `storage/app/public`

### "Route [storage] not defined"
→ Exécutez `php artisan storage:link`

### "Accès non autorisé" ou 403
→ Vérifiez que vous êtes connecté et que vous êtes le propriétaire de l'appartement

### "Aucun fichier image fourni" ou 400
→ Vérifiez que le fichier est bien sélectionné et que le format est valide (JPG, PNG, GIF, WEBP)









