# PayPal React Smart Button

## Overview 
Currently, this is a work-in-progress for a simple and flexible React.js implementation of the newest version of the PayPal Smart Payment Buttons API.

## Installation

`yarn add ...`  

Or

`npm i ...`
## Quickstart
Simplest example to get you going.
```jsx
import React from 'react';
import PayPalSmartButton from 'paypal-react'

class App extends React.Component {
	onSuccess (data) {
    	//The data argument returns transaction details such as shipping details, address, country, etc. 
    	console.log("Successful Transaction!", data)
    }
    onCancel (data) {
    	//Here is where you would set state indicating the transaction was cancelled
    	console.log("You cancelled the purchase", data)
    }
    
    onError(data) {
    	//Set state showing some kind of error happend
    	console.log("Something went wrong...", data)
    }
    
	render () {
    	return (
        	<PayPalSmartButton 
                clientId="CLIENT_ID" //Obtained from PayPal developer console
                currency="USD"
                total="100.0"
                onSuccess={this.onSuccess}
                onCancel={this.onCancel}
            />
        )
    }

}
```

## Other Callback Events
Here is a list of other callback events that you can use for things like rejecting international customers or validating user input.
### Event: onShippingChange
This event is used for detecting changes in a buyers shipping address and appropriately respond. For example, let's suppose you are a US-based company that sells digital products internationally. However, you wouldn't be able to take funds from embargoed countries. This would be how to appropriately handle this scenario.
```jsx
onShippingChange(data, actions) {
	if(data.shipping_address.country === "MM" || "CI" || "CU" || "NK" || "SY" || "VZ" || "SS") {
		actions.reject() //Reject the transaction
	}
}

```
### Event: onInit 
This event is fired immediately after render. Use this if you wanted to prevent a user from continuing with the transaction before they fill out some input fields.
```jsx
import React from 'react';
import PayPalSmartButton from 'paypal-react'

class App extends React.Component {
	
    state = {
    	checkBox: false
    }
    
    onInit (data, actions) {
    	if(this.state.checkBox) {
        	actions.enable()
        } else {
        	//Set state showing they need to check the box first.
        	actions.disable()
        }
    }
    
	render () {
    	return (
        	<PayPalSmartButton 
                //... Other methods and props
                onInit: this.onInit
            />
        )
    }

}
```
### Event: onClick 
Event does exactly what you would expect. You would use this event in conjunction with `onInit` to visually alert the user with validations
```jsx
import React from 'react';
import PayPalSmartButton from 'paypal-react'

class App extends React.Component {
	
    state = {
    	checkBox: false
    }
    
    onInit (data, actions) {
    	if(this.state.checkBox) {
        	actions.enable()
        } else {
        	actions.disable()
        }
    }
    
	render () {
    	return (
        	<PayPalSmartButton 
                //... Other methods and props
                onClick: this.onClick
            />
        )
    }

}
```
## Props
Full list of props with their corresponding name, type, description and example values.  Prop Name | Type | Example Value | Description
--- | --- | --- | --- |
clientId | string | `token` | Used to authenticate. Seperate tokens are used in sanbox and production. Visit [here](https://developer.paypal.com/developer/applications/) to create an app and get a token.
currency | string | `"USD"` or `"CAD"` | Must be a formatted as a 3-letter ISO code representing a supported currency. The full list of fiat currencies supported by PayPal is [located here](https://developer.paypal.com/docs/api/reference/currency-codes/ "Supported FIAT Currencies")
total | string or number | `100.0` or `"5.23"` | The total amount you are charging on the transaction.  
style | object |  `{ layout:  "horizontal", color:   "black" }` | Allows limited styling options for colors, options and layouts. Consult the latest reference for [all possible styles](https://developer.paypal.com/docs/checkout/integration-features/customize-button/) 
|loadingComponent | jsx or string | `"Loading ..."` or `<span>Loading</span>` | Due to a delay in render, a loading component may be specified before the buttons load to inform the user. 
onSuccess | function | `onSuccess(data)` | When a user detects a user n.
onShippingChange | function | `onShippingChange(data, actions)` | Event that fires when a user 
onCancel | function | `onCancel() ` | Callback event that fires when a user cancels the transaction before paying.
onInit | function | `onInit(data, actions)` | This fires off immediately after render. 
onClick | function | `onClick()` | Fires off when you click any of the buttons.