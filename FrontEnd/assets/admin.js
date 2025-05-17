// =====================================
// Vérification du token à l'ouverture
// =====================================
if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  let worksData = [];

  // =====================================
  // Sélection des éléments DOM principaux
  // =====================================
  const editLink = document.querySelector(".edit-link");
  const modal = document.getElementById("modal-gallery");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const modalViewGallery = document.getElementById("modal-view-gallery");
  const modalViewAdd = document.getElementById("modal-view-add");
  const addPhotoBtn = document.getElementById("add-photo-btn");
  const backButton = document.getElementById("back-button");
  const addPhotoForm = document.getElementById("add-photo-form");
  const photoInput = document.getElementById("photo-input");
  const previewImg = document.getElementById("preview-img");
  const titleInput = document.getElementById("title-input");
  const categorySelect = document.getElementById("category-select");
  const validateBtn = document.getElementById("validate-btn");

  // =====================================
  // Gestion de l'aperçu d'image
  // =====================================
  validateBtn.classList.remove("active");

  photoInput.addEventListener("change", () => {
    if (photoInput.files.length > 0) {
      const file = photoInput.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        previewImg.src = event.target.result;
      };
      reader.readAsDataURL(file);
      document.querySelector(".add-photo-label").style.display = "none";
      document.querySelector(".upload-info").style.display = "none";
      validateBtn.classList.add("active");
    } else {
      document.querySelector(".add-photo-label").style.display = "inline-block";
      document.querySelector(".upload-info").style.display = "block";
      validateBtn.classList.remove("active");
    }
  });

  // =====================================
  // Gestion modale ouverture / fermeture
  // =====================================
  if (editLink) {
    editLink.addEventListener("click", (event) => {
      event.preventDefault();
      modal.classList.remove("hidden");
      modalViewGallery.classList.remove("hidden");
      modalViewAdd.classList.add("hidden");
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("hidden");
    }
  });

  if (addPhotoBtn) {
    addPhotoBtn.addEventListener("click", () => {
      modalViewGallery.classList.add("hidden");
      modalViewAdd.classList.remove("hidden");
    });
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      modalViewAdd.classList.add("hidden");
      modalViewGallery.classList.remove("hidden");
    });
  }

  // =====================================
  // Affichage des projets dans la galerie
  // =====================================
  function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    if (!gallery) return;
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

  // =====================================
  // Affichage dans la modale
  // =====================================
  function displayModalGallery(works) {
    const modalGalleryContent = document.getElementById(
      "modal-gallery-content"
    );
    if (!modalGalleryContent) return;
    modalGalleryContent.innerHTML = "";
    works.forEach((work) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = work.imageUrl;
      img.alt = work.title;

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
          .then((res) => {
            if (!res.ok) throw new Error("Suppression échouée");
            figure.remove();
            worksData = worksData.filter((w) => w.id !== work.id);
            displayWorks(worksData);
          })
          .catch((err) => console.error(err));
      });

      figure.appendChild(img);
      figure.appendChild(trashIcon);
      modalGalleryContent.appendChild(figure);
    });
  }

  // =====================================
  // Formulaire d'ajout d'une photo
  // =====================================
  addPhotoForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!photoInput.files.length) {
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
      .then((res) => {
        if (!res.ok) throw new Error("Ajout échoué");
        return res.json();
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
      .catch((err) => console.error(err));
  });

  // =====================================
  // Récupération des projets
  // =====================================
  fetch("http://localhost:5678/api/works")
    .then((res) => {
      if (!res.ok) throw new Error("Erreur API projets");
      return res.json();
    })
    .then((data) => {
      worksData = data;
      displayWorks(worksData);
      displayModalGallery(worksData);
    })
    .catch((err) => console.error(err));
});
