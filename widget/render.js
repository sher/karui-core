import React from 'react';
import ReactDOM from 'react-dom';

export default function render(widgetName, widgetId = 0, widgetComponent) {
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
        const initialState = container.dataset.widgetInitialState || '{}';
        
        let parsedInitialState;

        try {
            parsedInitialState = JSON.parse(initialState);
        } catch (error) {
            parsedInitialState = {};
        }

        const element = React.createElement(widgetComponent, { ...parsedInitialState });
        ReactDOM.render(element, container);
    }
}
