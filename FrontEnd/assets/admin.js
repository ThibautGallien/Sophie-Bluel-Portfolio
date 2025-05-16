document.addEventListener("DOMContentLoaded", () => {
  let worksData = [];

  // Sélection des éléments communs
  const editLink = document.querySelector(".edit-link");
  const modal = document.getElementById("modal-gallery");
  const closeModalBtn = document.getElementById("close-modal-btn");

  // Sélection des deux vues de la modale
  const modalViewGallery = document.getElementById("modal-view-gallery");
  const modalViewAdd = document.getElementById("modal-view-add");

  // Boutons pour changer de vue
  const addPhotoBtn = document.getElementById("add-photo-btn");
  const backButton = document.getElementById("back-button");

  // Sélection du formulaire d'ajout et des éléments d'upload
  const addPhotoForm = document.getElementById("add-photo-form");
  const photoInput = document.getElementById("photo-input");
  const previewImg = document.getElementById("preview-img");
  const titleInput = document.getElementById("title-input");
  const categorySelect = document.getElementById("category-select");
  const validateBtn = document.getElementById("validate-btn");

  // Par défaut, le bouton "Valider" n'est pas actif
  validateBtn.classList.remove("active");

  // Lorsque l'utilisateur sélectionne un fichier, mettre à jour l'aperçu et masquer le label et le texte
  photoInput.addEventListener("change", () => {
    if (photoInput.files.length > 0) {
      const file = photoInput.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
      // Masquer le label et le texte d'info
      document.querySelector(".add-photo-label").style.display = "none";
      document.querySelector(".upload-info").style.display = "none";
      // Activer le bouton "Valider"
      validateBtn.classList.add("active");
    } else {
      document.querySelector(".add-photo-label").style.display = "inline-block";
      document.querySelector(".upload-info").style.display = "block";
      validateBtn.classList.remove("active");
    }
  });

  // Ouvrir la modale en affichant la vue Galerie par défaut
  editLink.addEventListener("click", (event) => {
    event.preventDefault();
    modal.classList.remove("hidden");
    modalViewGallery.classList.remove("hidden");
    modalViewAdd.classList.add("hidden");
  });

  // Fermer la modale
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  // Fermer la modale en cliquant en dehors du contenu
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });

  // Passage à la vue "Ajout photo"
  addPhotoBtn.addEventListener("click", () => {
    modalViewGallery.classList.add("hidden");
    modalViewAdd.classList.remove("hidden");
  });

  // Bouton retour pour revenir à la vue "Galerie photo"
  backButton.addEventListener("click", () => {
    modalViewAdd.classList.add("hidden");
    modalViewGallery.classList.remove("hidden");
  });

  // Récupérer les travaux depuis l'API
  fetch("http://localhost:5678/api/works")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des travaux");
      }
      return response.json();
    })
    .then((works) => {
      worksData = works;
      displayWorks(worksData);
      displayModalGallery(worksData);
    })
    .catch((error) => console.error("Erreur :", error));

  // Fonction pour afficher la galerie publique (section Portfolio)
  const displayWorks = (works) => {
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
  };

  // Fonction pour afficher la galerie dans la vue "Galerie photo" de la modale
  const displayModalGallery = (works) => {
    const modalGalleryContent = document.getElementById(
      "modal-gallery-content"
    );
    modalGalleryContent.innerHTML = "";
    works.forEach((work) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

      // Création de l'icône corbeille
      const trashIcon = document.createElement("img");
      trashIcon.src = "./assets/icons/trash-icon.png";
      trashIcon.classList.add("trash-icon");
      trashIcon.addEventListener("click", () => {
        fetch(`http://localhost:5678/api/works/${work.id}`, {
          method: "DELETE",
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Erreur lors de la suppression");
            }
            figure.remove();
            worksData = worksData.filter((w) => w.id !== work.id);
            displayWorks(worksData);
          })
          .catch((error) => console.error(error));
      });

      figure.appendChild(img);
      figure.appendChild(trashIcon);
      modalGalleryContent.appendChild(figure);
    });
  };

  // Gestion du formulaire d'ajout de photo
  addPhotoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (photoInput.files.length === 0) {
      alert("Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", photoInput.files[0]);
    formData.append("title", titleInput.value);
    formData.append("category", categorySelect.value);

    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erreur lors de l'ajout du projet");
        }
        return response.json();
      })
      .then((newWork) => {
        worksData.push(newWork);
        displayWorks(worksData);
        displayModalGallery(worksData);
        addPhotoForm.reset();
        previewImg.src = "./assets/icons/placeholder-image.png";
        document.querySelector(".add-photo-label").style.display =
          "inline-block";
        document.querySelector(".upload-info").style.display = "block";
        validateBtn.classList.remove("active");
        modalViewAdd.classList.add("hidden");
        modalViewGallery.classList.remove("hidden");
      })
      .catch((error) => console.error(error));
  });

  // Récupérer les catégories depuis l'API et remplir les filtres et le select
  fetch("http://localhost:5678/api/categories")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories");
      }
      return response.json();
    })
    .then((categories) => {
      const filtersContainer = document.querySelector(".filters");
      filtersContainer.innerHTML = "";

      const allButton = document.createElement("button");
      allButton.innerText = "Tous";
      allButton.classList.add("active");
      allButton.addEventListener("click", () => {
        document
          .querySelectorAll(".filters button")
          .forEach((btn) => btn.classList.remove("active"));
        allButton.classList.add("active");
        displayWorks(worksData);
      });
      filtersContainer.appendChild(allButton);

      categories.forEach((category) => {
        const button = document.createElement("button");
        button.innerText = category.name;
        button.addEventListener("click", () => {
          document
            .querySelectorAll(".filters button")
            .forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
          const filteredWorks = worksData.filter(
            (work) => work.category && work.category.id === category.id
          );
          displayWorks(filteredWorks);
        });
        filtersContainer.appendChild(button);
      });

      // Remplissage du select dans le formulaire d'ajout photo
      categorySelect.innerHTML = "";
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => console.error("Erreur :", error));
});
