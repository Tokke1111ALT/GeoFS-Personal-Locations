// ==UserScript==
// @name         GeoFS Personal Locations Saver
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Save your current location under a name & teleport later
// @author       Tokke_1111
// @match        https://*.geo-fs.com/geofs.php*
// @match        https://www.geo-fs.com/geofs.php?v=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=geo-fs.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Wait until DOM and geofs are available
    function tryInitialize() {
        const form = document.querySelector(".geofs-locationForm.geofs-stopMousePropagation.geofs-stopKeyupPropagation");
        const locationList = document.querySelector(".geofs-list.geofs-toggle-panel.geofs-location-list.geofs-visible");

        if (!form || !locationList) return;

        clearInterval(waitForElements);

        // Create "Personal" section
        const personalLi = document.createElement("li");
        personalLi.className = "geofs-list-collapsible-item";
        personalLi.textContent = "Personal";

        // Overwrite flyTo to always add 10 feet height + stop aircraft movement
        const originalFlyTo = geofs.flyTo;
        geofs.flyTo = function (coords) {
            coords = [...coords]; // Copy array
            coords[2] += 10; // Add 10 feet to altitude
            originalFlyTo(coords);

            setTimeout(() => {
                if (geofs.aircraft.instance) {
                    geofs.aircraft.instance.speed = 0;
                    geofs.aircraft.instance.rigidBody.linearVelocity.setZero();
                }
            }, 500);
        };

        const collapsibleUl = document.createElement("ul");
        collapsibleUl.className = "geofs-collapsible";
        personalLi.appendChild(collapsibleUl);
        locationList.appendChild(personalLi);

        // Create Save button
        const saveBtn = document.createElement("button");
        saveBtn.type = "button";
        saveBtn.className = "mdl-button mdl-js-button mdl-button--raised mdl-button--accent";
        saveBtn.style.marginLeft = "10px";
        saveBtn.textContent = "Save";
        form.appendChild(saveBtn);

        // Get current location
        function getCurrentLocation() {
            if (!window.geofs || !window.geofs.aircraft || !window.geofs.aircraft.instance) return null;

            const [lat, lon, alt] = window.geofs.aircraft.instance.llaLocation || [0, 0, 0];
            const heading = window.geofs.animation.values?.heading360 ?? 0;

            if (isNaN(lat) || isNaN(lon)) return null;

            return { lat, lon, alt, heading };
        }

        // Load saved locations from localStorage
        function loadSavedLocations() {
            const saved = JSON.parse(localStorage.getItem("personalLocations")) || [];
            saved.forEach(loc => {
                const li = document.createElement("li");
                li.setAttribute("data-location", `geofs.flyTo([${loc.lat}, ${loc.lon}, ${loc.alt}, ${loc.heading}, true]);`);
                li.textContent = loc.name;
                addDeleteButton(li, loc.name);
                collapsibleUl.appendChild(li);
            });
        }

        // Add delete button to each item
        function addDeleteButton(listItem, name) {
            const delBtn = document.createElement("span");
            delBtn.textContent = " ❌";
            delBtn.title = "Delete";
            delBtn.style.cursor = "pointer";
            delBtn.style.color = "red";
            delBtn.style.marginLeft = "10px";
            delBtn.style.fontSize = "16px";

            delBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this location?")) {
                    removeSavedLocation(name);
                    collapsibleUl.removeChild(listItem);
                }
            });

            listItem.appendChild(delBtn);
        }

        // Save new location
        saveBtn.addEventListener("click", () => {
            const location = getCurrentLocation();
            if (!location) {
                alert("Could not retrieve current location.");
                return;
            }

            const name = prompt("Enter a name for this location:");
            if (!name) return;

            let saved = JSON.parse(localStorage.getItem("personalLocations")) || [];

            if (saved.some(loc => loc.name === name)) {
                alert("A location with this name already exists.");
                return;
            }

            saved.push({ name, ...location });
            localStorage.setItem("personalLocations", JSON.stringify(saved));

            const li = document.createElement("li");
            li.setAttribute("data-location", `geofs.flyTo([${location.lat}, ${location.lon}, ${location.alt}, ${location.heading}, true]);`);
            li.textContent = name;
            addDeleteButton(li, name);
            collapsibleUl.appendChild(li);
            alert(`Location "${name}" has been saved!`);
        });

        // Remove location
        function removeSavedLocation(name) {
            let saved = JSON.parse(localStorage.getItem("personalLocations")) || [];
            saved = saved.filter(loc => loc.name !== name);
            localStorage.setItem("personalLocations", JSON.stringify(saved));
        }

        // Start loading saved locations
        loadSavedLocations();
    }

    // Repeated check until elements are found
    const waitForElements = setInterval(() => {
        if (document.body && window.geofs) {
            tryInitialize();
        }
    }, 500);
})();
