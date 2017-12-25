(function () {

// Large constants with demo data which break syntax highlighting:
var BPFHIR = {}, BPunitsDAM = {}; SchemaConcert = {};
BPFHIR.schema = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
PREFIX sct: <http://snomed.info/sct/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

start = @<BPfhir>

<BPfhir> {
  a [fhir:Observation]?;
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

BPFHIR.badCode = `PREFIX fhir: <http://hl7.org/fhir-rdf/>
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
  fhir:coding [ fhir:code sct:Diastolic_Blood_Pressure999 ];
  fhir:valueQuantity [
    a fhir:Quantity;
    fhir:value "70"^^xsd:float;
    fhir:units "mmHg"
  ]
.
`;

BPunitsDAM.schema = `PREFIX  : <http://shex.io/extensions/Map/#BPunitsDAM->
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX bp: <http://shex.io/extensions/Map/#BPDAM->
PREFIX Map: <http://shex.io/extensions/Map/#>

start = @<BPunitsDAM>

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

BPunitsDAM.constants = {"http://abc.example/someConstant": "123-456"};

BPunitsDAM.simple = `<tag:b0>
  <http://shex.io/extensions/Map/#BPunitsDAM-systolic> [
  <http://shex.io/extensions/Map/#BPunitsDAM-value> "110"^^<http://www.w3.org/2001/XMLSchema#float> ;
  <http://shex.io/extensions/Map/#BPunitsDAM-units> "mmHg" ] ;
  <http://shex.io/extensions/Map/#BPunitsDAM-diastolic> [
  <http://shex.io/extensions/Map/#BPunitsDAM-value> "70"^^<http://www.w3.org/2001/XMLSchema#float> ;
  <http://shex.io/extensions/Map/#BPunitsDAM-units> "mmHg" ].
`;

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

  return [
    { "name": "BP",
      schema: BPFHIR.schema,
      passes: [
        { "name": "simple",
          data: BPFHIR.simple,
          queryMap: "<tag:BPfhir123>@START",
          outputSchema: BPunitsDAM.schema,
          outputShape: "START",
          staticVars: BPunitsDAM.constants,
          createRoot: "<tag:b0>"}
      ],
      fails: [
        { "name": "bad code",
          data: BPFHIR.badCode,
          queryMap: "<tag:BPfhir123>@START",
          outputSchema: BPunitsDAM.schema,
          outputShape: "START",
          staticVars: BPunitsDAM.constants,
          createRoot: "<tag:b0>"}
      ]
    },
    { "name": "BP back",
      schema: BPunitsDAM.schema,
      passes: [
        { "name": "simple",
          data: BPunitsDAM.simple,
          queryMap: "<tag:b0>@START",
          outputSchema: BPFHIR.schema,
          outputShape: "START",
          staticVars: BPFHIR.constants,
          createRoot: "<tag:BPfhir123>"}
      ],
      fails: [
        // "bad code": {
        //   data: BPunitsDAM.simple,
        //   queryMap: "<tag:b0>@START",
        //   outputSchema: BPFHIR.schema,
        //   outputShape: "START",
        //   staticVars: BPFHIR.constants,
        //   createRoot: "tag:BPfhir123"}
      ],
    },
    { "name": "symmetric",
      schema: SchemaConcert.schema,
      passes: [
        { "name": "BBKing",
          data: SchemaConcert.BBKing,
          queryMap: "_:b0@START",
          outputSchema: SchemaConcert.schema,
          outputShape: "START",
          staticVars: {},
          createRoot: "_:root"}
      ],
      fails: [
        { "name": "Non-IRI",
          data: SchemaConcert.nonIRI,
          queryMap: "_:b0@START",
          outputSchema: SchemaConcert.schema,
          outputShape: "START",
          staticVars: {},
          createRoot: "_:root"}
      ]
    }
  ];
})();
