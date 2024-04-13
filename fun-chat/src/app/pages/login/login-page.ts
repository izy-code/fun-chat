import './login-page.scss';
import type BaseComponent from '@/app/components/base-component';
import { a, form, h1, main } from '@/app/components/tags';
import ButtonComponent from '@/app/components/button/button';
import LoginFieldComponent from './login-field/login-field';
import type LocalStorage from '@/app/utils/session-storage';
import type Router from '@/app/router/router';
import Pages from '@/app/router/pages';
import PageComponent from '@/app/components/page-component';

enum FieldMinLength {
  LOGIN = 3,
  PASSWORD = 6,
}

type ValidationSwitch = Partial<{
  CHAR_SET: boolean;
  LENGTH: boolean;
  CASE: boolean;
}>;

const LOGIN_VAL_SWITCH = {
  LENGTH: true,
};

const PASSWORD_VAL_SWITCH = {
  LENGTH: true,
  CASE: true,
  CHAR_SET: true,
};

export default class LoginPageComponent extends PageComponent {
  private loginButton: BaseComponent<HTMLButtonElement>;

  private loginField: LoginFieldComponent;

  private passwordField: LoginFieldComponent;

  constructor(router: Router, storage: LocalStorage) {
    super(router, storage);

    this.addClass('login-page');

    this.loginField = new LoginFieldComponent('Login:');
    this.loginField.addClass('login-page__field');
    this.loginField.setInputAttribute('autofocus', '');
    this.loginField.addListener('input', this.onFieldInput.bind(this));

    this.passwordField = new LoginFieldComponent('Password:');
    this.passwordField.addClass('login-page__field');
    this.passwordField.addListener('input', this.onFieldInput.bind(this));

    this.loginButton = ButtonComponent({
      className: 'login-page__submit-button button',
      textContent: 'Login',
      buttonType: 'submit',
      clickHandler: this.onLoginButtonClick,
    });
    this.loginButton.setAttribute('disabled', '');

    const aboutLink = a({
      className: 'login-page__about-link button button--continue',
      href: `#${Pages.ABOUT}`,
      textContent: `About`,
    });

    const headingComponent = h1('visually-hidden', 'Fun chat application');
    const formComponent = form(
      { className: 'login-page__form', method: 'post' },
      this.loginField,
      this.passwordField,
      this.loginButton,
      aboutLink,
    );
    const mainComponent = main({ className: 'login-page__main' }, headingComponent, formComponent);

    this.append(mainComponent);
  }

  private onFieldInput(evt: Event): void {
    if (this.isLoginValid() && this.isPasswordValid()) {
      this.loginButton.removeAttribute('disabled');
    } else {
      this.loginButton.setAttribute('disabled', '');
    }

    if (this.loginField.getNode() === evt.currentTarget) {
      this.updateLoginErrorState();
    } else {
      this.updatePasswordErrorState();
    }
  }

  private static getFieldValidationErrors(
    fieldName: string,
    fieldValue: string,
    minLength: number,
    valSwitch: ValidationSwitch,
  ): string {
    const { CHAR_SET = false, LENGTH = false, CASE = false } = valSwitch;
    let validationErrorsString = '';

    if (CHAR_SET && !/\d/.test(fieldValue)) {
      validationErrorsString += `${fieldName} must contain at least one digit`;
    }

    if (CASE && (fieldValue.toUpperCase() === fieldValue || fieldValue.toLowerCase() === fieldValue)) {
      validationErrorsString += `${fieldName} must contain both upper and lower case letters`;
    }

    if (LENGTH && fieldValue.length < minLength) {
      validationErrorsString += `${fieldName} must be at least ${minLength} characters long`;
    }

    return validationErrorsString.split(fieldName).join(`\n⦁  ${fieldName}`).trim();
  }

  private static updateFieldErrorState(
    field: LoginFieldComponent,
    fieldName: string,
    minLength: number,
    valSwitch: ValidationSwitch,
  ): void {
    const fieldValue: string = field.getInputValue();
    const fieldErrors = LoginPageComponent.getFieldValidationErrors(fieldName, fieldValue, minLength, valSwitch);
    field.setErrorText(fieldErrors);

    if (fieldErrors) {
      field.addClass('login-field--error');
    } else {
      field.removeClass('login-field--error');
    }
  }

  private static isFieldValid(field: LoginFieldComponent, minLength: number, valSwitch: ValidationSwitch): boolean {
    const fieldValue: string = field.getInputValue();
    const fieldErrors = LoginPageComponent.getFieldValidationErrors('', fieldValue, minLength, valSwitch);

    return !fieldErrors;
  }

  private isLoginValid(): boolean {
    return LoginPageComponent.isFieldValid(this.loginField, FieldMinLength.LOGIN, LOGIN_VAL_SWITCH);
  }

  private isPasswordValid(): boolean {
    return LoginPageComponent.isFieldValid(this.passwordField, FieldMinLength.PASSWORD, PASSWORD_VAL_SWITCH);
  }

  private updateLoginErrorState(): void {
    LoginPageComponent.updateFieldErrorState(this.loginField, 'Login', FieldMinLength.LOGIN, LOGIN_VAL_SWITCH);
  }

  private updatePasswordErrorState(): void {
    LoginPageComponent.updateFieldErrorState(
      this.passwordField,
      'Password',
      FieldMinLength.PASSWORD,
      PASSWORD_VAL_SWITCH,
    );
  }

  private onLoginButtonClick = (evt?: Event | undefined): void => {
    if (evt) {
      evt.preventDefault();
    }

    this.storage.setAuthData({
      login: this.loginField.getInputValue(),
      password: this.passwordField.getInputValue(),
    });

    this.router.navigate(Pages.CHAT);
  };
}
