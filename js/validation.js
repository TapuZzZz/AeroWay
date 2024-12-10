function addErrorClass(inputElement) {
  inputElement.classList.add('error');
  inputElement.classList.add('shake');

  setTimeout(function () {
    inputElement.classList.remove('shake');
  }, 500);
}

function removeErrorClass(inputElement) {
  inputElement.classList.remove('error');
}

function validateEmail(email) {
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateFullName(fullName) {
  let nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(fullName) && fullName.split(' ').length >= 2;
}

function validateIDNumber(idNumber) {
  let idRegex = /^\d{9}$/;
  return idRegex.test(idNumber);
}

function validatePassword(password) {
  return password.length >= 8;
}

function validateFieldEmpty(value) {
  return value.trim() !== '';
}

document.querySelector('form').addEventListener('submit', function (event) {
  event.preventDefault();

  let fullNameInput = document.querySelector('input[name="name"]');
  let idNumberInput = document.querySelector('input[name="IDnumber"]');
  let emailInput = document.querySelector('input[name="email"]');
  let passwordInput = document.querySelector('input[name="password"]');
  let repeatPasswordInput = document.querySelector('input[name="repeat-password"]');

  let isValid = true;

  document.querySelectorAll('.error').forEach(function(field) {
    removeErrorClass(field);
  });

  if (!validateFullName(fullNameInput.value) || !validateFieldEmpty(fullNameInput.value)) {
    addErrorClass(fullNameInput);
    isValid = false;
  }

  if (!validateIDNumber(idNumberInput.value) || !validateFieldEmpty(idNumberInput.value)) {
    addErrorClass(idNumberInput);
    isValid = false;
  }

  if (!validateEmail(emailInput.value) || !validateFieldEmpty(emailInput.value)) {
    addErrorClass(emailInput);
    isValid = false;
  }

  if (!validatePassword(passwordInput.value) || !validateFieldEmpty(passwordInput.value)) {
    addErrorClass(passwordInput);
    isValid = false;
  }

  if (passwordInput.value !== repeatPasswordInput.value || !validateFieldEmpty(repeatPasswordInput.value)) {
    addErrorClass(passwordInput);
    addErrorClass(repeatPasswordInput);
    isValid = false;
  }

  if (isValid) {
    document.querySelector('form').submit();
  }
});

document.querySelectorAll('input').forEach(function(input) {
  input.addEventListener('input', function() {
    if (input.name === "name" && validateFullName(input.value)) {
      removeErrorClass(input);
    }
    if (input.name === "IDnumber" && validateIDNumber(input.value)) {
      removeErrorClass(input);
    }
    if (input.name === "email" && validateEmail(input.value)) {
      removeErrorClass(input);
    }
    if (input.name === "password" && validatePassword(input.value)) {
      removeErrorClass(input);
    }
    if (input.name === "repeat-password" && input.value === document.querySelector('input[name="password"]').value) {
      removeErrorClass(input);
    }

    if (input.value.trim() !== '' && !input.classList.contains('error')) {
      removeErrorClass(input);
    }
  });
});

document.querySelector('input[name="IDnumber"]').addEventListener('input', function(event) {
  this.value = this.value.replace(/\D/g, '');
});
