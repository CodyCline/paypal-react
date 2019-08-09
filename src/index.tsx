/**
 * @class PayPalSmartButton
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
	onShippingChange?: (data:object, actions: object) => void,
	onError?: (err: object) => void,
	onClick?: () => void,
	onInit?: () => void
}

export default class PayPalSmartButton extends React.Component<PayPalProps> {
	async onApprove (data:any, actions:any) {
		const order = await actions.order.capture();

		if(order.error === 'INSTRUMENT_DECLINED') {
			return actions.restart()
		}
	}

	createOrder (data:any, actions:any) {
		return actions.order.create({
            purchase_units: [
              {
                amount: {
					currency_code: "USD",
					value: this.props.total,
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
			<React.Fragment>
				<div id="paypal-smart-checkout"></div>
			</React.Fragment>
		)
	}
}