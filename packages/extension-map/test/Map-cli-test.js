// Test extension-map command line scripts.

"use strict";
const TEST_cli = "TEST_cli" in process.env ? JSON.parse(process.env["TEST_cli"]) : false;
const TIME = "TIME" in process.env;

const TestUtils = require("@shexjs/util/tools/common-test-infrastructure.js");

const AllTests = {
  "materialize": [
    { name: "help", args: ["--help"], errorMatch: "Examples", status: 1 },
    { name: "garbage", args: ["--garbage"], errorMatch: "(Invalid|Unknown) option", status: 1 },
    { name: "no-target-file-specified", args: ["--jsonvars vars.json"], errorMatch: "No ShEx target schema file specified.", status: 1 },
    { name: "no-target-file", args: ["--target", "cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    { name: "no-jsonvars-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "cli/1dotOr2dot.json999"], errorMatch: "ENOENT", status: 1 },
    // The ThreadedMaterializer (see ../doc/threaded-materializer.md) treats
    // --jsonvars as always-available globals; PARAM-status et al. now survive
    // into the output where the shared-binder materializer dropped them.
    { name: "target-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "Map/vpr-FHIR/vars.json" ], stdin: "Map/vpr-FHIR/vprPatient-vprSchema.val", resultMatch: "PARAM-status[\\s\\S]*Syncope", status: 0 },
    { name: "target-file", args: ["--target", "Map/vpr-FHIR/FHIRConditionCompact.shex", "--jsonvars", "Map/vpr-FHIR/vars.json", "--root", "http://hl7.org/fhir/shape/Problem"], stdin: "Map/vpr-FHIR/vprPatient-vprSchema.val", resultMatch: "Problem", status: 0 },
    // validate --extension | materialize round trip over the BPDAMFHIR pair
    // (BPFHIR-validation.val is `validate -x Map/BPDAMFHIR/BPFHIR.shex -d
    // Map/BPDAMFHIR/BPFHIR.ttl -n tag:BPfhir123 --extension
    // ../shex-extension-map.js` with the checkout path neutralized)
    { name: "bp-pipeline", args: ["--target", "Map/BPDAMFHIR/BPunitsDAM.shex", "--root", "tag:b0"], stdin: "Map/BPDAMFHIR/BPFHIR-validation.val", resultMatch: "systolic>[\\s\\S]*\"110\"[\\s\\S]*diastolic>[\\s\\S]*\"70\"", status: 0 }
  ],
  "shexmap-debug": [
    // stdin is the command channel: set a predicate breakpoint, continue to
    // it, continue to completion
    { name: "debug-bindings", args: ["--target", "../examples/BPdam-schema.shex", "--bindings", "../examples/BP-simple-bindings.json", "-r", "tag:b0"], stdin: "Map/debug-commands.txt", resultMatch: "breakpoint on predicate :systolic[\\s\\S]*at :systolic[\\s\\S]*accepted: 7 quads", status: 0 }
  ]
};

if (!TEST_cli) {
  console.warn("Skipping cli-tests; to activate these tests, set environment variable TEST_cli=true");
} else {
  TestUtils.runCliTests(AllTests, __dirname, TIME);
}
