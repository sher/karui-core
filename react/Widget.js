const React = require('react');
const PropTypes = require('prop-types');
const { Helmet } = require('react-helmet');
const RenderContext = require('./RenderContext');
module.exports = Widget;

const scripts = [];
const styles = [];

function Widget({ name, id = 0, initialProps }) {
    const { request } = React.useContext(RenderContext);
    const assets = request.server.plugins.react.assets;
    const namespace = assets.namespace;
    const files = assets.widgets[name];
    if (!files) return null;

    if (initialProps) {
        try {
            initialProps = JSON.stringify(initialProps);
        } catch (err) {
            console.error(`Failed to parse asset [${name}] initial props`, err);
        }
    }

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

    const head = Helmet.peek();
    const styles = head.link.toComponent().filter(link => link.props.rel === 'stylesheet').map(link => link.href);
    const scripts = head.script.toComponent().map(script => script.props.src);
    const dangerousWidgetInitString = `${namespace}['${name}']?${namespace}['${name}'].default?${namespace}['${name}'].default(${id}):undefined:undefined`;

    return React.createElement(
        React.Fragment,
        null,
        React.createElement(
            Helmet,
            null,
            files
                .filter(file => /\.css$/.test(file.name))
                .filter(file => styles.indexOf(file.path) === -1)
                .map(file => {
                    return React.createElement('link', {
                        key: file.path,
                        rel: 'stylesheet',
                        href: file.path,
                    });
                }),
            files
                .filter(file => /\.js$/.test(file.name))
                .filter(file => scripts.indexOf(file.path) === -1)
                .map(file => {
                    return React.createElement('script', {
                        key: file.path,
                        src: file.path,
                        rel: 'preload',
                    });
                }),
        ),
        React.createElement(
            'div',
            {
                'data-widget-name': name,
                'data-widget-id': id,
                'data-widget-initial-props': initialProps,
            },
            // files
            //     .filter(file => /\.js$/.test(file.name))
            //     .filter(file => file.isEntry)
            //     .map(file => {
            //         return React.createElement('script', {
            //             key: file.path,
            //             src: file.path,
            //             rel: 'preload',
            //         });
            //     }),
            React.createElement('script', {
                dangerouslySetInnerHTML: {
                    __html: dangerousWidgetInitString,
                },
            })
        )
    );
}

Widget.propTypes = {
    name: PropTypes.string.isRequired,
    id: PropTypes.string,
    initialProps: PropTypes.object,
};
