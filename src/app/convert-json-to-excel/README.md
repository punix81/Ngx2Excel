# Convert JSON to Excel/CSV

Ce composant permet de fusionner plusieurs fichiers JSON en un seul fichier Excel ou CSV.

## Fonctionnalités

- **Upload multiple** : Sélectionnez un ou plusieurs fichiers JSON
- **Fusion automatique** : Tous les fichiers sont fusionnés en un seul document
- **Formats supportés** : Export en Excel (.xlsx) ou CSV (.csv)
- **Aplatissement des données** : Les objets JSON imbriqués sont automatiquement aplatis
- **Interface simple** : Interface utilisateur claire et intuitive

## Utilisation

1. Cliquez sur "Choisir des fichiers JSON" pour sélectionner un ou plusieurs fichiers
2. Les fichiers sélectionnés s'affichent avec leur taille
3. Choisissez le format de sortie (Excel ou CSV)
4. Cliquez sur "Convertir et Télécharger"
5. Le fichier fusionné sera automatiquement téléchargé

## Structure des données

Le fichier généré contiendra :
- **Colonne 1 "key"** : Les clés de traduction (aplaties si imbriquées)
- **Colonnes suivantes** : Une colonne par fichier JSON avec les valeurs correspondantes

Ce format est parfait pour les fichiers de traduction i18n !

### Exemple

**Fichier 1 (fr.json):**
```json
{
  "welcome": {
    "title": "Bienvenue",
    "message": "Bienvenue sur notre application"
  },
  "menu": {
    "home": "Accueil",
    "profile": "Profil"
  }
}
```

**Fichier 2 (en.json):**
```json
{
  "welcome": {
    "title": "Welcome",
    "message": "Welcome to our application"
  },
  "menu": {
    "home": "Home",
    "profile": "Profile"
  }
}
```

**Résultat Excel/CSV:**
| key | fr.json | en.json |
|-----|---------|---------|
| menu.home | Accueil | Home |
| menu.profile | Profil | Profile |
| welcome.message | Bienvenue sur notre application | Welcome to our application |
| welcome.title | Bienvenue | Welcome |

**Note:** Les clés sont triées alphabétiquement pour faciliter la lecture.

## Composant Standalone

Ce composant est configuré en mode standalone et peut être importé directement :

```typescript
import { ConvertJsonToExcelComponent } from './path/to/convert-json-to-excel.component';

imports: [ConvertJsonToExcelComponent]
```

## Dépendances

- **xlsx** : Bibliothèque pour générer des fichiers Excel
- **@angular/common** : Module Angular standard

## Tests

Les tests unitaires sont disponibles pour le service et le composant :

```bash
npm test
```
