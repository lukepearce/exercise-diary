<?php

foreach (require('../.env.php') as $key => $value) {
	$_ENV[$key] = $value;
}

require '../app/app.php';
