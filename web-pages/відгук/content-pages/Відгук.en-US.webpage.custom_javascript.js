 $(document).ready(function () {
const sms = document.querySelector("#MessageLabel");
sms.innerHTML = "Подання успішно завершено.";
const enter = document.querySelector("#ctl00_ContentContainer_EntityFormControl_94e56e99c9ec496e95cdf7ffd47d7a22_EntityFormControl_94e56e99c9ec496e95cdf7ffd47d7a22_EntityFormView_captcha_CaptchaTextBoxLabel");
enter.innerHTML = "Введіть код із зображення";
const submitButton = document.querySelector("#InsertButton");
submitButton.value = "Підтвердити";
})