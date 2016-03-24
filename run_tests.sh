rm -rv build
mkdir build

rm -rvf tests/js/
rm -rvf tests/css/
rm -rvf tests/img/

cp src/js/ tests/js/ -Rf
cp src/css/ tests/css/ -Rf
cp src/img/ tests/img/ -Rf
cp src/index.html tests/index.html -Rf

sed -i 's/<\/head>/<\/head> \n<link rel="stylesheet" href="http:\/\/code.jquery.com\/qunit\/qunit-1.20.0.css" type="text\/css" media="screen"> <script type="text\/javascript" src="http:\/\/code.jquery.com\/qunit\/qunit-1.20.0.js"><\/script> <script type="text\/javascript" src="qunit-reporter-junit.js"><\/script> <script type="text\/javascript" src="tests.js"><\/script> <body> <script> QUnit.jUnitReport = function(report) {console.log(report.xml) }; <\/script> <h1 id="qunit-header">QUnit Test Suite<\/h1> <h2 id="qunit-banner"><\/h2> <div id="qunit-testrunner-toolbar"><\/div> <h2 id="qunit-userAgent"><\/h2> <ol id="qunit-tests"><\/ol> <div style="display:none">/g' tests/index.html 

phantomjs tests/runner.js tests/index.html | tee build/output.xml