 $(document).ready(function () {
    const previousButton = document.querySelector("#PreviousButton");
    previousButton.value = "Повернутись";
    previousButton.style = "margin-right: auto; margin-left: auto; display: block;";
    
    const submitButton = document.querySelector("#NextButton");
    submitButton.value = "Завершити";
    submitButton.style = "margin-right: auto; margin-left: auto; display: block;";
    
    document.querySelector("#WebFormPanel > div.actions > div").style = "    display: flex; margin-left: auto; margin-right: auto;";

 })