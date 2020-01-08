# React.js PayPal Smart Button

## Overview 
A simple and flexible React.js wrapper of the latest version of PayPal's Smart Payment Buttons. This makes it easy and fast to set up accept PayPal transactions in your React.js app.
## Installation

`npm i paypal-button-react`  
Or  
`yarn add paypal-button-react`  

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
    
    const credentials = {
        "sandbox": "YOUR_SANDBOX_CREDENTIALS",
        "production": "YOUR_PRODUCTION_CREDENTIALS"
    }

	render () {
    	return (
            <PayPalSmartButton 
                env="sandbox" //Must specify sandbox or production!
                credentials={credentials}//Obtained from PayPal developer console
                currency="USD"
                total="100.0"
                onSuccess={this.onSuccess}
                onCancel={this.onCancel}
            />
        )
    }

}
```

## Advanced Setup
**This setup is entirely optional.**  
You can send the returned `orderID` from a PayPal transaction to a backend service to verify it, write it to a database, perform other operations, etc.

Here is a Full-Stack example where the React.js app sends the `orderID` to an express.js endpoint. From there, the app looks up the transaction from the ID then returns a response status based verification properties from that transaction. Example below shows this as followed.
### Front-end Setup
Send the `orderID` to the backend upon a successful transaction.
```jsx
async onSuccess (data) {
    const fetchOrder = await fetch("YOUR_API_ENDPOINT", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
		    //The id string returned from PayPal
			"orderID": data.orderID
	    })
	})
	const response = await fetchOrder.json()
	console.log("Returned Response\n", response)
}
<PayPalSmartButton 
    //... other props
    onSuccess={this.onSuccess}
/>
```
### Back-end Setup
First, install the required server dependency. 

`yarn add @paypal/checkout-server-sdk`  
Or  
`npm i @paypal/checkout-server-sdk`

Create the endpoint.
```js
const express = require('express');
const router = express.Router();
const cors = require('cors');
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
router.use(cors());

//These functions essentially take your credentials and return a usable client method which can be used to query and authorize transactions. 
function environment() {
	let clientId = 'MY_CLIENT_ID'; //Same one used on the PayPal button
	let clientSecret = 'MY_CLIENT_SECRET'; //Obtained from console
    
    //This is set to sandbox, you would set this to the production method.
	return new checkoutNodeJssdk.core.SandboxEnvironment(
		clientId, clientSecret
	);
}

function client() {
	return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

router.post("/api/verify", async(req, res) => {
	const orderID = req.body.orderID;
	console.log(req.body)
	let request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);
	try {
		//This queries the Orders API with your order id in the request
		const order = await client().execute(request);
		//Many different you can verify a transaction with the returned order object. However, for this example we are only going to use the "status" property.
		if (order.result.status === "APPROVED") {
			res.status(200).send({
				"status": "approved"
			})
		}
        //If the payment exists and the transaction isn't approved. 
		else if (order.result.status !== "APPROVED") {
			res.status(400).send({
				"status": "unsuccessful",
				"description": "This is likely due to your transaction not being approved"
			})
		}
	} catch (err) {
		//Catch any application errors in the code.
		//Not to be confused with a declined transaction
		console.log(err)
		res.status(500).send({
			"status": "error", 
			"description": "An internal server error occured"
		});
	}
});
```

## Other Callback Events
Here is a list of other callback events that you can use for many different use-cases such as validating user input, localizing transactions, disabling the button, etc.
### Event: onShippingChange
This event fires when a customer updates their shipping information. For example, if you are a US-based company that can only ship in North America, you would use this to event to appropriately respond. In the example below, any transaction that is not from United States, Canada or Mexico is declined.
```js
onShippingChange(data, actions) {
	if(data.shipping_address.country !== "US" || "CA" || "MX") {
		actions.reject() //Decline the transaction.
	}
}
```
```jsx
<PayPalButton
    //... Other props
    onShippingChange={this.onShippingChange}
/>
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
                //... Other props
                onInit={this.onInit}
            />
        )
    }

}
```
### Event: onClick 
Use this event in conjunction with `onInit` to visually alert the user with validations
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

    validateInput () {
        //Some kind of business logic that tells the user to fill out all fields
    }
    
	render () {
    	return (
        	<PayPalSmartButton 
                //... Other methods and props
                onClick={this.validateInput}
            />
        )
    }

}
```
## Props
Prop Name | Type | Example Value | Description
--- | --- | --- | --- |
credentials | object | `{"sandbox": "MYSANDBOXID", "production": "MYPRODUCTIONID"}` | Used to authenticate with the API. Seperate tokens are used in sandox and production. Visit [here](https://developer.paypal.com/developer/applications/) to create an app and get a token.
|env | string | `sandbox` or `production` | Used to specify whether to use the sandbox or production version of the `clientID`
currency | string | `"USD"` or `"CAD"` | Must be a formatted as a 3-letter ISO code representing a countries currency. The full list of supported fiat currencies [located here](https://developer.paypal.com/docs/api/reference/currency-codes/ "Supported FIAT Currencies").
total | string or number | `100.0` or `"5.23"` | The total amount you are charging on the transaction. This also includes sales tax (where applicable) 
style | object |  `{ layout:  "horizontal", color:   "black" }` | Allows styling options for colors, shapes and layouts. Consult the latest reference for [all possible styles](https://developer.paypal.com/docs/checkout/integration-features/customize-button/) 
|loadingComponent | jsx or string | `"Loading ..."` or `<span>Loading</span>` | Due to a delay in render, a loading component may be specified before the buttons load to inform the user.
errorComponent | jsx or string | `"Error"` or `<span>PayPal could not be loaded</span>` | This component will render when PayPal couldn't be loaded or an error occurred on their part.
onSuccess | function | `onSuccess(data)` | Event that fires when a customer completed the transaction without any errors. 
onShippingChange | function | `onShippingChange(data, actions)` | Used for detecting changes in a customer shipping address. Fires when they update their account address or use a different one for the transaction. 
onCancel | function | `onCancel() ` | Callback event that fires when a user cancels the transaction before paying.
onInit | function | `onInit(data, actions)` | This fires off immediately after render. 
onClick | function | `onClick()` | Fires off when you click any of the buttons.
intent | string | `capture` `authorize` | Specifies whether to capture the funds immediately or authorize the transaction later. Must be specified in production: during development, it defaults to `capture`.
## TODO
* Support for server-side rendering
* Test and specify peer-dependency requirements
## Contributing
* Pull requests welcome!
## License
### MIT