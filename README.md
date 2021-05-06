# COVDM
 
> Application réalisée en L3 Informatique dans l'UE Technologies du Web

[Consulter le projet en exécution](https://covdm.herokuapp.com/)

Vidéo :

[![Vidéo de présentation](https://img.youtube.com/vi/8GVctWU7Imo/0.jpg)](https://www.youtube.com/watch?v=8GVctWU7Imo)

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/) [![dependencies Status](https://david-dm.org/Harfeur/COVDM/status.svg)](https://david-dm.org/Harfeur/COVDM)
## Usage

### Requis

- NodeJS [lien](https://nodejs.org/en/download/)

### Installation

- Executer `npm i` dans le terminal
- Créer un fichier `.env` avec les variables suivantes :
 - `PORT` Le port à utiliser
 - `MONGO_URI` L'URI de la base mongo contenant les différentes collections du dossier `/data`
- Lancer le programme avec `node index.js --dev`

## Fonctionalités

- Cartographie des centres de dépistage et de vaccination
- Affichage de statistiques
- Ajout de commentaires
- Modification de la base de données

## Équipe

| <a href="https://www.github.com/Harfeur" target="_blank">**Maxime Chourré**</a> | <a href="https://www.github.com/SDailhau" target="_blank">**Sandra Dailhau**</a> | <a href="https://www.github.com/Llaplace" target="_blank">**Lisa Laplace**</a> |
| :---: |:---:| :---:|
| <a href="https://www.github.com/Harfeur" target="_blank"><img src="https://www.github.com/Harfeur.png" width=200 height=200 ></a> | <a href="https://www.github.com/SDailhau" target="_blank"><img src="https://www.github.com/SDailhau.png" width=200 height=200 ></a> | <a href="https://www.github.com/Llaplace" target="_blank"><img src="https://www.github.com/Llaplace.png" width=200 height=200 ></a> |
| <a href="https://www.github.com/Harfeur" target="_blank">`github.com/Harfeur`</a> | <a href="https://www.github.com/SDailhau" target="_blank">`github.com/SDailhau`</a> | <a href="http://github.com/Llaplace" target="_blank">`github.com/Llaplace`</a> |

Merci à David Panzoli pour son aide et pour ses cours.

---

## Sources

- [Centres de dépistage COVID](https://www.data.gouv.fr/fr/datasets/sites-de-prelevements-pour-les-tests-covid/)
- [SItes de vaccination COVID](https://www.data.gouv.fr/fr/datasets/lieux-de-vaccination-contre-la-covid-19/)
- Bouton mini-popup : Copyright (c) 2021 by Yuhomyan (https://codepen.io/yuhomyan/pen/OJMejWJ)

## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/"><img alt="Licence Creative Commons" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" /></a><br />Ce(tte) œuvre est mise à disposition selon les termes de la <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Licence Creative Commons Attribution - Pas d’Utilisation Commerciale - Partage dans les Mêmes Conditions 4.0 International</a>.
