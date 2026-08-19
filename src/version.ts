declare const __WEB_HIGHLIGHTER_VERSION__: string;

// Tests and source-level consumers do not pass through webpack's DefinePlugin.
const version = typeof __WEB_HIGHLIGHTER_VERSION__ === 'string' ? __WEB_HIGHLIGHTER_VERSION__ : 'development';

export default version;
