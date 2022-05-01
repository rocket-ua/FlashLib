const path = require('path');

module.exports = {
    mode: 'production',
    devtool: false,
    stats: 'errors-only',
    entry: './src/FlashLib.js',
    output: {
        filename: 'flashlib.js',
        path: path.resolve(__dirname, './dist/'),
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: [
                    /node_modules/],
                include: path.join(__dirname, 'src/')
            },
        ],
    },
};
