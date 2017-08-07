// Large constants with demo data which break syntax highlighting:
var BPFHIR = {}, BPunitsDAM = {}; SchemaConcert = {}, BPunitsNested = {}, BPFHIRNested = {};
BPFHIR.schemaPrefixes = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

`;

BPFHIR.BPschema = `

<collector> {
  fhir:item @<BPfhir>*
}

<BPfhir> {
  a [fhir:Observation]?;
  # fhir:subject @<Patient>;
  fhir:coding { fhir:code [sct:Blood_Pressure] };
  fhir:related { fhir:type ["has-component"]; fhir:target @<sysBP> };
  fhir:related { fhir:type ["has-component"]; fhir:target @<diaBP> }
}
<sysBP> {
  a [fhir:Observation]?;
  fhir:coding { fhir:code [sct:Systolic_Blood_Pressure] };
  fhir:valueQuantity {
    a [fhir:Quantity]?;
    fhir:value xsd:float %Map:{ bp:sysVal %};
    fhir:units xsd:string %Map:{ bp:sysUnits %}
  }
}
<diaBP> {
  a [fhir:Observation]?;
  fhir:coding { fhir:code [sct:Diastolic_Blood_Pressure] };
  fhir:valueQuantity {
    a [fhir:Quantity]?;
    fhir:value xsd:float %Map:{ bp:diaVal %};
    fhir:units xsd:string %Map:{ bp:diaUnits %}
  }
}
`;

BPFHIR.PatientSchema = `

<Patient> {
  fhir:Patient.name LITERAL %Map:{ bp:name %};
}`;

BPFHIR.schema = BPFHIR.schemaPrefixes + "start = @<BPfhir>" + BPFHIR.BPschema;

BPFHIR.schema_Patient = BPFHIR.schemaPrefixes + "start = @<collector>" + BPFHIR.PatientSchema + BPFHIR.BPschema;

BPFHIR.constants = {"http://abc.example/anotherConstant": "abc-def"};

BPFHIR.simple = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<tag:BPfhir123>
  a fhir:Observation;
  fhir:coding [ fhir:code sct:Blood_Pressure ];
  fhir:related [ fhir:type "has-component"; fhir:target _:sysBP123 ];
  fhir:related [ fhir:type "has-component"; fhir:target _:diaBP123 ]
.
_:sysBP123
  a fhir:Observation;
  fhir:coding [ fhir:code sct:Systolic_Blood_Pressure ];
  fhir:valueQuantity [
    a fhir:Quantity;
    fhir:value "110"^^xsd:float;
    fhir:units "mmHg"
  ]
.
_:diaBP123
  a fhir:Observation;
  fhir:coding [ fhir:code sct:Diastolic_Blood_Pressure ];
  fhir:valueQuantity [
    a fhir:Quantity;
    fhir:value "70"^^xsd:float;
    fhir:units "mmHg"
  ]
.
`;

BPFHIR.badCode = BPFHIR.simple.replace(/sct:Diastolic_Blood_Pressure/, "sct:Diastolic_Blood_Pressure999");

BPunitsDAM.schemaPrefixes = `PREFIX  : <http://dam.example/med#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

`;
BPunitsDAM.BPschema = `

<BPunitsDAM> {
  :systolic {
    :value xsd:float %Map:{ bp:sysVal %};
    :units xsd:string %Map:{ bp:sysUnits %}
  };
  :diastolic {
    :value xsd:float %Map:{ bp:diaVal %};
    :units xsd:string %Map:{ bp:diaUnits %}
  };
  :someConstProp xsd:string? %Map:{ <http://abc.example/someConstant> %}
}
`;
BPunitsDAM.schema = BPunitsDAM.schemaPrefixes + "start = @<BPunitsDAM>" + BPunitsDAM.BPschema;

BPunitsDAM.PatientSchema = `

<PatientDAM> {
  :name LITERAL %Map:{ bp:name %};
  :vitals @<BPunitsDAM>* %Map:{ bp:XXX %}
}`;

BPunitsDAM.schema_Patient = BPunitsDAM.schemaPrefixes + "start = @<PatientDAM>" + BPunitsDAM.PatientSchema + BPunitsDAM.BPschema;

BPunitsDAM.constants = {"http://abc.example/someConstant": "\"123-456\""};

BPunitsDAM.simplePrefixes = `PREFIX med: <http://dam.example/med#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

`;
BPunitsDAM.simpleBP0 = `<tag:b0>
    med:systolic [
      med:value "110"^^xsd:float ;
      med:units "mmHg"
    ] ;
    med:diastolic [
      med:value "70"^^xsd:float ;
      med:units "mmHg"
    ] .
`;
BPunitsDAM.simpleBP1 = BPunitsDAM.simpleBP0.replace(/0/g, "1");

BPunitsDAM.simple = BPunitsDAM.simplePrefixes + BPunitsDAM.simpleBP0;

BPunitsDAM.patient = `<PatientX>
    med:name "Sue" ;
    med:vitals <tag:b0>, <tag:b1> .

`;

BPunitsDAM.simplePatient = BPunitsDAM.simplePrefixes + BPunitsDAM.patient + BPunitsDAM.simpleBP0 + BPunitsDAM.simpleBP1;

BPunitsDAM.badBP = BPunitsDAM.simple.replace(/BPunitsDAM-systolic/, "BPunitsDAM-systolic999");

BPunitsDAM.badPatient = BPunitsDAM.simplePatient.replace(/BPunitsDAM-systolic/, "BPunitsDAM-systolic999");

SchemaConcert.schema = `PREFIX    : <http://a.example/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX Map: <http://shex.io/extensions/Map/#>

start=@<Concert>

<Concert> {
  schema:bandName xsd:string %Map:{ :Name %} ;
  schema:tix IRI %Map:{ :TicketUrl %} ;
  schema:venue @<Venue>
}
<Venue> {
  schema:location xsd:string %Map:{ :LocationName %} ;
  schema:address  xsd:string %Map:{ :LocationAddress %}
}
`;

SchemaConcert.BBKing = `PREFIX schema: <http://schema.org/>

[] schema:bandName "B.B. King";
  schema:tix <https://www.etix.com/ticket/1771656>;
  schema:venue [
    schema:location "Lupo’s Heartbreak Hotel";
    schema:address "79 Washington St...."
  ] .
`

SchemaConcert.nonIRI = `PREFIX schema: <http://schema.org/>

[] schema:bandName "B.B. King";
  schema:tix "https://www.etix.com/ticket/1771656";
  schema:venue [
    schema:location "Lupo’s Heartbreak Hotel";
    schema:address "79 Washington St...."
  ] .
`

BPunitsNested.schema = `PREFIX  : <http://dam.example/med#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

start = @<PatientDAM>

<PatientDAM> {
  :name LITERAL %Map:{ bp:name %};
  :reports @<ReportsDAM>* %Map:{ bp:reports %}
}

<ReportsDAM> {
  :reportNo LITERAL %Map:{ bp:reportNo %};
  :results @<BPunitsDAM>* %Map:{ bp:bp %}
}

<BPunitsDAM> {
  :systolic {
    :value xsd:float %Map:{ bp:sysVal %};
    :units xsd:string %Map:{ bp:sysUnits %}
  };
  :diastolic {
    :value xsd:float %Map:{ bp:diaVal %};
    :units xsd:string %Map:{ bp:diaUnits %}
  };
  :someConstProp xsd:string? %Map:{ <http://abc.example/someConstant> %}
}
`;

BPunitsNested.simple = `PREFIX med: <http://dam.example/med#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<PatientX>
    med:name "Sue" ;
    med:reports <Report1>, <Report2> .

<Report1>
    med:reportNo "two" ;
    med:results <Res00>, <Res01> .

<Res00>
    med:systolic [
      med:value "100"^^xsd:float ;
      med:units "mmHg"
    ] ;
    med:diastolic [
      med:value "60"^^xsd:float ;
      med:units "mmHg"
    ] .
<Res01>
    med:systolic [
      med:value "101"^^xsd:float ;
      med:units "mmHg"
    ] ;
    med:diastolic [
      med:value "61"^^xsd:float ;
      med:units "mmHg"
    ] .

<Report2>
    med:reportNo "two" ;
    med:results <Res10>, <Res11> .

<Res10>
    med:systolic [
      med:value "110"^^xsd:float ;
      med:units "mmHg"
    ] ;
    med:diastolic [
      med:value "70"^^xsd:float ;
      med:units "mmHg"
    ] .
<Res11>
    med:systolic [
      med:value "111"^^xsd:float ;
      med:units "mmHg"
    ] ;
    med:diastolic [
      med:value "71"^^xsd:float ;
      med:units "mmHg"
    ] .
`;

BPFHIRNested.schema = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

start = @<collector>

<Patient> {
  fhir:Patient.name LITERAL %Map:{ bp:name %};
}

<collector> {
  fhir:item @<BPreport>*
}

<BPreport> {
  a [fhir:DiagnosticReport]?;
  fhir:status ["final"];
  fhir:subject @<Patient>;
  fhir:coding { fhir:code [sct:Blood_Pressure] };
  fhir:related { fhir:type ["has-component"]; fhir:target @<sysBP> };
  fhir:related { fhir:type ["has-component"]; fhir:target @<diaBP> }
}
<BPfhir> {
  a [fhir:Observation]?;
  fhir:subject @<Patient>;
  fhir:coding { fhir:code [sct:Blood_Pressure] };
  fhir:related { fhir:type ["has-component"]; fhir:target @<sysBP> };
  fhir:related { fhir:type ["has-component"]; fhir:target @<diaBP> }
}
<sysBP> {
  a [fhir:Observation]?;
  fhir:coding { fhir:code [sct:Systolic_Blood_Pressure] };
  fhir:valueQuantity {
    a [fhir:Quantity]?;
    fhir:value xsd:float %Map:{ bp:sysVal %};
    fhir:units xsd:string %Map:{ bp:sysUnits %}
  }
}
<diaBP> {
  a [fhir:Observation]?;
  fhir:coding { fhir:code [sct:Diastolic_Blood_Pressure] };
  fhir:valueQuantity {
    a [fhir:Quantity]?;
    fhir:value xsd:float %Map:{ bp:diaVal %};
    fhir:units xsd:string %Map:{ bp:diaUnits %}
  }
}
`;


  var Demos = {
    "BP": {
      schema: BPFHIR.schema,
      passes: {
        "simple": {
          data: BPFHIR.simple,
          queryMap: "<tag:BPfhir123>@- start -",
          outputSchema: BPunitsDAM.schema,
          outputShape: "- start -",
          staticVars: BPunitsDAM.constants,
          createRoot: "<tag:b0>"}
      },
      fails: {
        "bad code": {
          data: BPFHIR.badCode,
          queryMap: "<tag:BPfhir123>@- start -",
          outputSchema: BPunitsDAM.schema,
          outputShape: "- start -",
          staticVars: BPunitsDAM.constants,
          createRoot: "<tag:b0>"}
      }
    },
    "BP-back": {
      schema: BPunitsDAM.schema,
      passes: {
        "simple": {
          data: BPunitsDAM.simple,
          queryMap: "<tag:b0>@- start -",
          outputSchema: BPFHIR.schema,
          outputShape: "- start -",
          staticVars: BPFHIR.constants,
          createRoot: "<tag:BPfhir123>"}
      },
      fails: {
        "bad code": {
          data: BPunitsDAM.badBP,
          queryMap: "<tag:b0>@- start -",
          outputSchema: BPFHIR.schema,
          outputShape: "- start -",
          staticVars: BPFHIR.constants,
          createRoot: "<tag:BPfhir123>"}
      },
    },
    "BPPatient multi-bindings": {
      schema: BPunitsDAM.schema_Patient,
      passes: {
        "simple": {
          data: BPunitsDAM.simplePatient,
          queryMap: "<http://a.example/PatientX>@- start -",
          outputSchema: BPFHIR.schema_Patient,
          outputShape: "- start -",
          staticVars: BPFHIR.constants,
          createRoot: "<tag:BPfhir123>"}
      },
      fails: {
        "bad code": {
          data: BPunitsDAM.badPatient,
          queryMap: "<http://a.example/PatientX>@- start -",
          outputSchema: BPFHIR.schema_Patient,
          outputShape: "- start -",
          staticVars: BPFHIR.constants,
          createRoot: "<tag:BPfhir123>"}
      }
    },
    "BPPatient 2 levels": {
      schema: BPunitsNested.schema,
      passes: {
        "simple": {
          data: BPunitsNested.simple,
          queryMap: "<http://a.example/PatientX>@- start -",
          outputSchema: BPFHIRNested.schema,
          outputShape: "- start -",
          staticVars: {},
          createRoot: "<tag:BPfhir123>"}
      },
      fails: { }
    },
    "symmetric": {
      schema: SchemaConcert.schema,
      passes: {
        "BBKing": {
          data: SchemaConcert.BBKing,
          queryMap: "_:b0@- start -",
          outputSchema: SchemaConcert.schema,
          outputShape: "- start -",
          staticVars: {},
          createRoot: "_:root"}
      },
      fails: {
        "Non-IRI": {
          data: SchemaConcert.nonIRI,
          queryMap: "_:b0@- start -",
          outputSchema: SchemaConcert.schema,
          outputShape: "- start -",
          staticVars: {},
          createRoot: "_:root"}
      }
    }
  };
