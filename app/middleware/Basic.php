<?php

namespace Middleware;

class Basic {

	public function addGlobals() {
		return function($request, $response, $next) {
			$uri = $request->getUri();
			$this->view['siteName'] = $_ENV['SITE_NAME'];
			$this->view['siteUrl'] = $_ENV['SITE_URL'];
			$this->view['assetsUrl'] = $_ENV['SITE_URL'].$_ENV['ASSETS_PATH'];
			$this->view['currentUrl'] = ((string) $uri);
			$this->view['segments'] = explode('/', $uri->getPath());
			return $next($request, $response);
		};
	}

	/*public function blockRobots() {
		return function($request, $response, $next) {
			$response = $response->withHeader('X-Robots-Tag', 'noindex, nofollow');
			return $next($request, $response);
		};
	}*/

	/*public function requireAuth() {
		// Requires tuupola/slim-basic-auth
		return (new \Slim\Middleware\HttpBasicAuthentication([
			'secure' => false,
			'users' => $_ENV['ADMIN_CREDENTIALS']
		]));
	}*/

}
