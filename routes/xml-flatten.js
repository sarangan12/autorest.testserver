var express = require('express');
var router = express.Router();
var xml2js = require('xml2js');
var util = require('util');
var parseXMLString = util.promisify(xml2js.parseString);

var expectXmlBody = function (req, res, body) {
  var rawBody = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) { rawBody += chunk });
  req.on('end', async function() {
    var actualParsedBody = await parseXMLString(rawBody);
    var expectedParsedBody = await parseXMLString(body);

    try {
      assert.deepStrictEqual(actualParsedBody, expectedParsedBody);
      res.status(201).end();
    } catch (err) {
      res.status(400).header('Content-Type', 'text/plain').end(`
      Expected (parsed form):
      ${JSON.stringify(err.expected, null, 2)}

      Actual (parsed form):
      ${JSON.stringify(err.actual, null, 2)}

      Expected (raw form):
      ${body}

      Actual (raw form):
      ${rawBody}
      `);
    }
  });
};

var sendXmlBody = function (res, body) {
  res.status(200).header('Content-Type', 'application/xml').end(body);
};

var xmlService = function () {
  const zooBody =
`<?xml version="1.0" encoding="utf-8"?>
<zoo>
  <birdcage>
    <parrot>Jeff</parrot>
  </birdcage>
  <giraffePen>
    <giraffes>
      <giraffe>Henry</giraffe>
      <giraffe>Clive</giraffe>
      <giraffe>Sarah</giraffe>
    </giraffes>
  </giraffePen>
  <octopusTank>
    <octopus>Teddy</octopus>
    <octopus>Frankie</octopus>
  </octopusTank>
  <office>
    <zookeeper>Daniel</zookeeper>
  </office>
</zoo>
`

  router.get('/zoo', function (req, res, next) {
    sendXmlBody(res, zooBody);
  });
};

xmlService.prototype.router = router;

module.exports = xmlService;
