$(document).ready(function () {
    // Web API ajax wrapper
    (function(webapi, $){
        function safeAjax(ajaxOptions) {
            var deferredAjax = $.Deferred();

            shell.getTokenDeferred().done(function (token) {
                if (!ajaxOptions.headers) {
                    $.extend(ajaxOptions, {
                        headers: {
                            "__RequestVerificationToken": token
                        }
                    });
                } else {
                    ajaxOptions.headers["__RequestVerificationToken"] = token;
                }

                $.ajax(ajaxOptions)
                    .done(function(data, textStatus, jqXHR) {
                        validateLoginSession(data, textStatus, jqXHR, deferredAjax.resolve);
                    }).fail(deferredAjax.reject);
            }).fail(function () {
                deferredAjax.rejectWith(this, arguments);
            });

            return deferredAjax.promise();  
        }
        webapi.safeAjax = safeAjax;
    })(window.webapi = window.webapi || {}, jQuery);

    
    function appAjax(processingMsg, ajaxOptions) {
        return webapi.safeAjax(ajaxOptions);
    }
    function convertToUtcIso(dateString) {
    // Parse "4/30/2025 12:28 AM" as local time
    var date = new Date(dateString);

    // Convert to ISO 8601 string in UTC
    var isoUtcString = date.toISOString(); // e.g., "2025-04-30T09:28:00.000Z"

    return isoUtcString;
}

    function loadRecords(tableName, fieldsName, filterString) {
        var urlRequest = tableName;
        urlRequest += "?$select=";
        urlRequest += fieldsName ? fieldsName : "*";
        urlRequest += filterString ? "&$filter=" + filterString : "";

        return appAjax('Loading...', {
            type: "GET",
            url: "/_api/" + urlRequest,
            contentType: "application/json"
        });
    }

    function getAllAvailablePlaces(startInput, finishInput){

        const startUTCTime = convertToUtcIso(startInput.value);
        const finishUTCTime = convertToUtcIso(finishInput.value);
        
        const filter = encodeURI("park_finishtime ge " + startUTCTime + " and park_starttime le "+ finishUTCTime + " and park_rentstate eq 283620003")

        loadRecords("park_parkrentals", "_park_parkplace_value", filter).done(function (data) {
            const busyPlaces = data.value;
            // console.log(JSON.stringify(busyPlaces));

            if (busyPlaces.length > 0){
            var placesFilter = "";
            busyPlaces.forEach(function(place) {
                placesFilter += "park_parkplaceid ne " + place._park_parkplace_value + " and ";
            });
            placesFilter = placesFilter.slice(0, -5);
        }
        // console.log(placesFilter)

        loadRecords("park_parkplaces", "cre77_name,park_parkplaceid", placesFilter).done(function (data) {

            data.value.forEach(function(place) {
                console.log(JSON.stringify(place.cre77_name));
                
            });
        });
        });

    }

    // Перевірка полів часу
    
    function checkTimeFields() {
    const startInput = document.getElementById('park_starttime_datepicker_description');
    const finishInput = document.getElementById('park_finishtime_datepicker_description');
    const messageDiv = document.getElementById('time-validation-message');
    // const placesContainer = document.getElementById('available-places-container');
    const placesContainer = document.getElementById('available-place-row');
    const placesSelect = document.getElementById('available-places');

    if (!startInput || !finishInput || !messageDiv || !placesContainer || !placesSelect) {
        console.error("Одне з полів або елементів не знайдено");
        return;
    }

    const startTimeStr = startInput.value.trim();
    const finishTimeStr = finishInput.value.trim();

    // Очистити повідомлення
    messageDiv.textContent = '';
    messageDiv.style.backgroundColor = '';
    messageDiv.style.color = '';
    placesContainer.style.display = "none"; // Приховати селектор, доки не перевірено

    if (!startTimeStr || !finishTimeStr) {
        showError("Будь ласка, заповніть обидва поля часу.");
        return;
    }

    const startTime = moment(startTimeStr, "M/D/YYYY h:mm A");
    const finishTime = moment(finishTimeStr, "M/D/YYYY h:mm A");
    const now = moment();

    if (!startTime.isValid() || !finishTime.isValid()) {
        showError("Невірний формат дати або часу.");
        return;
    }

    if (startTime.isBefore(now)) {
        showError("Неможливо забронювати час у минулому.");
        return;
    }

    if (!finishTime.isAfter(startTime)) {
        showError("Фінішний час має бути пізніше за стартовий.");
        return;
    }

    const durationInMinutes = finishTime.diff(startTime, 'minutes');

    if (durationInMinutes % 60 !== 0) {
        showError("Бронювання має бути кратним 1 годині.");
        return;
    }

    // Успішна перевірка
    showSuccess("Часові значення коректні. Можна бронювати.");

    // Виклик функції завантаження доступних місць
    const startUTCTime = convertToUtcIso(startInput.value);
    const finishUTCTime = convertToUtcIso(finishInput.value);

    const filter = encodeURI("park_finishtime ge " + startUTCTime +
                             " and park_starttime le " + finishUTCTime +
                             " and park_rentstate eq 283620003");

    loadRecords("park_parkrentals", "_park_parkplace_value", filter).done(function (data) {
        const busyPlaces = data.value;

        let placesFilter = "";
        if (busyPlaces.length > 0) {
            busyPlaces.forEach(function(place) {
                placesFilter += "park_parkplaceid ne " + place._park_parkplace_value + " and ";
            });
            placesFilter = placesFilter.slice(0, -5);
        }

        loadRecords("park_parkplaces", "cre77_name,park_parkplaceid", placesFilter).done(function (data) {
            // Очистити попередні опції
            placesSelect.innerHTML = "";

            if (data.value.length === 0) {
                const option = document.createElement("option");
                option.value = "";
                option.text = "Немає доступних місць";
                placesSelect.appendChild(option);
            } else {
                data.value.forEach(function(place) {
                    const option = document.createElement("option");
                    option.value = place.park_parkplaceid;
                    option.text = place.cre77_name;
                    placesSelect.appendChild(option);
                });
            }

            // Показати селектор
            placesContainer.style.display = "table-row";
            placesContainer.show();
        });
    });

    // Функції стилізації
    function showError(message) {
        messageDiv.textContent = message;
        messageDiv.style.setProperty("color", "white", "important");
        messageDiv.style.setProperty("background-color", "red", "important");
        messageDiv.style.padding = "8px";
        messageDiv.style.borderRadius = "4px";
    }

    function showSuccess(message) {
        messageDiv.textContent = message;
        messageDiv.style.setProperty("color", "white", "important");
        messageDiv.style.setProperty("background-color", "green", "important");
        messageDiv.style.padding = "8px";
        messageDiv.style.borderRadius = "4px";
    }
}

// function nextOnClick() {
//     if (typeof webFormClientValidate === 'function') {
//         if (webFormClientValidate()) {
//             if (typeof Page_ClientValidate === 'function') {
//                 if (Page_ClientValidate('')) {
//                     clearIsDirty();
//                     disableButtons(); 
//                     this.value = 'Обробка...';
//                 }
//             }
//             else {
//                 clearIsDirty();
//                 disableButtons();
//                 this.value = 'Обробка...';
//             }
//         }
//         else {
//             return false;
//         }
//     } else {
//         if (typeof Page_ClientValidate === 'function') {
//             if (Page_ClientValidate('')) { clearIsDirty(); disableButtons(); this.value = 'Обробка...'; }
//         } else { clearIsDirty(); disableButtons(); this.value = 'Обробка...'; }
//     };


//     WebForm_DoPostBackWithOptions(new WebForm_PostBackOptions("WebFormControl_da23f9ec753e4e1dbfb968fc3d9b626f$NextButton", "", true, "", "", false, true))

// }

function setParkPlaceValue(parkPlaceField, parkPlaceFormField){
    const selectedVal = parkPlaceField.selectedOptions[0].value;
    $('#park_parkplace_name')[0].value = selectedVal;
    $("#park_parkplace").attr("value", selectedVal);
    $("#park_parkplace_entityname").attr("value", "park_parkplace");
  
}


    const parkPlaceFormField = $("#EntityFormView > div.tab.clearfix > div > div > fieldset > table > tbody > tr:nth-child(6) > td.clearfix.cell.lookup.form-control-cell");
    parkPlaceFormField.hide();



    // $('#EntityFormView > div.tab.clearfix > div > div > fieldset > table > tbody > tr:nth-child(7)').append(
    //     '    <div id="available-places-container" style="display: none; margin-top: 15px;"><label for="available-places" style="color: white; font-weight: bold;">Оберіть паркомісце:</label><select id="available-places" class="form-control"></select></div>'
    // )
    // $('#EntityFormView > div.tab.clearfix > div > div > fieldset > table > tbody > tr:nth-child(7)').append(
    //     '<img id="place-image" src="/ParkingImg.png" alt="ParkingImg" name="ParkingImg.png" style="width: 50%; max-width: 200px; border-radius: 12px; margin-top: 10px;">'
    // )

    $('#EntityFormView > div.tab.clearfix > div > div > fieldset > table > tbody').append(`
  <tr id="available-place-row" style="display: none;">
    <td class="form-control-cell" style="width: 50%;">
      <label for="available-places" style="color: white; font-weight: bold;">Оберіть паркомісце:</label>
      <select id="available-places" class="form-control"></select>
    </td>
    <td class="form-control-cell" style="width: 50%; text-align: center;">
      <img id="place-image" src="/ParkingImg.png" alt="ParkingImg" name="ParkingImg.png" style="width: 80%; max-width: 400px; border-radius: 12px; margin-top: 10px;">
    </td>
  </tr>
`);
// document.getElementById("available-place-row").style.display = "table-row";
$("#available-place-row").hide();
const nextButton = document.querySelector("#NextButton");
nextButton.value = "Перейти далі";
nextButton.style = "margin-right: auto; margin-left: auto; display: block;";
// nextButton.onclick = nextOnClick; 
document.querySelector("#WebFormPanel > div.actions > div").style = "margin-right: auto; margin-left: auto; display: block;";





    const finishTimeField = document.getElementById('park_finishtime_datepicker_description');
    const startTimeField = document.getElementById("park_starttime_datepicker_description");

    const parkPlaceField = document.getElementById("available-places");

    if (startTimeField) {
      startTimeField.onchange = function () {
        checkTimeFields();
      };
    } else {
      console.error("startTimeField not found");
    }
    if (finishTimeField) {
      finishTimeField.onchange = function () {
        checkTimeFields();
      };
    } else {
      console.error("finishTimeField not found");
    }
 if (parkPlaceField) {
      parkPlaceField.onchange = function () {
        setParkPlaceValue(parkPlaceField, parkPlaceFormField);
      };
    } else {
      console.error("parkPlaceField not found");
    }

});
