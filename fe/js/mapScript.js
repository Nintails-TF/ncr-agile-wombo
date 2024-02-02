var map;
var markers = [];

function removeMarkers(){
    markers.forEach(function (marker) {
        map.removeLayer(marker);
    });
}

function initializeMap(latitude, longitude) {
    try {
        // Initialize map
        map = L.map("map").setView([latitude, longitude], 15);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution:
            '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // hide loading screen
        var mapLoader = document.getElementById("map-loader");
        mapLoader.classList.add("hidden");
        mapLoader.classList.remove("grid");

        submitFilter();
    } catch (error) {
    // Display error if unable to load map
    var mapElement = document.getElementById("map");
    mapElement.innerHTML = "<p>There was an error loading the map</p>";
    }
}
/*
* Checks for the geolocation
*/
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition((position) => {
        initializeMap(position.coords.latitude, position.coords.longitude);
    })
}
/*
*Using checkbox elements we can filter the results by interacting with the API.
*/
function submitFilter(){
    const filterData = {};
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    listContents = document.getElementById('list-contents');
    listContents.innerHTML = '';

    removeMarkers();
    
    branchOpts = document.querySelectorAll('input[data-category="branch"]');
    atmOpts = document.querySelectorAll('input[data-category="atm"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked){
            branchOpts.forEach(opt => {
                if (checkbox.id == opt.id){
                    if (!filterData[opt.getAttribute('data-heading')]){
                        filterData[opt.getAttribute('data-heading')] = [];
                    }
                    filterData[opt.getAttribute('data-heading')].push(opt.getAttribute('data-title'));
                }

            })

            atmOpts.forEach(opt => {
                if (checkbox.id == opt.id){
                    if (!filterData[opt.getAttribute('data-heading')]){
                        filterData[opt.getAttribute('data-heading')] = [];
                    }
                    filterData[opt.getAttribute('data-heading')].push(opt.getAttribute('data-title'));
                }
            })
        }
    })

    filterData["Longitude"] = -2.971743;
    filterData["Latitude"] = 56.461590;
    filterData["Radius"] = 5000;

    console.log(filterData);

    filterBranches(filterData);
}

async function filterBranches(filterData){
    var request = {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(filterData),
    };

    var greyIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    /*
    * Calling the endpoint for branch and atm filter.
    */
    try {
        for (i = 0; i < 2; i++){
            if (i == 0){
                reqType = 'branches';
            } else {
                reqType = 'atms';
            }

        const response = await fetch("http://localhost:3000/"+reqType+"/filter", request);
        const data = await response.json();
        console.log(data); // Handle the response data as needed
        var listViewContainer = document.getElementById("list-contents");

        data.forEach(branch => {

            var listItem = document.createElement("div");
            listItem.classList.add("pt-6", "border-b", "pb-6", "relative", "px-8", "list-item");
            listItem.setAttribute('data-marker', branch.name);

            var branchDetails = document.createElement("div");
            branchDetails.classList.add("lg:grid", "grid-cols-2");

            var infoColumn = document.createElement("div");
            var detailsColumn = document.createElement("div");

            detailsColumn.classList.add('lg:text-right', 'lg:h-full', 'grid', 'mt-6', 'lg:mt-0')

            // Populate branch details
            var branchName = document.createElement("h4");
            branchName.classList.add("font-medium", "text-lg");
            branchName.textContent = branch.name;

            var branchAddress = document.createElement("h5");
            branchAddress.classList.add("text-sm");
            branchAddress.textContent = branch.address;

            var accessibilityList = document.createElement("ul");
            accessibilityList.classList.add("text-sm", "mt-4");

            if (branch.accessibilityFeatures){
                branch.accessibilityFeatures.split(", ").forEach(feature => {
                var listItem = document.createElement("li");
                listItem.innerHTML = '<i class="fa-regular fa-circle-check text-green-500 mr-1"></i>' + feature;
                accessibilityList.appendChild(listItem);
            });
        }

        // Populate additional details based on branch or ATM
        if (branch.type === 'ATM') {
            // Add ATM-specific details
            var atmServices = document.createElement("div");
            atmServices.classList.add("flex", "items-center", "gap-x-2", "justify-end");
            var wifiIcon = document.createElement("i");
            wifiIcon.classList.add("fa-solid", "fa-wifi", "text-green-500", "mr-1");
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
            openingHours.classList.add("lg:font-medium", "text-sm", "lg:text-base");

            var openHoursText = branch.openingHours || "Opening hours not available";
            openingHours.innerHTML = openHoursText.replace(/;/g, '<br>');

            var branchServices = document.createElement("div");
            branchServices.classList.add("flex", "items-center", "gap-x-2");
            detailsColumn.appendChild(branchServices);

            var wifi = document.createElement('div');
            wifi.classList.add('flex', 'mt-4', 'lg:mt-0');
            wifi.innerHTML = '<img src="images/wifi.png" class="h-4 lg:ml-auto lg:mt-4" alt="Wi-Fi Access"/><a href="tel:' + branch.phoneNumber + '" class="lg:hidden text-sm ml-auto><i class="fa-solid fa-phone mr-1"></i>' + branch.phoneNumber + '</a>';

            var phone = document.createElement('a');
            phone.href = 'tel:' + branch.phoneNumber;
            phone.classList.add('mt-auto', 'hidden', 'lg:block');
            phone.innerHTML = '<i class="fa-solid fa-phone mr-1"></i>' + branch.phoneNumber;

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

        if (branch.type === 'Branch'){
            detailsColumn.appendChild(openingHours);
            detailsColumn.appendChild(wifi);
            detailsColumn.appendChild(phone);
        }
        
        var longitude = branch.coordinates.Longitude;
        var latitude = branch.coordinates.Latitude;


        if (branch.type == 'ATM'){
            if (longitude || latitude != undefined){
                var marker = L.marker([
                    latitude,
                    longitude
                ], {icon: greyIcon}).addTo(map);
                markers.push(marker);
            }
        } else {
            if (longitude || latitude != undefined){
                var marker = L.marker([
                    latitude,
                    longitude
                ]).addTo(map);
                markers.push(marker);
            }
        }
        // Create the toMapButton
        var toMapButton = document.createElement('button');
        toMapButton.classList.add(
            'text-black',
            'w-max',
            'bg-red-200',
            'hover:bg-red-300',
            'focus:ring-4',
            'focus:outline-none',
            'focus:ring-red-100',
            'font-medium',
            'rounded-lg',
            'text-sm',
            'px-4',
            'py-2',
            'right-2',
            'ml-auto'
        );
        toMapButton.innerHTML = 'Open in Google Maps'

        // Add a click event listener to open Google Maps with the specific latitude and longitude
        toMapButton.addEventListener('click', function () {
            var googleMapsUrl = 'https://www.google.com/maps?q=' + latitude + ',' + longitude;
            window.open(googleMapsUrl, '_blank');
        });
        detailsColumn.appendChild(toMapButton);

        marker.addEventListener('click', function(){
            listView = document.getElementById("list-view");
            if (listView.classList.contains("hidden")) {
            toggleListView();
            }

            var listItems = document.querySelectorAll('.list-item');

            // Remove the 'selected' class from all list items
            listItems.forEach(item => {
                item.classList.remove('selected');
            });

            var listItem = document.querySelector('[data-marker="' + branch.name + '"]');

            if (listItem){
            listItem.classList.add('selected');
            listItem.scrollIntoView({behavior:'smooth'});
            }
        })
        })	
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
    /*
    *  Makes the list view visible/hidden when interacted with
    */
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

    /*
    * Makes the filter box visible/hidden when interacted with
    */

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
