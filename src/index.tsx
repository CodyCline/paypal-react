/**
 * @class ExampleComponent
 */

import * as React from "react";

//This is so typescript can know what the window object is.
interface Window {
    paypal?: any;
}
declare var window: Window;


export interface PayPalProps {
	currency: string,
	total: any,
	style?: object,
	disabled?: boolean,

	onCancel?: (data: object) => void,
	onSuccess?: (data: object) => void,
	onError?: (err: object) => void,
	onClick?: () => void,
}

export default class PayPalSmartButton extends React.Component<PayPalProps> {
	render() {
		window.paypal.Buttons({
			onCancel: this.props.onCancel,
			onError: this.props.onError,
			onClick: this.props.onClick,
			style: this.props.style,
		})
		.render('#paypal-smart-checkout');
		return  (
			<React.Fragment>
				<div id="paypal-smart-checkout"></div>
			</React.Fragment>
		)
	}
}