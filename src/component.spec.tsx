import * as React from "react";
import * as ReactDOM from 'react-dom';
import * as renderer from "react-test-renderer";
import PayPalSmartButton from "..";

//Most test cases will just verify that props are passed as expected,
//rendering of error and loading components work as expected.
const testCredentials = {"production": "", "sandbox": ""}

test("Sanity check for it actually renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(
        <PayPalSmartButton 
            env="sandbox" 
            credentials={testCredentials}
            currency="USD" 
            total="5" 
        />, div
    )
});


test("Check if props load properly", () => {
    const component = renderer.create(
        <PayPalSmartButton 
            env="sandbox" 
            credentials={testCredentials}
            currency="USD" 
            total="5" 
        />
    );
    const testInstance = component.root;

    expect(testInstance.findByType(PayPalSmartButton).props.currency).toBe("USD");
    expect(testInstance.findByType(PayPalSmartButton).props.total).toBe("5");
    expect(testInstance.findByType(PayPalSmartButton).props.env).toBe("sandbox");

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});
