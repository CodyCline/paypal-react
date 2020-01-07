import React, {useState, useEffect, useRef} from "react";

//This is so typescript can know what the window object is.
interface Window {
	paypal?: any;
}

//Most returned objects have unpredictable types like strings, functions, numbers, objects
type dynamicObject = {
	[key: string]: any
}

//Strict typing of the credentialItems type
type credentialItems = {
	"production": string,
	"sandbox": string
}

declare const window: Window;

export interface PayPalProps {
	env: "production" | "sandbox"
	credentials: credentialItems
	currency: string
	total: string | number
	style?: object
	loadingComponent?: React.ReactNode | string
	errorComponent?: React.ReactNode | string,
	intent?: "capture" | "authorize" | "order",

	onCancel?: (data: object) => void
	onSuccess?: (data: object) => void
	onShippingChange?: (data:object, actions: object) => void
	onError?: (err: object) => void
	onClick?: () => void
	onInit?: () => void
}

const PayPalSmartButton:React.FunctionComponent<PayPalProps> = (props) => {
	const [loaded, error] : boolean[]  = useScript(
		`https://www.paypal.com/sdk/js?client-id=${props.env === "production" ? props.credentials.production : props.credentials.sandbox}&currency=${props.currency}${props.intent?`&intent=${props.intent}`: null}`
	);
	const paypalRef = useRef<HTMLDivElement>(null); //target dom node
	async function onApprove (data:object, actions:dynamicObject) {
		try {
			const order = await actions.order.capture();
			if(order.error === "INSTRUMENT_DECLINED") {
				return actions.restart()
			}
		} catch (error) {
			console.log(error)
			throw new Error(error);
		}
	}

	const createOrder = (data:object, actions:any) => {
		return actions.order.create({
            purchase_units: [
            	{
                	amount: {
						value: props.total
					},
              	},
            ],
        });
	}

	if(loaded && !error) {
		window.paypal.Buttons({
			onApprove: props.onSuccess,
			createOrder: createOrder,
			onCancel: props.onCancel,
			onShippingChange: props.onShippingChange,
			onError: props.onError,
			onClick: props.onClick,
			onInit: props.onInit,
			style: props.style,
		})
		.render(paypalRef.current);
	}
	else if(error) {
		return (
			<React.Fragment>
				{props.errorComponent? props.errorComponent : <span>Something went wrong ... </span>}
			</React.Fragment>
		);
	}
	return (
		<React.Fragment>
			{loaded ? <div ref={paypalRef}/> : props.loadingComponent ? props.loadingComponent : <span>Loading ... </span>}
		</React.Fragment>
	)
	
}

//Mount the script to the dom
const useScript = (src:string) => {
	let cachedScripts : string[] = [];
    // Keeping track of script loaded and error state
    const [state, setState] = useState({
    	loaded: false,
      	error: false
    });
    useEffect(() => {
		//Check if the array already has the src so that this doesn't load the script twice
        if (cachedScripts.includes(src)) {
        	setState({
            	loaded: true,
            	error: false
          	});
        } else {
          	cachedScripts.push(src);
          	// Create script and push it to the dom
          	let script = document.createElement("script");
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

          	script.addEventListener("load", onScriptLoad);
          	script.addEventListener("error", onScriptError);

          	// Add script to document body
          	document.body.appendChild(script);

			// Remove event listeners on cleanup
			return () => {
				script.removeEventListener("load", onScriptLoad);
				script.removeEventListener("error", onScriptError);
			};
      	}
	},[src]);
  	return [state.loaded, state.error];
};

export default PayPalSmartButton;