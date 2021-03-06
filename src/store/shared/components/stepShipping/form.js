import React from 'react'
import {Field, reduxForm} from 'redux-form'
import text from '../../text'
import { formatCurrency } from '../../lib/helper'

const validateRequired = value => value && value.length > 1 ? undefined : text.required;

const inputField = (field) => (
  <div className={field.className}>
    <label htmlFor={field.id}>{field.label}{field.meta.touched && field.meta.error && <span className="error">{field.meta.error}</span>}</label>
    <input {...field.input} placeholder={field.placeholder} type={field.type} id={field.id} className={field.meta.touched && field.meta.error
      ? "invalid"
      : ""}/>
  </div>
)

const textareaField = (field) => (
  <div className={field.className}>
    <label htmlFor={field.id}>{field.label}{field.meta.touched && field.meta.error && <span className="error">{field.meta.error}</span>}</label>
    <textarea {...field.input} placeholder={field.placeholder} rows={field.rows} id={field.id} className={field.meta.touched && field.meta.error
      ? "invalid"
      : ""}></textarea>
  </div>
)

const getFieldLabelByKey = (key) => {
  switch (key) {
    case 'full_name':
      return text.fullName;
    case 'address1':
      return text.address1;
    case 'address2':
      return text.address2;
    case 'postal_code':
      return text.postal_code;
    case 'phone':
      return text.phone;
    case 'company':
      return text.company;
    default:
      return '';
  }
}

const getFieldLabel = (field) => {
  const label = field.label && field.label.length > 0 ? field.label : getFieldLabelByKey(field.key);
  return field.required === true ? label : `${label} (${text.optional})`;
}

class CheckoutStepShipping extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.show !== nextProps.show){
      this.setState({
        done: !nextProps.show
      });
    }
  }

  handleSave = () => {
    this.setState({
      done: true
    });
    this.props.saveForm();
    this.props.onSave();
  };

  handleEdit = () => {
    this.setState({
      done: false
    });
    this.props.onEdit();
  };

  onChangeBillingAsShipping = (event) => {
    this.setState({
      billingAsShipping: event.target.checked
    });
  };

  render() {
    const {
      handleSubmit,
      pristine,
      invalid,
      valid,
      reset,
      submitting,
      processingCheckout,
      initialValues,
      shippingMethod,
      checkoutFields,
      settings,
      finishCheckout,
      inputClassName,
      buttonClassName,
      editButtonClassName
    } = this.props;

    const hideBillingAddress = settings.hide_billing_address === true;
    const { payment_method_gateway, grand_total } = initialValues;
    const showPaymentForm = payment_method_gateway && payment_method_gateway !== '';

    const commentsField = checkoutFields.find(f => f.name === 'comments');
    const commentsFieldPlaceholder = commentsField && commentsField.placeholder && commentsField.placeholder.length > 0 ? commentsField.placeholder : '';
    const commentsFieldLabel = commentsField && commentsField.label && commentsField.label.length > 0 ? commentsField.label : text.comments;
    const commentsFieldStatus = commentsField && commentsField.status.length > 0 ? commentsField.status : null;
    const commentsValidate = commentsFieldStatus === 'required' ? validateRequired : null;
    const hideCommentsField = commentsFieldStatus === 'hidden';

    if(!this.props.show){
      return (
        <div className="checkout-step">
          <h1><span>2</span>{this.props.title}</h1>
        </div>
      )
    } else if(this.state.done){

      let shippingFields = null;
      if(shippingMethod && shippingMethod.fields && shippingMethod.fields.length > 0){
        shippingFields = shippingMethod.fields.map((field, index) => {
          const fieldLabel = getFieldLabel(field);
          const fieldValue = initialValues.shipping_address[field.key];

          return <div key={index} className="checkout-field-preview">
            <div className="name">{fieldLabel}</div>
            <div className="value">{fieldValue}</div>
          </div>
        })
      }

      return (
        <div className="checkout-step">
          <h1><span>2</span>{this.props.title}</h1>
          {shippingFields}

          {!hideCommentsField && initialValues.comments !== '' &&
            <div className="checkout-field-preview">
              <div className="name">{commentsFieldLabel}</div>
              <div className="value">{initialValues.comments}</div>
            </div>
          }

          <div className="checkout-button-wrap">
            <button
              type="button"
              onClick={this.handleEdit}
              className={editButtonClassName}>
              {text.edit}
            </button>
          </div>
        </div>
      )
    } else {

      let shippingFields = null;
      if(shippingMethod && shippingMethod.fields && shippingMethod.fields.length > 0){
        shippingFields = shippingMethod.fields.map((field, index) => {
          const fieldLabel = getFieldLabel(field);
          const fieldId = `shipping_address.${field.key}`;
          const fieldClassName = `${inputClassName} shipping-${field.key}`;
          const validate = field.required === true ? validateRequired : null;

          return <Field
            key={index}
            className={fieldClassName}
            name={fieldId}
            id={fieldId}
            component={inputField}
            type="text"
            label={fieldLabel}
            validate={validate}
          />
        })
      }

      return (
        <div className="checkout-step">
          <h1><span>2</span>{this.props.title}</h1>
          <form onSubmit={handleSubmit}>
            {shippingFields}

            {!hideCommentsField &&
              <Field
                className={inputClassName + ' shipping-comments'}
                name="comments"
                id="customer.comments"
                component={textareaField}
                type="text"
                label={commentsFieldLabel}
                placeholder={commentsFieldPlaceholder}
                validate={commentsValidate}
                rows="3"
              />
            }

            {!hideBillingAddress &&
              <div>
                <h2>{text.billingAddress}</h2>
                <div className="billing-as-shipping">
                  <input id="billingAsShipping" type="checkbox" onChange={this.onChangeBillingAsShipping} checked={this.state.billingAsShipping} />
                  <label htmlFor="billingAsShipping">{text.sameAsShipping}</label>
                </div>

                {!this.state.billingAsShipping &&
                  <div>
                    <Field className={inputClassName + ' billing-fullname'} name="billing_address.full_name" id="billing_address.full_name" component={inputField} type="text" label={text.fullName} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-address1'} name="billing_address.address1" id="billing_address.address1" component={inputField} type="text" label={text.address1} validate={[validateRequired]}/>
                    <Field className={inputClassName + ' billing-address2'} name="billing_address.address2" id="billing_address.address2" component={inputField} type="text" label={text.address2 + ` (${text.optional})`}/>
                    <Field className={inputClassName + ' billing-postalcode'} name="billing_address.postal_code" id="billing_address.postal_code" component={inputField} type="text" label={text.postal_code + ` (${text.optional})`}/>
                    <Field className={inputClassName + ' billing-phone'} name="billing_address.phone" id="billing_address.phone" component={inputField} type="text" label={text.phone + ` (${text.optional})`}/>
                    <Field className={inputClassName + ' billing-company'} name="billing_address.company" id="billing_address.company" component={inputField} type="text" label={text.company + ` (${text.optional})`}/>
                  </div>
                }
              </div>
            }

            <div className="checkout-button-wrap">
              {showPaymentForm &&
                <button
                  type="button"
                  onClick={handleSubmit(data => {
                    this.handleSave();
                  })}
                  disabled={invalid}
                  className={buttonClassName}>
                  {text.next}
                </button>
              }

              {!showPaymentForm &&
                <button
                  type="button"
                  onClick={handleSubmit(data => {
                    finishCheckout(data)
                  })}
                  disabled={submitting || processingCheckout || invalid}
                  className={buttonClassName}>
                  {text.orderSubmit}
                </button>
              }

            </div>
          </form>
        </div>
      )
    }
  }
}

export default reduxForm({form: 'CheckoutStepShipping', enableReinitialize: true, keepDirtyOnReinitialize: false})(CheckoutStepShipping)
