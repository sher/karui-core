module.exports = {
    name: 'karui.react',
    version: '0.1.0',
    register,
};

const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const { Helmet } = require('react-helmet');
const RenderContext = require('./RenderContext');

/**
 *
 * @param {Hapi.Server} server
 * @param {} config Karui configuration object
 */
async function register(server, { staticPath }) {
    const render = function(Component, props) {
        const RenderContextProvider = React.createElement(
            RenderContext.Provider,
            { value: { request: this.request } },
            React.createElement(Component.default || Component, props)
        );

        const content = ReactDOMServer.renderToStaticMarkup(RenderContextProvider);
        const helmet = Helmet.renderStatic();

        let html = `<!doctype html><html ${helmet.htmlAttributes.toString()}><head>${helmet.title.toString()}${helmet.meta.toString()}${helmet.link.toString()}${helmet.style.toString()}${helmet.script.toString()}</head><body ${helmet.bodyAttributes.toString()}>${content}</body></html>`;

        return this.response(html).takeover();
    };

    if (staticPath) {
        server.plugins['react'] = {
            assets: require(path.join(staticPath, 'assets.json')),
        };
    }

    server.decorate('toolkit', 'render', render);
}
