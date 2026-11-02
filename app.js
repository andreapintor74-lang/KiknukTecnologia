const navigationElement = document.querySelector("#site-navigation");
const pageElement = document.querySelector("#page-content");
const searchInput = document.querySelector("#search");
const searchResultsElement = document.querySelector("#search-results");
const searchResultList = document.querySelector("#search-result-list");
const searchStatus = document.querySelector("#search-status");
const warningElement = document.querySelector("#load-warning");

const data = window.TECNOLOGIA_DATA;
const pages = Array.isArray(data?.pages) ? data.pages : [];
const resources = Array.isArray(data?.resources) ? data.resources : [];
const navigation = Array.isArray(data?.navigation) ? data.navigation : [];

function routeForUrl(url) {
  try {
    const path = new URL(url).pathname;
    const marker = "/tecnologia";
    const start = path.indexOf(marker);
    return decodeURIComponent(start === -1 ? path : path.slice(start + marker.length) || "/");
  } catch {
    return "/";
  }
}

function currentRoute() {
  if (!location.hash.startsWith("#/")) {
    return "/";
  }
  try {
    return decodeURIComponent(location.hash.slice(1));
  } catch {
    return "/";
  }
}

function pageForRoute(route) {
  return pages.find((page) => routeForUrl(page.url) === route) || pages.find((page) => routeForUrl(page.url) === "/");
}

function makeRouteLink(title, route, className = "") {
  const link = document.createElement("a");
  link.className = className;
  link.href = `#${route}`;
  link.textContent = title;
  link.addEventListener("click", closeMobileNavigation);
  return link;
}

function closeMobileNavigation() {
  document.querySelector(".sidebar")?.classList.remove("is-open");
}

function navigationSections() {
  const existingOther = navigation.find((section) => section.title === "ALTRO");
  if (existingOther?.children?.length) {
    return navigation;
  }

  const recommendedIndex = navigation.findIndex((section) => section.title === "SITI CONSIGLIATI");
  if (recommendedIndex === -1 || recommendedIndex === navigation.length - 1) {
    return navigation;
  }

  const overflow = navigation.slice(recommendedIndex + 1);
  const children = overflow
    .filter((section) => section.url)
    .map((section) => ({ title: section.title, url: section.url }));
  if (!children.length) {
    return navigation;
  }

  return [
    ...navigation.slice(0, recommendedIndex + 1),
    { title: "ALTRO", url: null, children },
  ];
}

function buildNavigation() {
  const linkedRoutes = new Set();
  navigationElement.replaceChildren();

  for (const section of navigationSections()) {
    const sectionElement = document.createElement("div");
    sectionElement.className = "nav-section";
    const sectionRoute = section.url ? routeForUrl(section.url) : null;
    const children = Array.isArray(section.children) ? section.children : [];

    if (children.length) {
      const details = document.createElement("details");
      details.className = "nav-group";
      const summary = document.createElement("summary");
      summary.textContent = section.displayTitle || section.title;
      details.append(summary);

      const list = document.createElement("ul");
      list.className = "nav-children";
      if (section.url) {
        const item = document.createElement("li");
        item.append(makeRouteLink(section.displayTitle || section.title, sectionRoute));
        list.append(item);
        linkedRoutes.add(sectionRoute);
      }
      for (const child of children) {
        const item = document.createElement("li");
        item.append(makeRouteLink(child.displayTitle || child.title, routeForUrl(child.url)));
        list.append(item);
        linkedRoutes.add(routeForUrl(child.url));
      }
      details.append(list);
      sectionElement.append(details);
    } else if (section.url) {
      sectionElement.append(makeRouteLink(section.displayTitle || section.title, sectionRoute, "nav-link"));
      linkedRoutes.add(sectionRoute);
    } else {
      const label = document.createElement("p");
      label.className = "nav-group-label";
      label.textContent = section.displayTitle || section.title;
      sectionElement.append(label);
    }

    navigationElement.append(sectionElement);
  }

  const unlistedPages = pages.filter((page) => !linkedRoutes.has(routeForUrl(page.url)));
  if (unlistedPages.length) {
    const details = document.createElement("details");
    details.className = "nav-group";
    const summary = document.createElement("summary");
    summary.textContent = "Altre pagine";
    const list = document.createElement("ul");
    list.className = "nav-children";
    for (const page of unlistedPages) {
      const item = document.createElement("li");
      item.append(makeRouteLink(page.title, routeForUrl(page.url)));
      list.append(item);
    }
    details.append(summary, list);
    navigationElement.append(details);
  }
}

function appendContentBlock(container, block) {
  const allowedTypes = new Set(["h1", "h2", "h3", "h4", "h5", "h6", "p", "blockquote", "figcaption", "li"]);
  const type = allowedTypes.has(block.type) ? block.type : "p";
  if (type === "li") {
    let list = container.lastElementChild;
    if (!list || list.tagName !== "UL") {
      list = document.createElement("ul");
      list.className = "page-list";
      container.append(list);
    }
    const item = document.createElement("li");
    item.textContent = block.text;
    list.append(item);
    return;
  }

  const element = document.createElement(type);
  element.textContent = block.text;
  container.append(element);
}

function appendPageImages(container, page) {
  const images = Array.isArray(page.images) ? page.images : [];
  if (!images.length) {
    return;
  }

  const pageResources = resources.filter((resource) => resource.sourcePage === page.url);
  const resourceImages = new Set(
    pageResources.filter((resource) => resource.imageUrl).map((resource) => resource.imageUrl)
  );
  const visibleImages = images.filter((image) => !resourceImages.has(image.url));
  if (!visibleImages.length) {
    return;
  }

  const section = document.createElement("section");
  section.className = "page-images";
  section.setAttribute("aria-label", "Immagini della pagina");
  for (const image of visibleImages) {
    const source = image.localUrl || image.url;
    if (!source) {
      continue;
    }
    const figure = document.createElement("figure");
    const element = document.createElement("img");
    element.src = source;
    element.alt = image.alt || "";
    element.loading = "lazy";
    figure.append(element);
    const captionText = image.caption || image.alt;
    if (captionText) {
      const caption = document.createElement("figcaption");
      caption.textContent = captionText;
      figure.append(caption);
    }
    if (image.href) {
      const link = document.createElement("a");
      const linkedResource = pageResources.find((resource) => resource.url === image.href);
      const linkedPage = pages.find((entry) => routeForUrl(entry.url) === routeForUrl(image.href));
      if (linkedPage) {
        link.href = `#${routeForUrl(linkedPage.url)}`;
      } else {
        link.href = linkedResource?.localUrl || image.href;
      }
      if (!linkedPage && !linkedResource?.localUrl) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
      link.append(...figure.childNodes);
      figure.append(link);
    }
    section.append(figure);
  }
  container.append(section);
}

function makeResourceLink(resource) {
  const link = document.createElement("a");
  const imageSource = resource.imageLocalUrl || resource.imageUrl;
  link.className = imageSource ? "resource-link resource-card" : "resource-link";
  link.href = resource.localUrl || resource.url;
  if (imageSource) {
    const image = document.createElement("img");
    image.className = "resource-thumbnail";
    image.src = imageSource;
    image.alt = resource.imageAlt || "";
    image.loading = "lazy";
    link.append(image);
  }
  const title = document.createElement("span");
  title.className = "resource-title";
  title.textContent = resource.title || resource.url;
  link.append(title);
  if (resource.description && resource.description !== resource.title) {
    const description = document.createElement("span");
    description.className = "resource-description";
    description.textContent = resource.description;
    link.append(description);
  }
  if (!resource.localUrl) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }
  return link;
}

function renderPage() {
  const page = pageForRoute(currentRoute());
  if (!page) {
    pageElement.textContent = "Non sono disponibili pagine importate.";
    return;
  }

  pageElement.replaceChildren();
  const heading = document.createElement("h1");
  heading.className = "page-title";
  heading.textContent = page.title;
  pageElement.append(heading);

  const content = document.createElement("div");
  content.className = "page-copy";
  const blocks = Array.isArray(page.blocks) ? page.blocks : [];
  let addedBlocks = 0;
  for (const block of blocks) {
    if (!block.text || block.text === page.title) {
      continue;
    }
    appendContentBlock(content, block);
    addedBlocks += 1;
  }
  if (addedBlocks) {
    pageElement.append(content);
  } else {
    const unavailable = document.createElement("p");
    unavailable.className = "empty-state";
    unavailable.textContent = "Il testo di questa pagina non è stato acquisito. Consulta la pagina originale.";
    pageElement.append(unavailable);
  }

  appendPageImages(pageElement, page);

  const pageMenuCodes = new Set(Array.isArray(page.menuCodes) ? page.menuCodes : [page.menuCode].filter(Boolean));
  const pageResources = resources.filter((resource) =>
    (resource.sourcePage === page.url || (!resource.sourcePage && resource.pageTitle === page.title))
    && (!resource.menuCode || !pageMenuCodes.size || pageMenuCodes.has(resource.menuCode))
  );
  if (pageResources.length) {
    const section = document.createElement("section");
    section.className = "page-resources";
    const title = document.createElement("h2");
    title.textContent = "Collegamenti e materiali";
    const list = document.createElement("ul");
    for (const resource of pageResources) {
      const item = document.createElement("li");
      item.append(makeResourceLink(resource));
      list.append(item);
    }
    if (list.childElementCount) {
      section.append(title, list);
      pageElement.append(section);
    }
  }

  const linkedRoutes = [...new Set((page.internalLinks || [])
    .map(routeForUrl)
    .filter((route) => route !== currentRoute()))];
  if (linkedRoutes.length) {
    const section = document.createElement("section");
    section.className = "page-resources";
    const title = document.createElement("h2");
    title.textContent = "Pagine collegate";
    const list = document.createElement("ul");
    for (const route of linkedRoutes) {
      const targetPage = pages.find((entry) => routeForUrl(entry.url) === route);
      if (!targetPage) continue;
      const item = document.createElement("li");
      item.append(makeRouteLink(targetPage.title, route, "resource-link"));
      list.append(item);
    }
    if (list.childElementCount) {
      section.append(title, list);
      pageElement.append(section);
    }
  }

  const original = document.createElement("a");
  original.className = "original-page-link";
  original.href = page.url;
  original.target = "_blank";
  original.rel = "noopener noreferrer";
  original.textContent = "Apri la pagina originale";
  pageElement.append(original);

  document.title = `${page.title} | Risorse di Tecnologia`;
  document.querySelectorAll("#site-navigation a").forEach((link) => {
    const linkRoute = link.hash.startsWith("#") ? decodeURIComponent(link.hash.slice(1)) : "";
    link.classList.toggle("is-current", linkRoute === currentRoute());
  });
  document.querySelectorAll(".nav-group").forEach((group) => {
    if (group.querySelector(".is-current")) {
      group.open = true;
    }
  });
}

function renderSearchResults() {
  const query = searchInput.value.trim().toLocaleLowerCase("it");
  if (!query) {
    searchResultsElement.hidden = true;
    searchResultList.replaceChildren();
    return;
  }

  const matchingPages = pages.filter((page) =>
    `${page.menuCodes?.join(" ") || page.menuCode || ""} ${page.title} ${page.blocks?.map((block) => block.text).join(" ") || ""}`
      .toLocaleLowerCase("it")
      .includes(query)
  );
  const matchingResources = resources.filter((resource) =>
    `${resource.menuCode || ""} ${resource.title} ${resource.pageTitle} ${resource.type}`
      .toLocaleLowerCase("it")
      .includes(query)
  );

  searchResultList.replaceChildren();
  for (const page of matchingPages.slice(0, 20)) {
    searchResultList.append(makeRouteLink(page.title, routeForUrl(page.url), "search-result"));
  }
  for (const resource of matchingResources.slice(0, 30)) {
    const result = document.createElement("div");
    result.className = "search-result";
    result.append(makeResourceLink(resource));
    searchResultList.append(result);
  }

  const count = matchingPages.length + matchingResources.length;
  searchStatus.textContent = `${count} ${count === 1 ? "risultato" : "risultati"}`;
  if (count === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Nessun risultato. Prova con un altro termine.";
    searchResultList.append(empty);
  }
  searchResultsElement.hidden = false;
}

function load() {
  if (!data || !Array.isArray(data.pages) || data.pages.length === 0) {
    warningElement.hidden = false;
    warningElement.textContent = "I contenuti non sono disponibili. Aggiorna la copia con l'attività di importazione.";
    pageElement.textContent = "";
    return;
  }
  if (Array.isArray(data.errors) && data.errors.length) {
    warningElement.hidden = false;
    warningElement.textContent = `Importazione parziale: ${data.errors.length} contenuti non sono stati acquisiti. Consulta import-report.json.`;
  }
  buildNavigation();
  renderPage();
}

searchInput.addEventListener("input", renderSearchResults);
searchInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchInput.focus();
  }
});
window.addEventListener("hashchange", renderPage);

load();
