/**
 * These are your configuration file defaults.
 *
 * You can create additional configuration files ending in *.default.js or
 * *.local.js that the server will load. The *.local.js files are ignored by
 * git/npm due to the .gitignore file in the conf directory. Docker will also
 * ignore these files using the .dockerignore file in the project root. This
 * is so you can develop your service locally using *.local.js files and keep
 * your production configs in the *.default.js files.
 *
 * For example, you may want to develop your service using a test API key. You
 * would place that API key in a *.local.js file and it would get merged over
 * the API key that is already present in default.js
 *
 * This is a JavaScript file (instead of JSON) so you can also use environment
 * variables or perform logic in this file if needed.
 */
module.exports = {
	// This is your generated API key.  It was generated uniquely when you
	// created this project. DO NOT SHARE this key with other services and be
	// careful with this key since it controls access to your API using the
	// default configuration.

	// API key
	apikey: 'SHVImEzNEPdbnCphM+1g1KegU/0WmTSr',

	// This is the base url the service will be reachable at not including the
	// port
	baseurl: 'http://localhost',

	// Enabling this property will print out the process.env at startup time
	printEnvVars: false,

	// Proxy configuration. This configuration option allows to configure
	// proxy server URL that can be leveraged in plugins that do http/s
	// communication.
	// proxy: 'http://localhost:8081',

	// Configures your http server
	http: {
		// This is the port the service will be bound to. Defaults to 8080.
		port: parseInt(process.env.PORT) || 8080,

		// When this is true, the service will no longer listen on requests over http.
		// Disabling http requires 'ssl' to be configured.
		disabled: false,

		// Controls certain header algorithms.
		headers: {
			// RFC1864: Enabling will send a response header which contains an MD5 hash of the
			// response body.
			'content-md5': false,
			// RFC7232: Enabling will send a response header which contains a unique tag for a
			// specific version of a resource. Used for caching.
			etag: false,
			// Enabling will send a response header which describes the server.
			server: true
		}
	},

	// SSL configuration. For a step-by-step tutorial on how to configure SSL see:
	// https://docs.axway.com/bundle/api-builder/page/docs/security_guide/index.html#enabling-tls-ssl
	// Note that the sample SSL code below uses the 'fs' and 'path' modules, e.g.:
	// const fs = require('fs');
	// const path = require('path');
	// ssl: {
	// 	port: 8443,
	//	key: fs.readFileSync(path.join('.', 'ssl','key.pem'), 'utf8'),
	//	cert: fs.readFileSync(path.join('.', 'ssl','cert.pem'), 'utf8'),
	//	passphrase: 'secret'
	// },

	// The number of milliseconds before timing out a request to the server.
	timeout: 90000,

	// Log level of the application. Can be set to (in order of most-verbose to
	// least): trace, debug, info, warn, error, fatal, none
	logLevel: process.env.LOG_LEVEL || 'info',

	// Prefix to use for APIs, access to which is governed via `accessControl`.
	apiPrefix: '/api',

	// Request limits for the API Builder server. When any request is greater
	// than this limit, a 413 response will be returned to the client.
	// For options that take a size, units are powers of 2 (1KB = 1024B)
	limits: {
		// The maximum size of any file/part in a multipart/form-data request
		multipartPartSize: '10MB'
	},

	// Control access to the service.  Set the `apiPrefixSecurity` to change
	// the authentication security to APIs bound to `apiPrefix`.  Note that
	// different authentication security require different input parameters.
	// `apiPrefixSecurity` can be any of the following:
	//
	// 'none' - Disable authentication.  Note that this will make all APIs
	// hosted on `apiPrefix` public.
	//
	// 'ldap' - LDAP authentication.  Requires HTTP Basic Authentication
	// (RFC-2617) scheme with Base64 encoded username:password.  Also requires
	// specifying configuration property named `ldap`. It should be of type
	// object and should contain required property `url` and optional
	// properties described in ldapauth-fork module docs. See:
	// https://www.npmjs.com/package/ldapauth-fork#ldapauth-config-options
	//
	// 'apikey' - HTTP header authentication.  Requires a HTTP header `APIKey`
	// with the API key.
	//
	// 'basic' - This is the default.  HTTP Basic Authentication (RFC 2617)
	// where the username is the `apikey`, and the password is blank.
	//
	// 'plugin' - A custom authentication scheme. See:
	// https://docs.axway.com/bundle/api-builder/page/docs/developer_guide/project/configuration/authentication_schemes/index.html#custom-authentication-plugin
	//
	// If you wish any path that is not bound to `apiPrefix` to be accessible
	// without authentication, then you can explicitly add them to `public`
	// paths.
	accessControl: {
		apiPrefixSecurity: 'none', // none | basic | apikey | ldap | plugin
		public: []
	},

	// Admin UI settings. Controls the settings for the
	// @axway/api-builder-admin UI console.
	admin: {
		// Control whether the admin website is available.
		enabled: true,
		// The hostnames or IPs from which connections to admin are allowed.
		// Hostnames must be resolvable on the server. IP ranges can also be
		// specified. e.g. [ 'localhost', '192.168.1.0/24', '10.1.1.1' ]. An
		// empty list [] will allow unrestricted access, though this is not
		// recommended due to security concerns.
		allowedHosts: [
			//'localhost', '::1'
		]
	},

	// Swagger API documentation configuration.
	apidoc: {
		// If you disable, the swagger API documentation will not be available.
		// If @axway/api-builder-admin is installed and enabled, this has no
		// effect.
		disabled: false,

		// The prefix for the swagger API documentation. Documentation is always
		// available from '{prefix}/swagger.json'
		prefix: '/apidoc',

		// Overides for the Swagger API documentation.  These optional
		// overrides tweak how the API is generated, but not how it is hosted
		// (use `apiPrefix`, `port`, and `ssl` configuration instead).  This
		// allows you to tweak specific Swagger values that are useful when
		// the service is not consumed directly, such as when the services is
		// exposed through a proxy.  Available options are:
		//
		// schemes - The transfer protocol of the service. It is an array of
		// values that must be one or more of 'http', 'https', 'ws' or 'wss'.
		// e.g. ['https']
		//
		// host - The host (name or ip) serving the service. This MUST be the
		// host only and does not include the scheme nor sub-paths. It may
		// include a port.
		//
		// basePath - The base path on which the service is served relative to
		// the host. If provided, this MUST start with a leading slash, or be
		// null to specify not to use basePath.
		overrides: {
			// schemes: [ 'https' ],
			// host: 'localhost:8080',
			// basePath: '/'
		}
	},

	// You can generally leave this as-is since it is generated for each new
	// service you created.
	session: {
		encryptionAlgorithm: 'aes256',
		encryptionKey: '9kuNHn+ic7Zwqaj5rcRwlz4sHbTrprHHRGMim+nezko=',
		signatureAlgorithm: 'sha512-drop256',
		signatureKey: 'wm7pcf6f47H+Zqc9Oc8kRSkUkmOa9wUlQGlmGZvaDUWCY75VIS6fKKUfSK3CQgUpfUy0kMbXDXJzX0J8LJxCcA==',
		// should be a large unguessable string
		secret: 'PLsH2/TKu4oOtiFMwXTdOWXbzTeIZX5Q',
		// how long the session will stay valid in ms
		duration: 86400000,
		// if expiresIn < activeDuration, the session will be extended by
		// activeDuration milliseconds
		activeDuration: 300000
	},

	// If you want signed cookies, you can set this value. if you don't want
	// signed cookies, remove or make null
	cookieSecret: 'aH63ZG+DSwhoVHhYohw5IQGKseIRsY5m',

	// Your connector configuration goes here
	connectors: {
	},

	// Cross-Origin Resource Sharing (CORS) settings.  The available options:
	//
	// 'Access-Control-Allow-Origin' - List of allowed origins.  The format can
	// be any (e.g. '*'), a space separated list of strings (e.g.
	// 'http://foo.com http://bar.com'), an array (e.g. ['http://foo.com',
	// 'http://bar.com']), or a regex expression (e.g. /foo\.com$/).
	//
	// 'Access-Control-Allow-Credentials' - Adds the header to responses.  This
	// response header tells browsers whether to expose the response to frontend
	// JavaScript code when the request's credentials mode
	// (`Request.credentials`) is `include`.
	//
	// 'Access-Control-Allow-Methods' - Only these methods will be allowed (out
	// of all available HTTP methods) for an endpoint. All available methods
	// are allowed by default (format: comma separated string or, an array:
	// e.g. 'GET' or 'GET, PUT' or ['GET', 'PUT'])
	//
	// 'Access-Control-Allow-Headers' - Allowed request headers (format: comma
	// separated string or, an array: e.g. 'content-type, authorization' or
	// ['content-type', 'authorization']) 'Access-Control-Allow-Headers':
	// ['content-type', 'authorization']
	//
	// 'Access-Control-Expose-Headers' - List of response headers exposed to the
	// user. Always exposed headers: request-id, response-time and any headers
	// defined in the endpoint (format: comma separated string or, an array:
	// e.g. 'content-type, response-time' or ['content-type', 'response-time'])
	// 'Access-Control-Expose-Headers': ['content-type', 'response-time']
	//
	cors: {
		// 'Access-Control-Allow-Origin': '*'
	},

	// Health check configuration. The path to a file which exports an express
	// middleware function used as a healthcheck. For more information on
	// express middleware functions, see:
	// https://expressjs.com/en/4x/api.html#middleware-callback-function-examples
	//
	// This healthcheck middleware is executed by invoking
	// "GET /apibuilderPing.json". By default, invoking this endpoint will
	// return {success: <bool>} where <bool> is `true` as long as the service
	// shutting down.
	//
	// healthCheckAPI: './healthcheckapi.js',

	// Flags configuration.  Enable features that are not ready for
	// production, or whose use may require manual upgrade steps in legacy
	// services.
	flags: {
		// Enable support for aliases in comparison operators on composite
		// models. Breaking change for old versions as previously queries $lt,
		// $gt, $lte, $gte, $in, $nin, $eq would not have translated aliased
		// fields.
		enableAliasesInCompositeOperators: true,

		// Enable support for the $like comparison operator in the Memory
		// connector.
		enableMemoryConnectorLike: true,

		// Enable support for Models that have no primary key. Breaking change
		// for old versions as previously the Create API returned a location
		// header. Also the model advertised unsupported methods.
		enableModelsWithNoPrimaryKey: true,

		// Generate APIs and Flows that user primary key type rather than always
		// assuming string. Breaking change for old versions as the generated
		// APIs will change when enabled.
		usePrimaryKeyType: true,

		// Enabling this flag will cause the service to exit when there is a
		// problem loading a plugin
		exitOnPluginFailure: true,

		// Enabling this flag ensures that a plugin only receives the config
		// relevant to that plugin.
		enableScopedConfig: true,

		// Enable support for null fields coming from Models
		enableNullModelFields: true,

		// Enable support for model names being percent-encoded as per RFC-3986
		// in auto-generated API. Breaking change for old versions as previously
		// names like "foo/bar" will now be encoded as "foo%2Fbar"
		enableModelNameEncoding: true,

		// Enable support for model names being percent-encoded as per RFC-3986
		// in API Builder's Swagger. Breaking change for old versions as
		// previously names like "foo/bar" will now be encoded as "foo%2Fbar"
		enableModelNameEncodingInSwagger: true,

		// Enable support for model names being encoded whilst preserving the
		// connector's slash. This flag only applies when
		// enableModelNameEncodingInSwagger is enabled. Breaking change for old
		// versions as previously model names that start with a connector name,
		// e.g. "oracle/foó" will now be encoded as "oracle/fo%C3%B3".
		enableModelNameEncodingWithConnectorSlash: true,

		// Enable support for overriding endpoint content-type using the flow's
		// HTTP response headers.
		enableOverrideEndpointContentType: true,

		// Enable support for model flow-nodes having Error outputs.
		enableModelErrorOutputs: true,

		// Enabling this flag will cause the service to exit when there is an
		// error validating the service Swagger or any loaded JSON schema.
		exitOnSwaggerSchemaValidationError: true,

		// Enabling this flag will emit the log level in each log message.
		enableLoggingOfLevel: true,

		// Enabling this flag will ignore HTTP payload body on methods GET,
		// and HEAD.
		enableStrictBodyPayloads: true
	},

	authorization: {
		callback: '/auth/callback',
		credentials: {
			central: {
				type: 'oauth2',
				flow: 'clientCredentials',
				basic_auth: true,
				token_url: process.env.TOKEN_URL || 'https://login.axway.com/auth/realms/Broker/protocol/openid-connect/token',
				client_id: process.env.CLIENT_ID,
				client_secret: process.env.CLIENT_SECRET,
				access_token: null
			}
		}
	}
};
