const React = require('react');
const PropTypes = require('prop-types');
const { Helmet } = require('react-helmet');
const RenderContext = require('./RenderContext');
module.exports = Widget;

function Widget({ id = 0, name, component, initialProps }) {
    const { request } = React.useContext(RenderContext);
    const assets = request.server.plugins.react.assets;
    const namespace = assets.namespace;
    const files = assets.widgets[name];
    // files may be empty, because wrong name or other compilation error

    let parsedId;

    try {
        parsedId = parseInt(id, 10);

        if (parsedId % 1 !== 0 || parsedId < 0) {
            parsedId = 0;
            throw Error(`Widget [${name}] [id] property must be a positive integer. Provided value [${id}]`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        id = parsedId;
    }

    let stringifiedInitialProps;

    if (initialProps) {
        try {
            stringifiedInitialProps = JSON.stringify(initialProps);
        } catch (err) {
            console.error(`Failed to parse asset [${name}] initial state`, err);
        }
    }

    return React.createElement(
        React.Fragment,
        null,
        React.createElement(
            Helmet,
            null,
            files
                .filter(file => /\.css$/.test(file.name))
                .map((file, i) =>
                    React.createElement('link', {
                        key: i,
                        rel: 'stylesheet',
                        href: file.path,
                    })
                ),
            files
                .filter(file => /\.js$/.test(file.name))
                .map((file, i) =>
                    React.createElement('script', {
                        key: i,
                        src: file.path,
                        rel: 'preload',
                    })
                )
        ),
        React.createElement(
            'div',
            {
                'data-widget-name': name,
                'data-widget-id': id,
                'data-widget-initial-props': stringifiedInitialProps,
            },
            React.createElement(component, { ...initialProps })
        ),
        React.createElement('script', null, `${namespace}.${name}?${namespace}.${name}.default?${namespace}.${name}.default(${id}):undefined:undefined`)
    );
}

Widget.propTypes = {
    id: PropTypes.number,
    name: PropTypes.string.isRequired,
    initialProps: PropTypes.object,
};
