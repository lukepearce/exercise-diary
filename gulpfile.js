
//      ┏━━━━━━━━┓
//      ┃  T  E  ┃
//      ┃  N  4 ━┛
//      ┗━━━━━┛

var gulp = require( 'gulp' );
var fs = require( 'fs' );

var PRODUCTION_MODE = false; // Production mode minifies output files and optimises images

var PATH_TEMPLATES = {
	craft: './craft/templates/**/*.twig',
	app: './app/templates/**/*.twig'
}[fs.existsSync( './craft' ) ? 'craft' : 'app'];

var TODO_FILE = './todo.txt';

function NOOP(){
	return true;
}

function FILE_HEADER(){
	return '/*\n┏━━━━━━━━┓\n┃  T  E  ┃\n┃  N  4 ━┛\n┗━━━━━┛\nLast updated on ' + ( new Date() ).toString() + '\n*/\n\n';
}

function SRC( path ){
	return './raw' + ( path || '' );
}

function DEST( path ){
	return './public_html/assets' + ( path || '' );
}

// To install new package: 'npm install --save-dev [package name e.g. gulp-concat]'
var gulpif = require( 'gulp-if' );
var livereload = require( 'gulp-livereload' );
var header = require( 'gulp-header' );
var sass = require( 'gulp-sass' );
var autoprefix = require( 'gulp-autoprefixer' );
var csslint = require( 'gulp-csslint' );
var jshint = require( 'gulp-jshint' );
var gconcat = require( 'gulp-concat' );
var watch = require( 'gulp-watch' );

if( PRODUCTION_MODE ){
	var cssnano = require( 'gulp-cssnano' );
	var uglify = require( 'gulp-uglify' );
	var imagemin = require( 'gulp-imagemin' );
	var svgmin = require( 'gulp-svgmin' );
}
else{
	var cssnano = NOOP;
	var uglify = NOOP;
	var imagemin = NOOP;
	var svgmin = NOOP;
}

gulp.task( 'todo', function(){

	fs.readFile( TODO_FILE, function( error, buffer ){
		if( error ){
			console.log( '\nNo todo.txt file found\n' );
			return;
		}
		var todo_list = buffer.toString().trim();
		if( todo_list.length == 0 ){
			console.log( '\nNo todos\n' );
			return;
		}
		console.log( '\nTO DO:' );
		console.log( '----------\n' );
		console.log( todo_list );
		console.log( '\n----------\n' );
	} );

} );

gulp.task( 'js-lint', function(){

	gulp.src( SRC( '/js/*.js' ) )
		.pipe( jshint() )
		.pipe( jshint.reporter( 'default' ) );

} );

gulp.task( 'css-lint', ['sass'], function(){

	gulp.src( DEST( '/css/*.css' ) )
		.pipe( csslint( {
			'adjoining-classes': false,
			'unique-headings': false,
			'qualified-headings': false,
			'compatible-vendor-prefixes': false,
			'box-sizing': false,
			'bulletproof-font-face': false
		} ) )
		.pipe( csslint.reporter( 'compact' ) );

} );

gulp.task( 'sass', function(){

	gulp.src( SRC( '/sass/root.scss' ) )
		.pipe( sass() )
		.on( 'error', sass.logError )
		.pipe( gconcat( 'main.css' ) )
		.pipe( gulpif( PRODUCTION_MODE, cssnano() ) )
		.pipe( autoprefix( 'last 2 versions', '> 1%', 'Explorer 8' ) )
		.pipe( header( FILE_HEADER() ) )
		.pipe( gulp.dest( DEST( '/css' ) ) );

	gulp.src( SRC( '/sass/site/js-only.scss' ) )
		.pipe( sass() )
		.on( 'error', sass.logError )
		.pipe( gconcat( 'js-only.css' ) )
		.pipe( gulpif( PRODUCTION_MODE, cssnano() ) )
		.pipe( autoprefix( 'last 2 versions', '> 1%', 'Explorer 8' ) )
		.pipe( header( FILE_HEADER() ) )
		.pipe( gulp.dest( DEST( '/css' ) ) );

	gulp.src( SRC( '/sass/site/ie8.scss' ) )
		.pipe( sass() )
		.on( 'error', sass.logError )
		.pipe( gconcat( 'ie8.css' ) )
		.pipe( gulpif( PRODUCTION_MODE, cssnano() ) )
		.pipe( autoprefix( 'Explorer 8' ) )
		.pipe( header( FILE_HEADER() ) )
		.pipe( gulp.dest( DEST( '/css' ) ) );

} );

gulp.task( 'css', ['css-lint'] );

gulp.task( 'js', ['js-lint'], function(){

	var ordered_lib_filenames = fs.readFileSync( './raw/js/libs/_order.txt' ).toString().split( '\n' );
	var ordered_lib_paths = [];

	for( var i = 0; i < ordered_lib_filenames.length; i += 1 ){
		ordered_lib_paths.push( SRC( '/js/libs/' + ordered_lib_filenames[i] ) );
	}

	gulp.src( ordered_lib_paths )
		.pipe( gconcat( 'libs.js' ) )
		.pipe( header( FILE_HEADER() ) )
		.pipe( gulp.dest( DEST( '/js' ) ) );

	gulp.src( SRC( '/js/libs-solo/*.js' ) )
		.pipe( gulp.dest( DEST( '/js' ) ) );

	gulp.src( SRC( '/js/*.js' ) )
		.pipe( gulpif( PRODUCTION_MODE, uglify() ) )
		.pipe( gconcat( 'main.js' ) )
		.pipe( header( FILE_HEADER() ) )
		.pipe( gulp.dest( DEST( '/js' ) ) );

} );

gulp.task( 'img', function(){

	gulp.src( SRC( '/img/**/*.{jpg,jpeg,png,gif,ico}' ) )
		.pipe( gulpif( PRODUCTION_MODE, imagemin( {
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		} ) ) )
		.pipe( gulp.dest( DEST( '/img' ) ) );

	gulp.src( SRC( '/img/**/*.svg' ) )
		.pipe( gulpif( PRODUCTION_MODE, svgmin() ) )
		.pipe( gulp.dest( DEST( '/img' ) ) );

} );

gulp.task( 'fonts', function(){

	gulp.src( SRC( '/fonts/*' ) )
		.pipe( gulp.dest( DEST( '/fonts' ) ) );

} );

gulp.task( 'watch', ['full'], function(){

	livereload.listen();

	watch( SRC( '/sass/**/*.scss' ), function(){
		gulp.start( 'css' );
	} );

	watch( SRC( '/js/**/*' ), function(){
		gulp.start( 'js' );
	} );

	watch( SRC( '/img/**/*' ), function(){
		gulp.start( 'img' );
	} );

	watch( SRC( '/fonts/*' ), function(){
		gulp.start( 'fonts' );
	} );

	watch( [
		DEST( '/css/**/*' ),
		DEST( '/js/**/*' ),
		DEST( '/img/**/*' ),
		DEST( '/fonts/*' ),
		PATH_TEMPLATES
	], function( file ){
		livereload.changed( file.path );
	} );

} );

gulp.task( 'default', ['watch'] ); // Ctrl-C in terminal to exit watch mode
gulp.task( 'full', ['css','js','img','fonts','todo'] );
