import * as React from "react";
import * as renderer from "react-test-renderer";
import PayPalSmartButton from "..";


const testCredentials = {
    "sandbox": "", 
    "production": ""
}

test("Sanity test to check for props loading", () => {
    
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

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
});