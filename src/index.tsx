/*
** @class PayPalSmartButton
*/

import * as React from "react";
import {useState, useEffect} from 'react';

//This is so typescript can know what the window object is.
interface Window {
    paypal?: any;
}

//Most returned objects have unpredictable types like strings, functions, numbers, objects
type objectUnknownProperties = {
	[key: string]: any
}

//Strict typing of the credentialItems type
type credentialItems = {
	"production": string,
	"sandbox": string
}

declare var window: Window;

export interface PayPalProps {
	env: "production" | "sandbox"
	credentials: credentialItems
	currency: string
	total: string | number
	style?: objectUnknownProperties
	loadingComponent?: React.ReactNode | string
	errorComponent?: React.ReactNode | string

	onCancel?: (data: object) => void
	onSuccess?: (data: object) => void
	onShippingChange?: (data:object, actions: object) => void
	onError?: (err: object) => void
	onClick?: () => void
	onInit?: () => void
}

export default class PayPalSmartButton extends React.Component<PayPalProps> {

	async onApprove (data:object, actions:objectUnknownProperties) { //Data is also an argument
		const order = await actions.order.capture();

		if(order.error === 'INSTRUMENT_DECLINED') {
			return actions.restart()
		}
	} 

	createOrder (data:object, actions:objectUnknownProperties) { //Data is also an argument
		
		return actions.order.create({
            purchase_units: [
              {
                amount: {
					currency_code: "USD",
					value: "10.0",
				},
              },
            ],
        });
	}
	render() {
		window.paypal.Buttons({
			onApprove: this.onApprove,
			createOrder: this.createOrder,
			onCancel: this.props.onCancel,
			onShippingChange: this.props.onShippingChange,
			onError: this.props.onError,
			onClick: this.props.onClick,
			onInit: this.props.onInit,
			style: this.props.style,
		})
		.render('#paypal-smart-checkout');
		return  (
			<div id="paypal-smart-checkout"></div>
		)
	}
}


function useScript(src:string) {
	let cachedScripts : string[] = [];
    // Keeping track of script loaded and error state
    const [state, setState] = useState({
    	loaded: false,
      	error: false
    });

    useEffect(() => {
    	// If cachedScripts array already includes src that means another instance ...
      	// ... of this hook already loaded this script, so no need to load again.
        if (cachedScripts.includes(src)) {
        	return setState({
            	loaded: true,
            	error: false
          	});
        } else {
          	cachedScripts.push(src);
          	// Create script
          	let script = document.createElement('script');
          	script.src = src;
          	script.async = true;

          	// Script event listener callbacks for load and error
          	const onScriptLoad = () => {
            	setState({
              		loaded: true,
              		error: false
            	});
          	};

          	const onScriptError = () => {
				// Remove from cachedScripts we can try loading again
				const index = cachedScripts.indexOf(src);
				if (index >= 0) cachedScripts.splice(index, 1);
				script.remove();

				return setState({
					loaded: true,
					error: true
				});
          	};

          	script.addEventListener('load', onScriptLoad);
          	script.addEventListener('error', onScriptError);

          	// Add script to document body
          	document.body.appendChild(script);

			// Remove event listeners on cleanup
			return () => {
				script.removeEventListener('load', onScriptLoad);
				script.removeEventListener('error', onScriptError);
			};
      	}
	},[src]);
  	return [state.loaded, state.error];
};