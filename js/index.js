window.onload = async () => {
    getMedia();
    window.addEventListener("resize", gridLayout, false);
    document.querySelector("#mode").addEventListener("click", mode, false);
    document.querySelector("#form").addEventListener("submit", search, false);
    document.querySelector("#search").addEventListener("click", search, false);
    document.querySelector("#filter").addEventListener("change", filter, false);
    callAPI();
};

var countries;
var components;
var position;

function getMedia() {
    const media = window.matchMedia(
        "(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"
    );
    if (media.matches) {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.add("dark-theme");
    }
}

async function callAPI() {
    try {
        const response = await fetch("https://restcountries.eu/rest/v2/all");
        const data = await response.json();
        await showComponents(data);
        gridLayout();
        showRegions(data);
        countries = data;
        components = Array.from(document.querySelectorAll(".block"));
    } catch (error) {
        console.log(error);
    }
}

async function showComponents(data) {
    document.querySelector("#container").innerHTML = await createComponents(
        data
    );

    async function createComponents(object) {
        let html = object
            .map((element) => {
                let borders = object
                    .filter((obj) => element.borders.includes(obj.alpha3Code))
                    .map((obj) => obj.name)
                    .join(",");

                let dataset = `
                    data-name="${element.name}" 
                    data-flag="${element.flag}" 
                    data-capital="${element.capital}"
                    data-region="${element.region}" 
                    data-subregion="${element.subregion}"
                    data-languages="${[
                        ...element.languages.map((lan) => lan.name),
                    ]}" 
                    data-population="${element.population.toLocaleString(
                        "es-MX"
                    )}" 
                    data-currencies="${[
                        ...element.currencies.map((cur) => cur.name),
                    ]}"
                    data-borders="${borders}"`;

                return `
                    <div id="${
                        element.name
                    }" class="block" onclick="showDetails(this, true)" ${dataset}>
                        <div>
                            <img width=220px hieght=150px src="${
                                element.flag
                            }" alt="Flag">
                        </div>
                        <ul>
                            <li>${element.name}</li>
                            <li>Capital: ${element.capital}</li>
                            <li>Region: ${element.region}</li>
                            <li>Population: ${element.population.toLocaleString(
                                "es-MX"
                            )}</li>
                        </ul>
                    </div>`;
            })
            .join("");

        return html;
    }
}

async function showRegions(data) {
    document.querySelector("#filter").innerHTML = await creatRegion(data);

    async function creatRegion(data) {
        let region = [...new Set(data.map((element) => element.region))];
        let subregion = [...new Set(data.map((element) => element.subregion))];
        let regions = region.concat(subregion).sort();

        let html = `<option value="">All</option>`;
        regions.forEach((element) => {
            if (element) {
                html += `<option value="${element}">${element}</option>`;
            }
        });

        return html;
    }
}

async function gridLayout() {
    let section = document.querySelector("#main-content");
    let grid = document.querySelector("#container");
    let cell = document.querySelector(".block");
    let cellMargin = parseInt(window.getComputedStyle(cell).margin);
    let space = parseInt(
        section.clientWidth /
            (parseInt(window.getComputedStyle(cell).width) + cellMargin)
    );
    grid.style.gridTemplateColumns = `repeat(${space}, 1fr)`;
}

async function search(e) {
    e.preventDefault();

    let search = document
        .querySelector("#search-field")
        .value.toLowerCase()
        .trim();

    const coincidense = countries.filter((object) =>
        object.name.toLowerCase().includes(search)
    );
    showComponents(coincidense);

    window.scroll(0, 0);
}

async function filter(e) {
    let option = e.target.options[e.target.selectedIndex].value;
    let coincidense = countries.filter(
        (obj) => obj.region.includes(option) || obj.subregion.includes(option)
    );
    showComponents(coincidense);
}

async function mode() {
    document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme");
}

async function showDetails(country, scroll = true) {
    console.log(components);
    document.querySelector("#details").innerHTML = await createDetails(country);

    if (scroll) {
        position = window.scrollY;
    }
    window.scroll(0, 0);

    document.querySelector("#section-form").style.display = "none";
    document.querySelector("#main-content").style.display = "none";
    document.querySelector("#detail-content").style.display = "block";

    async function createDetails(country) {
        let element = components.find(
            (object) => object.dataset.name === country.dataset.name
        ).dataset;

        return `
            <div id="back" onclick="back()">Back</div>
            <div id="flex-details">
                <div id="img">
                    <img src="${element.flag}" alt="Flag of ${element.name}">
                </div>
                <div id="container-data">
                    <p>${element.name}</p>
                    <div id="data">
                        <ul>
                            <li><span>Capital:</span> ${element.capital}</li>
                            <li><span>Region:</span> ${element.region}</li>
                            <li><span>Sub Region:</span> ${
                                element.subregion
                            }</li>
                        </ul>
                        <ul>
                            <li><span>Language:</span> ${element.languages}</li>
                            <li><span>Population:</span> ${element.population.toLocaleString(
                                "es-MX"
                            )}</li>
                            <li><span>Currencies:</span> ${
                                element.currencies
                            }</li>
                        </ul>
                    </div>
                    <ul id="borders">
                        <li>Borders: ${element.borders
                            .split(",")
                            .map((borde) => {
                                if (borde) {
                                    return `<span onclick='showDetails(this, false)' 
                            data-name="${borde}" class="border">${borde}</span>`;
                                }
                            })
                            .join("")}</li>
                    </ul>
                </div>
            </div>`;
    }
}

async function back() {
    document.querySelector("#detail-content").style.display = "none";
    document.querySelector("#section-form").style.display = "flex";
    document.querySelector("#main-content").style.display = "flex";
    window.scroll(0, position);
    gridLayout();
}
