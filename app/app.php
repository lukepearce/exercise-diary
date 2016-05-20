<?php

require_once 'vendor/autoload.php';

/*
* Prepare application
*/

$c = new \Slim\Container(array(
	'settings' => [
		'displayErrorDetails' => $_ENV['DEV_MODE'],
	],
));
$app = new \Slim\App($c);
$mw = new Middleware\Basic();

/*
* Prepare view
*/

$c['view'] = function ($c) {
	$view = new \Slim\Views\Twig($_ENV['TEMPLATE_DIR'], [
		'debug' => $_ENV['DEV_MODE'],
		'cache' => $_ENV['CACHE_DIR'] . 'tmpl/',
		'auto_reload' => TRUE,
		'strict_variables' => TRUE,
	]);
	//$view->addExtension(new \Slim\Views\TwigExtension($c['router'], $c['request']->getUri()));
	return $view;
};

$c['errorHandler'] = function ($c) {
	return function ($request, $response, $exception) use ($c) {
		return $c['view']->render($response, '_errors/50x.twig')->withStatus(500);
	};
};

$c['notFoundHandler'] = function ($c) {
	return function ($request, $response) use ($c) {
		return $c['view']->render($response, '_errors/404.twig')->withStatus(404);
	};
};

/*
* Routes
*/

$app->get('/', function ($request, $response) {
	return $this->view->render($response, 'index.twig', [
		'foo' => 'bar'
	]);
});

$app->get('/about', function ($request, $response) {
	return $this->view->render($response, 'about.twig', [
		'foo' => 'bar'
	]);
});
//->add($mw->blockRobots()); // Block robots on this route only.
//->add($mw->requireAuth()); // Require authentication on this route only.

$app->add($mw->addGlobals()); // Add globals to all routes.

$app->run();
