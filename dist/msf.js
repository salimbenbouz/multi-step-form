/**
 * Multi Step Form functionality for Webflow
 * MIT License © Alex Iglesias - BROTA.
 */

class MSF {
  constructor(
    form,
    next,
    back,
    nextText,
    submitText,
    alertText,
    warningClass,
    hiddenForm
  ) {
    this.form = document.getElementById(form);
    this.submitButton = this.form.querySelector('input[type="submit"]');
    this.next = document.getElementById(next);
    this.back = document.getElementById(back);
    this.mask = this.form.querySelector(".w-slider-mask");
    this.steps = this.form.querySelectorAll(".w-slide");
    this.currentStep = 0;
    this.rightArrow = this.form.querySelector(".w-slider-arrow-right");
    this.leftArrow = this.form.querySelector(".w-slider-arrow-left");
    this.nextText = nextText;
    this.submitText = submitText;
    this.alertText = alertText;
    this.warningClass = warningClass;
    if (hiddenForm) {
      this.hiddenForm = document.getElementById(hiddenForm);
      this.hiddenSubmitButton = this.hiddenForm.querySelector(
        'input[type="submit"]'
      );
    }
  }

  getInputs(index) {
    let inputs = this.steps[index].querySelectorAll("input, select, textarea");
    return Array.from(inputs);
  }

  setMaskHeight(index) {
    this.mask.style.height = "";
    this.mask.style.height = `${this.steps[index].offsetHeight}px`;
  }

  setNextButtonText(step) {
    if (step === this.steps.length - 1) {
      this.next.textContent = this.submitText;
    }
    if (step === this.steps.length - 2) {
      this.next.textContent = this.nextText;
    }
  }

  goNext() {
    this.rightArrow.click();
  }

  goBack() {
    this.leftArrow.click();
  }

  submitForm() {
    this.submitButton.click();
  }

  submitHiddenForm(index) {
    let inputs = this.getInputs(index);

    inputs.forEach((el) => {
      let hiddenInput = document.getElementById(`hidden-${el.id}`);

      if (hiddenInput) {
        hiddenInput.value = el.value;
      }
    });

    this.hiddenSubmitButton.click();
  }

  hideButtons() {
    this.next.style.display = "none";
    this.back.style.display = "none";
  }

  addWarningClass(target) {
    target.classList.add(this.warningClass);
  }

  removeWarningClass(target) {
    target.classList.remove(this.warningClass);
  }

  alertUser() {
    alert(this.alertText);
  }

  setConfirmValues(index) {
    let inputs = this.getInputs(index);

    inputs.forEach((el) => {
      let value, confirmElement;
      if (el.type === "radio") {
        let radioGroup = el.getAttribute("name");
        let isChecked = document.querySelector(
          `input[name="${radioGroup}"]:checked`
        );

        if (isChecked) {
          value = isChecked.value;
          confirmElement = document.getElementById(`${radioGroup}-value`);
        }
      } else {
        value = el.value;
        confirmElement = document.getElementById(`${el.id}-value`);
      }

      if (value && confirmElement) {
        confirmElement.textContent = value;
      } else if (!value && confirmElement) {
        confirmElement.textContent = "-";
      }
    });
  }
}

let msfController = {
  init: (msf) => {
    let start = () => {
      setEventListeners();
      msf.setMaskHeight(0);
    };

    let setEventListeners = () => {
      msf.next.addEventListener("click", nextClick);
      msf.back.addEventListener("click", backClick);
      if (msf.hiddenForm) {
        msf.rightArrow.addEventListener(
          "click",
          () => {
            msf.submitHiddenForm(0);
          },
          {
            once: true,
          }
        );
      }
    };

    let nextClick = () => {
      let filledFields = checkRequiredInputs(msf.currentStep);

      if (filledFields) {
        msf.setConfirmValues(msf.currentStep);
        msf.currentStep++;
        if (msf.currentStep === msf.steps.length) {
          msf.submitForm();
          msf.hideButtons();
        } else {
          msf.goNext();
          msf.setMaskHeight(msf.currentStep);
          msf.setNextButtonText(msf.currentStep);
        }
      } else {
        msf.alertUser();
      }
    };

    let backClick = () => {
      let previousStep = msf.currentStep - 1;

      if (previousStep >= 0) {
        msf.goBack();
        msf.setMaskHeight(previousStep);
        msf.currentStep = previousStep;
        msf.setNextButtonText(previousStep);
      }
    };

    let checkRequiredInputs = (index) => {
      let inputs = msf.getInputs(index);
      let requiredInputs = inputs.filter((el) => el.required);
      let requiredCheckboxes = requiredInputs.filter(
        (el) => el.type === "checkbox"
      );
      let requiredRadios = requiredInputs.filter((el) => el.type === "radio");
      let filledInputs = 0;
      let pass;

      requiredInputs.forEach((el) => {
        if (el.value && el.type !== "email") {
          msf.removeWarningClass(el);
          filledInputs++;
        } else if (el.value && el.type === "email") {
          let correctEmail = validateEmail(el.value);
          if (correctEmail) {
            msf.removeWarningClass(el);
            filledInputs++;
          } else {
            msf.addWarningClass(el);
          }
        } else {
          msf.addWarningClass(el);
        }
      });

      requiredCheckboxes.forEach((el) => {
        let checkbox = el.parentNode.querySelector(".w-checkbox-input");

        if (el.checked) {
          if (checkbox) {
            msf.removeWarningClass(checkbox);
          }
          filledInputs++;
        } else {
          if (checkbox) {
            msf.addWarningClass(checkbox);
          }
        }
      });

      requiredRadios.forEach((el) => {
        let radio = el.parentNode.querySelector(".w-radio-input");
        let radioGroup = el.getAttribute("name");
        let isChecked = document.querySelector(
          `input[name="${radioGroup}"]:checked`
        );

        if (isChecked) {
          msf.removeWarningClass(radio);
          filledInputs++;
        } else {
          msf.addWarningClass(radio);
        }
      });

      filledInputs ===
      requiredInputs.length + requiredCheckboxes.length + requiredRadios.length
        ? (pass = true)
        : (pass = false);
      return pass;
    };

    let validateEmail = (email) => {
      let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    };

    start();
  },
};
