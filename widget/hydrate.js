import React from 'react';
import ReactDOM from 'react-dom';

export default function hydrate(widgetName, widgetId = 0, widgetComponent) {
    let selector = `[data-widget-name="${widgetName}"]`;
    
    // FIX: Multiple widget usage turned OFF here.
    // Reason, widgets may access global or shared values that could cause race.
    // Example: inside widget (React component) methods, modify value of an input#email.
    widgetId = 0; // means only the last call will be effective
    
    // TODO: Multiple widget instance usage
    if (widgetId) {
        selector = `${selector}[data-widget-id="${widgetId}"]`;
    }

    let containers = document.querySelectorAll(selector);
    if (!containers.length) return false;

    for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const initialProps = container.dataset.widgetInitialProps || '{}';
        
        let parsedInitialProps;

        try {
            parsedInitialProps = JSON.parse(initialProps);
        } catch (error) {
            parsedInitialProps = {};
        }

        const element = React.createElement(widgetComponent, { ...parsedInitialProps });
        ReactDOM.hydrate(element, container);
    }
}
