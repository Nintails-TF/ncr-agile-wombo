if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition((position) => {
    try {
      // initialise map
      var map = L.map("map").setView(
        [position.coords.latitude, position.coords.longitude],
        15
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // hide loading screen
      var mapLoader = document.getElementById("map-loader");
      mapLoader.classList.add("hidden");
      mapLoader.classList.remove("grid");

      var greyIcon = new L.Icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      var listViewContainer = document.getElementById("list-view");

      // Clear existing content in the list view

      fetch("https://backend-dot-wombo-412213.nw.r.appspot.com/list-view-data")
        .then((response) => response.json())
        .then((data) => {
          console.log(data);

          data.forEach((branch) => {
            var listItem = document.createElement("div");
            listItem.classList.add(
              "pt-6",
              "border-b",
              "pb-6",
              "relative",
              "px-8",
              "list-item"
            );
            listItem.setAttribute("data-marker", branch.name);

            var branchDetails = document.createElement("div");
            branchDetails.classList.add("lg:grid", "grid-cols-2");

            var infoColumn = document.createElement("div");
            var detailsColumn = document.createElement("div");

            detailsColumn.classList.add(
              "lg:text-right",
              "lg:h-full",
              "grid",
              "mt-6",
              "lg:mt-0"
            );

            // Populate branch details
            var branchName = document.createElement("h4");
            branchName.classList.add("font-medium", "text-lg");
            branchName.textContent = branch.name;

            var branchAddress = document.createElement("h5");
            branchAddress.classList.add("text-sm");
            branchAddress.textContent = branch.address;

            var accessibilityList = document.createElement("ul");
            accessibilityList.classList.add("text-sm", "mt-4");

            branch.accessibilityFeatures.split(", ").forEach((feature) => {
              var listItem = document.createElement("li");
              listItem.innerHTML =
                '<i class="fa-regular fa-circle-check text-green-500 mr-1"></i>' +
                feature;
              accessibilityList.appendChild(listItem);
            });

            // Populate additional details based on branch or ATM
            if (branch.type === "ATM") {
              // Add ATM-specific details
              var atmServices = document.createElement("div");
              atmServices.classList.add(
                "flex",
                "items-center",
                "gap-x-2",
                "justify-end"
              );
              var wifiIcon = document.createElement("i");
              wifiIcon.classList.add(
                "fa-solid",
                "fa-wifi",
                "text-green-500",
                "mr-1"
              );
              var wifiLabel = document.createElement("label");
              wifiLabel.textContent = "Wi-Fi";
              atmServices.appendChild(wifiIcon);
              atmServices.appendChild(wifiLabel);

              detailsColumn.appendChild(atmServices);
            } else {
              // Add Branch-specific details
              // You can add additional details based on your data structure

              // Populate opening hours
              var openingHours = document.createElement("div");
              openingHours.classList.add(
                "lg:font-medium",
                "text-sm",
                "lg:text-base"
              );

              var openHoursText =
                branch.openingHours || "Opening hours not available";
              openingHours.innerHTML = openHoursText.replace(/;/g, "<br>");

              var branchServices = document.createElement("div");
              branchServices.classList.add("flex", "items-center", "gap-x-2");
              detailsColumn.appendChild(branchServices);

              var wifi = document.createElement("div");
              wifi.classList.add("flex", "mt-4", "lg:mt-0");
              wifi.innerHTML =
                '<img src="images/wifi.png" class="h-4 lg:ml-auto lg:mt-4" alt="Wi-Fi Access"/><a href="tel:' +
                branch.phoneNumber +
                '" class="lg:hidden text-sm ml-auto><i class="fa-solid fa-phone mr-1"></i>' +
                branch.phoneNumber +
                "</a>";

              var phone = document.createElement("a");
              phone.href = "tel:" + branch.phoneNumber;
              phone.classList.add("mt-auto", "hidden", "lg:block");
              phone.innerHTML =
                '<i class="fa-solid fa-phone mr-1"></i>' + branch.phoneNumber;

              // Append the elements to the detailsColumn
              detailsColumn.appendChild(openingHours);
              detailsColumn.appendChild(wifi);
              detailsColumn.appendChild(phone);
            }

            // Append created elements to the list view
            infoColumn.appendChild(branchName);
            infoColumn.appendChild(branchAddress);
            infoColumn.appendChild(accessibilityList);
            branchDetails.appendChild(infoColumn);
            branchDetails.appendChild(detailsColumn);
            listItem.appendChild(branchDetails);
            listViewContainer.appendChild(listItem);

            if (branch.type === "Branch") {
              detailsColumn.appendChild(openingHours);
              detailsColumn.appendChild(wifi);
              detailsColumn.appendChild(phone);
            }

            var longitude = branch.coordinates.Longitude;
            var latitude = branch.coordinates.Latitude;

            if (branch.type == "ATM") {
              if (longitude || latitude != undefined) {
                var marker = L.marker([latitude, longitude], {
                  icon: greyIcon,
                }).addTo(map);
              }
            } else {
              if (longitude || latitude != undefined) {
                var marker = L.marker([latitude, longitude]).addTo(map);
              }
            }
            // Create the toMapButton
            var toMapButton = document.createElement("button");
            toMapButton.classList.add("map-btn");
            toMapButton.innerHTML = "Open in Google Maps";

            // Add a click event listener to open Google Maps with the specific latitude and longitude
            toMapButton.addEventListener("click", function () {
              var query; // Initialize query variable
              if (branch.type === "ATM") {
                // For ATMs, use only the address
                query = branch.address;
              } else {
                // For branches, use the branch name and address for specificity
                query = "Santander Branch " + branch.address;
              }

              var encodedQuery = encodeURIComponent(query); // Encode the query for URL
              var googleMapsUrl =
                "https://www.google.com/maps?q=" + encodedQuery;
              window.open(googleMapsUrl, "_blank");
            });

            detailsColumn.appendChild(toMapButton);

            marker.addEventListener("click", function () {
              listView = document.getElementById("list-view");
              if (listView.classList.contains("hidden")) {
                toggleListView();
              }

              var listItems = document.querySelectorAll(".list-item");

              // Remove the 'selected' class from all list items
              listItems.forEach((item) => {
                item.classList.remove("selected");
              });

              var listItem = document.querySelector(
                '[data-marker="' + branch.name + '"]'
              );

              if (listItem) {
                listItem.classList.add("selected");
                listItem.scrollIntoView({ behavior: "smooth" });
              }
            });
          });
        })
        .catch((error) => console.error("Error fetching data:", error));

      /*var defaultRadius = -1; // in meters, cannot make the inital default circle not appear.
            var circle = L.circle(
              [position.coords.latitude, position.coords.longitude],
              {
                color: "red",
                fillColor: "#f03",
                fillOpacity: 0.5,
                radius: defaultRadius,
              }
            ).addTo(map);*/

      var slider = document.getElementById("radius-range");
      var output = document.getElementById("radius");

      output.innerHTML = slider.value + " miles";

      slider.oninput = function () {
        // Convert slider value to meters (Leaflet uses meters for radius)
        var radiusInMeters = this.value * 1609.34; // 1 mile = 1609.34 meters

        // Update the circle radius
        circle.setRadius(radiusInMeters);
        if (this.value == 0) {
          map.removeLayer(circle);
        } else {
          // If the slider value is not 0, show or add the circle
          if (!map.hasLayer(circle)) {
            map.addLayer(circle);
          }
        }
        // Update the output text
        if (this.value == 1) {
          output.innerHTML = this.value + " mile";
        } else {
          output.innerHTML = this.value + " miles";
        }
      };
    } catch {
      // display error if unable to load map
      var map = document.getElementById("map");
      map.innerHTML = "<p>There was an error loading the map</p>";
    }
  });
} else {
  var map = document.getElementById("map");
  map.innerHTML =
    '<p class="grid justify-center">Geolocation is unavailable for your browser</p>';
}

function toggleListView() {
  listView = document.getElementById("list-view");
  if (listView.classList.contains("hidden")) {
    listView.classList.remove("hidden");
    setTimeout(function () {
      listView.classList.add("visible");
    }, 10);
  } else {
    listView.classList.remove("visible");
    setTimeout(function () {
      listView.classList.add("hidden");
    }, 300);
  }
}

function toggleFilterBox() {
  filterBox = document.getElementById("filter-box");

  if (filterBox.classList.contains("hidden")) {
    filterBox.classList.remove("hidden");
    setTimeout(function () {
      filterBox.classList.add("visible");
    }, 10); // Delay the addition of 'visible' class
  } else {
    filterBox.classList.remove("visible");
    setTimeout(function () {
      filterBox.classList.add("hidden");
    }, 300); // Delay the addition of 'hidden' class to allow the animation to complete
  }
}

function updateFilters() {
  filterType = document.getElementById("filter-type");
  atmFilters = document.getElementById("atm-filters");
  branchFilters = document.getElementById("branch-filters");
  if (filterType.value == "branches") {
    atmFilters.classList.add("hidden");
    branchFilters.classList.remove("hidden");
    branchFilters.style.borderBottom = "0px";
  } else if (filterType.value == "atms") {
    branchFilters.classList.add("hidden");
    atmFilters.classList.remove("hidden");
  } else {
    atmFilters.classList.remove("hidden");
    branchFilters.classList.remove("hidden");
    branchFilters.style.borderBottom = "1px solid #E5E7EB";
  }
}

var slider = document.getElementById("radius-range");
var output = document.getElementById("radius");
output.innerHTML = slider.value + " miles";

slider.oninput = function () {
  if (this.value == 1) {
    output.innerHTML = this.value + " mile";
  } else {
    output.innerHTML = this.value + " miles";
  }
};
