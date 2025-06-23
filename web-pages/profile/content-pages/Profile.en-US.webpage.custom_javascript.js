 $(document).ready(function () {
const profile = document.querySelector("#content_form > div.page-heading > div > div.page-header > h2 > span > span");
profile.innerHTML = "Ваш профіль";
const leftBar = document.querySelector("#content_form > div.container > div > div.col-lg-4");
leftBar.style = "display: none;";
const inform = document.querySelector("#mainContent > fieldset > legend > h2 > span > span > span");
inform.innerHTML = "Інформація про ваш профіль";
const home = document.querySelector("#content_form > div.page-heading > div > ul > li:nth-child(1)");
home.innerHTML = "Головна";
const profile1 = document.querySelector("#content_form > div.page-heading > div > ul > li.active.breadcrumb-item");
profile1.innerHTML = "Профіль";
const update = document.querySelector("#ContentContainer_MainContent_MainContent_ContentBottom_SubmitButton");
update.value = "Оновити";
const sms = document.querySelector("#ContentContainer_MainContent_MainContent_ContentBottom_ConfirmationMessage > div > div > div");
sms.innerHTML = "Ваш профіль успішно оновлено.";
})