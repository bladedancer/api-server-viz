/**
 * Configuration used by the GreetFlow. 'saluation' is accessed via '$.helloworld.salutation'
 * similarly any APIBuilder.config parameter can be accessed.
 */
module.exports = {
	apiserver: {
		baseUrl: process.env.BASE_URL || 'https://apicentral.axway.com/apis'
	}
};
