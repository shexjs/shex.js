// roundtrip-translation.js

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

var exec = require('child_process').exec;
var fs = require('fs');

var frameFile = __dirname + '/Map/CMUMPS-FHIR/cmumps-patient7.frame';
var jsonldFile = __dirname + '/Map/CMUMPS-FHIR/cmumps-patient7.jsonld';
var jsonVarsFile = __dirname + '/Map/CMUMPS-FHIR/cmumps2fhir-vars.json';
var sourceFile = __dirname + '/Map/CMUMPS-FHIR/cmumps-patient7.shex';

var targetShExFile = __dirname + '/Map/CMUMPS-FHIR/cmumps2fhir-demographics.shex';
var backTargetShExFile = __dirname + '/Map/CMUMPS-FHIR/back-cmumps2fhir-demographics.shex';

var outputDir = process.cwd()+"/output";
var scriptPath = __dirname + '/../bin/roundtrip-translation.sh';

describe("roundtrip-translation", function() {

    it("should exist as a file", function() {
      fs.existsSync(scriptPath).should.be.true;
    });

    it("should be executable", function() {
      var mode = fs.statSync(scriptPath).mode;

      var owner = mode >> 6;
      var group = (mode << 3) >> 6;
      var others = (mode << 6) >> 6;

      var permissions = { 
        read: {
          owner: !!(owner & 4),
          group: !!(group & 4),
          others: !!(others & 4)
        },
        execute: {
          owner: !!(owner & 1),
          group: !!(group & 1),
          others: !!(others & 1)
        }
      };

      permissions.read.owner.should.be.true;
      permissions.read.group.should.be.true;
      permissions.read.others.should.be.true;

      permissions.execute.owner.should.be.true;
      permissions.execute.group.should.be.true;
      permissions.execute.others.should.be.true;
    });

    it("should print usage if given no command line arguments", function(done) {
      exec(scriptPath, function (error, stdout, stderr) {
        stderr.should.contain("expected a JSON-LD data file!");
        verifyUsage(error, stdout);
        done();
      });
    });

    it("should print an error if given garbage arguments", function(done) {
      exec(scriptPath + " --garbage", function (error, stdout, stderr) {
        stderr.should.contain("Invalid option: \"--garbage\"");
        verifyUsage(error, stdout);
        done();
      });
    });


    describe("#Help option", function() {

      var verifyHelp = function(error, stdout, stderr) { 
        expect(error).to.be.null;
        stdout.should.contain("NAME");
        stdout.should.contain("SYNOPSIS");
        stdout.should.contain("DESCRIPTION");
        stdout.should.contain("EXAMPLE");
        stderr.should.be.empty; 
    };

    it("--help should print help", function(done) {
      exec(scriptPath + " --help", function (error, stdout, stderr) {
        verifyHelp(error, stdout, stderr);
        done();
      });
    });

    it("-h should print help", function(done) {
      exec(scriptPath + " -h", function (error, stdout, stderr) {
        verifyHelp(error, stdout, stderr);
        done();
      });
    });
  });


  describe("#JSON-LD data file option", function() {

    it("--data should return an error if given no argument", function(done) {
      exec(scriptPath + " --data", function (error, stdout, stderr) {
        stderr.should.contain("expected a JSON-LD data file");
        verifyUsage(error, stdout);
        done();
      });
    });

    it("-d should return an error if given non-existent file", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".jsonld"
      exec(scriptPath + " -d " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File " + file + " does not exist!");
        done();
      });
    });

    it("-d should return an error if file does not have a jsonld extension", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".txt"
      fs.writeFileSync(file, 'aloha');
      exec(scriptPath + " -d " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain(file + " does not have the expected filename extension - expected jsonld!");
        fs.unlinkSync(file);
        done();
      });
    });

    it("--data should return an error if file is not readable", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".jsonld"
      fs.writeFileSync(file, '{}', {mode: 0});
      exec(scriptPath + " --data " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File " + file + " is not readable!");
        fs.unlinkSync(file);
        done();
      });
    });
  });


  describe("#ShEx target translation schema file option", function() {

    it("--target should return an error if given no argument", function(done) {
      exec(scriptPath + " -d " + jsonldFile + " --target", function (error, stdout, stderr) {
        stderr.should.contain("expected a ShEx translation file");
        verifyUsage(error, stdout);
        done();
      });
    });

    it("-t should return an error if given non-existent file", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".shex"
      exec(scriptPath + " -d " + jsonldFile + " -t " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File " + file + " does not exist!");
        done();
      });
    });

    it("-t should return an error if target ShEx translation file does not have a shex extension", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".txt"
      fs.writeFileSync(file, 'aloha');
      exec(scriptPath + " -d " + jsonldFile + " -t " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain(file + " does not have the expected filename extension - expected shex!");
        fs.unlinkSync(file);
        done();
      });
    });

    it("--target should return an error if target ShEx translation file is not readable", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".shex"
      fs.writeFileSync(file, '{}', {mode: 0});
      exec(scriptPath + " -d " + jsonldFile + " --target " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File " + file + " is not readable!");
        fs.unlinkSync(file);
        done();
      });
    }); 

    it("-d <jsonld file> and -t <shex translation file> should do round trip translation", function(done) {
      this.timeout(4000);

      var command = scriptPath + " -d " + jsonldFile + " -t " + targetShExFile;
      exec(command, function (error, stdout, stderr) {

        // Verify forward translation files are there
        verifyValFile(outputDir + '/cmumps-patient7.val');
        verifyTtlFile(outputDir + '/cmumps2fhir-demographics.ttl');

        // Verify back translation files are there
        verifyValFile(outputDir + '/back-cmumps-patient7.val');
        verifyTtlFile(outputDir + '/back-cmumps2fhir-demographics.ttl');

        verifyJsonFile(outputDir + '/back-cmumps-patient7.json');
        fs.existsSync(outputDir + '/diff.out').should.be.true;

        done();
      });
    });

  });


  describe("#ShEx back target translation schema file option", function() {

    it("--backtarget should return an error if given no argument", function(done) {
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --backtarget " , function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("--backtarget specified with no back target translation file!");
        verifyUsage(error, stdout);
        done();
      });
    });

    it("-b should return an error if given a non-existent file", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".shex"
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -b " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File "+file+" does not exist!");
        done();
      });
    });

    it("-b should return an error if given a file without a .shex extension", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".txt"
      fs.writeFileSync(file, '{}');
      
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -b " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain(file + " does not have the expected filename extension - expected shex!");
        fs.unlinkSync(file);
        done();
      });
    });

    it("-b should use specified file for back translation", function(done) {
      this.timeout(4000);
      var testFile = "/tmp/back-target.shex"
      var string = fs.readFileSync(targetShExFile); 
      fs.writeFileSync(testFile, string);
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -b " + testFile, function (error, stdout, stderr) {
        stdout.should.contain(testFile);
        fs.unlinkSync(testFile);
        done();
      });
    });

  });


  describe("#JSON variables file option", function() {

    it("--jsonvars should return an error if given no argument", function(done) {
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --jsonvars " , function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("--jsonvars specified with no JSON variables file!");
        verifyUsage(error, stdout);
        done();
      });
    });

    it("-j should return an error if given a non-existent file", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".json"
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -j " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File "+file+" does not exist!");
        done();
      });
    });

    it("-j JSON variables file should provide variables for translation", function(done) {
      this.timeout(4000);
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -j " + jsonVarsFile, function (error, stdout, stderr) {
        stdout.should.contain(jsonVarsFile);
        done();
      });
    });
  });


  describe("#Output directory option", function() {

    it("--output should return an error if given no argument", function(done) {
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --output " , function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("--output specified with no output directory!");
        verifyUsage(error, stdout);
        done();
      });
    });

    it("-o outputDir should give an error if path is to an existing file", function(done) {
      var testFile = "/tmp/outdir" + Math.random();
      fs.writeFileSync(testFile, '{}');

      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -o " + testFile, 
        function (error, stdout, stderr) {
          error.code.should.equal(1);
          stderr.should.contain("Output directory " + testFile + " already exists as a file!");
          fs.unlinkSync(testFile);
          done();
      });
    });

    it("--output should create a directory if it does not exist", function(done) {
      this.timeout(4000);

      var testDir = "/tmp/outdir" + Math.random();
      if (fs.existsSync(testDir)) { 
        unlinkDirSync(testDir);
      }

      fs.existsSync(testDir).should.be.false;
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --output " + testDir, 
        function (error, stdout, stderr) {
          fs.existsSync(testDir).should.be.true;
          unlinkDir(testDir);
          done();
      });

    });

  });

  describe("#RDF root option", function() {

    it("--root should print an error if given no root", function(done) {
      this.timeout(4000);
      var command = scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --root";
      exec(command, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("--root specified with no RDF root; defaulting to ");
        done();
      });

    });

    it("-r RDF root should set the specified root", function(done) {
      this.timeout(4000);
      var rdfRoot = "http://hokukahu.com/Patient-3";
      var command = scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + 
                    " -r " + rdfRoot + " -o " + outputDir;
      exec(command, function (error, stdout, stderr) {
        var ttlFile = outputDir + '/cmumps2fhir-demographics.ttl';
        var string = fs.readFileSync(ttlFile,'UTF-8');
        string.should.contain(rdfRoot);
        done();
      });
    });

  });


  describe("#Source ShEx schema file option", function() {

    it("--source should print a warning if given no argument", function(done) {
      this.timeout(4000);

      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --source " , function (error, stdout, stderr) {
        stderr.should.contain("No source ShEx schema file specified.  Defaulting to");
        done();
      });
    });

    it("-s should return an error if given a non-existent file", function(done) {
      var file = "/tmp/foobar" + Math.random() + ".shex"
      exec(scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -s " + file, function (error, stdout, stderr) {
        error.code.should.equal(1);
        stderr.should.contain("File "+file+" does not exist!");
        done();
      });
    });


  });


  describe("#Verbose option", function() {

    it("--verbose should the output file generation warnings", function(done) {
      this.timeout(4000);

      var command = scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " --verbose";
      exec(command, function (error, stdout, stderr) {
        stderr.should.contain("does not exist - generating it from");
        unlinkDir(outputDir);
        done();
      });

    });

    it("-v RDF root should output warnings when rebuilding output directory", function(done) {
      this.timeout(4000);

      // Make the output directory so we can test deleting and recreating it
      fs.mkdirSync(outputDir);

      var command = scriptPath + " -d " + jsonldFile + " -t " + targetShExFile + " -v";
      exec(command, function (error, stdout, stderr) {

        stderr.should.contain("WARNING: ./output exists - removing it and creating a fresh ./output directory");
        unlinkDir(outputDir);
        done();
      });
    });

  });

  describe("#Verify round trip", function() {

    it("should do round trip translation with json vars, root, and frame", function(done) {
      this.timeout(4000);
      var rdfRoot = "http://hokukahu.com/patient-1";
      var command = scriptPath + " --data " + jsonldFile + " --target " + targetShExFile +  
                    " --jsonvars " + jsonVarsFile + " --frame " + frameFile + 
                    " --root " + rdfRoot + " --output " + outputDir;
      exec(command, function (error, stdout, stderr) {

        // Verify forward translation files are there
        verifyValFile(outputDir + '/cmumps-patient7.val');
        verifyTtlFile(outputDir + '/cmumps2fhir-demographics.ttl');

        // Verify back translation files are there
        verifyValFile(outputDir + '/back-cmumps-patient7.val');
        verifyTtlFile(outputDir + '/back-cmumps2fhir-demographics.ttl');

        verifyJsonldFile(outputDir + '/back-cmumps-patient7.jsonld');
        fs.existsSync(outputDir + '/diff.out').should.be.true;

        done();
      });
    });
  });

});

function unlinkDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach(function(file, index) {
      var filePath = dirPath + "/" + file;
      if (fs.lstatSync(filePath).isDirectory()) { 
        unlinkDir(filePath);
      } else { 
        fs.unlinkSync(filePath);
      }
    });

    fs.rmdirSync(dirPath);
  }
}

function verifyJsonFile(filePath) {
  fs.existsSync(filePath).should.be.true;
  fs.statSync(filePath).size.should.not.equal(0);
  var string = fs.readFileSync(filePath,'UTF-8');
  string.should.contain('"@id":"http://hokukahu.com/patient-1');
  string.should.contain("BUNNY,BUGS");
}

function verifyJsonldFile(filePath) {
  fs.existsSync(filePath).should.be.true;
  fs.statSync(filePath).size.should.not.equal(0);
  var string = fs.readFileSync(filePath,'UTF-8');
  string.should.contain('"@context"');
  string.should.contain('"@graph"');
  string.should.contain("BUNNY,BUGS");
}

function verifyTtlFile(filePath) {
  fs.existsSync(filePath).should.be.true;
  fs.statSync(filePath).size.should.not.equal(0);
  var string = fs.readFileSync(filePath,'UTF-8');
  string.should.contain("http://hokukahu.com/patient-1");
  string.should.contain("BUNNY,BUGS");
}

function verifyValFile(filePath) {
  fs.existsSync(filePath).should.be.true;
  fs.statSync(filePath).size.should.not.equal(0);
  /ERROR|FAILURE/.test(fs.readFileSync(filePath,'UTF-8').toUpperCase()).should.not.be.true;
}

function verifyUsage(error, stdout) {
  error.code.should.equal(1);
  stdout.should.contain("usage: roundtrip-translation.sh -h | --help");
  stdout.should.contain("-d | --data <JSON-LD data file>");
  stdout.should.contain("-t | --target <ShEx target translation schema file>");
  stdout.should.contain("[-b | --backtarget <ShEx back target translation schema file>]");
  stdout.should.contain("[-f | --frame <JSON-LD frame file>]");
  stdout.should.contain("[-j | --jsonvars <ShEx JSON variables file>]");
  stdout.should.contain("[-o | --output <output directory>]");
  stdout.should.contain("[-r | --root <RDF root>]");
  stdout.should.contain("[-v | --verbose]");
}; 

