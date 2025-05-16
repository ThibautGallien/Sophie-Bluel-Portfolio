// assets/index.js
document.addEventListener("DOMContentLoaded", () => {
  let worksData = [];

  // Affiche une liste de projets dans la galerie
  function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";
    works.forEach((work) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;
      const figcaption = document.createElement("figcaption");
      figcaption.innerText = work.title;
      figure.appendChild(img);
      figure.appendChild(figcaption);
      gallery.appendChild(figure);
    });
  }

  // Récupère et affiche tous les travaux
  fetch("http://localhost:5678/api/works")
    .then((res) => {
      if (!res.ok)
        throw new Error("Erreur lors de la récupération des travaux");
      return res.json();
    })
    .then((works) => {
      worksData = works;
      displayWorks(worksData);
    })
    .catch((err) => console.error(err));

  // Récupère les catégories, crée les filtres et gère leur comportement
  fetch("http://localhost:5678/api/categories")
    .then((res) => {
      if (!res.ok)
        throw new Error("Erreur lors de la récupération des catégories");
      return res.json();
    })
    .then((categories) => {
      const filtersContainer = document.querySelector(".filters");
      filtersContainer.innerHTML = "";

      // Bouton "Tous"
      const allBtn = document.createElement("button");
      allBtn.innerText = "Tous";
      allBtn.classList.add("active");
      allBtn.addEventListener("click", () => {
        document
          .querySelectorAll(".filters button")
          .forEach((b) => b.classList.remove("active"));
        allBtn.classList.add("active");
        displayWorks(worksData);
      });
      filtersContainer.appendChild(allBtn);

      // Boutons par catégorie
      categories.forEach((cat) => {
        const btn = document.createElement("button");
        btn.innerText = cat.name;
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".filters button")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          const filtered = worksData.filter(
            (w) => w.category && w.category.id === cat.id
          );
          displayWorks(filtered);
        });
        filtersContainer.appendChild(btn);
      });
    })
    .catch((err) => console.error(err));
});
