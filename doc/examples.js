Demos = (() => {
var clinicalObs = {};
var wikidataItem = {};

clinicalObs.schema = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

start = @<ObservationShape>

<ObservationShape> {               # An Observation has:
  :status ["preliminary" "final"]; #   status in this value set
  :subject @<PatientShape>         #   a subject matching <PatientShape>.
}

<PatientShape> {                   # A Patient has:
 :name xsd:string*;                #   one or more names
 :birthdate xsd:date?              #   and an optional birthdate.
}
`;
clinicalObs.with_birthdate = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .`;
clinicalObs.no_subject_name = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :birthdate "1999-12-31"^^xsd:date .`;
clinicalObs.without_birthdate = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "preliminary" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" .`;
clinicalObs.bad_status = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "finally" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .

`;
clinicalObs.no_subject = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31"^^xsd:date .

`;
clinicalObs.birthdate_datatype = `PREFIX : <http://hl7.org/fhir/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

<Obs1>
  :status    "final" ;
  :subject   <Patient2> .

<Patient2>
  :name "Bob" ;
  :birthdate "1999-12-31T01:23:45"^^xsd:dateTime .`;

wikidataItem.schema = `PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX pr: <http://www.wikidata.org/prop/reference/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>

start = @<wikidata_item>

<wikidata_item> {
  p:P1748 {
    ps:P1748 LITERAL ;
    prov:wasDerivedFrom @<reference>
  }+
}

<reference> {
  pr:P248  IRI ;
  pr:P813  xsd:dateTime ;
  pr:P699  LITERAL
}
`;

wikidataItem.cats = `
Endpoint: https://query.wikidata.org/bigdata/namespace/wdq/sparql

Query: SELECT ?item ?itemLabel
WHERE
{ ?item wdt:P279* wd:Q12078 .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
} LIMIT 10
`;

proteinRecord = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ex1: <http://ex1.example/>
PREFIX ex2: <http://ex2.example/>

LABEL [ rdfs:label skos:label ]
<S> {
  ex1:\`protein name\` LITERAL;
  ex2:\`protein type\` [ \`signaling\` \`regulatory\` \`transport\` ];
  \`protein width\` \`ucum microns\`
}`;
proteinRecord_meta = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX ex1: <http://ex1.example/>
PREFIX ex2: <http://ex2.example/>
PREFIX foo: <http://foo.example/>

foo:otherProtName rdfs:label "protein name" .
ex1:protName rdfs:label "protein name" .
ex1:protType skos:label "protein type" .
ex2:protName rdfs:label "protein name" .
ex2:protType skos:label "protein type" .
ex1:Signaling rdfs:label "signaling" .
ex1:Regulatory skos:label "regulatory" .
ex1:Transport rdfs:label "transport" ; skos:label "transport" .
ex1:protWidth rdfs:label "protein width" ; skos:label "protein width" .
ex1:microns rdfs:label "ucum microns" .
`;
proteinRecord_good = `PREFIX ex1: <http://ex1.example/>
PREFIX ex2: <http://ex2.example/>

<s>
  ex1:protName "Dracula" ;
  ex2:protType ex1:Regulatory ;
  ex1:protWidth "30"^^ex1:microns .
`;
proteinRecord_badLabel = `PREFIX ex: <http://a.example/>

<s>
  ex:protName999 "Dracula" ;
  ex:protType ex:Regulatory ;
  ex:protWidth "30"^^ex:microns .
`;
proteinRecord_badDatatype = `PREFIX ex: <http://a.example/>

<s>
  ex:protName "Dracula" ;
  ex:protType ex:Regulatory ;
  ex:protWidth "30"^^ex:microns999 .
`;

  return {
    "clinical observation": {
      schema: clinicalObs.schema,
      passes: {
        "with birthdate": {
          data: clinicalObs.with_birthdate,
          queryMap: "{FOCUS :status _}@- start -,\n<http://a.example/Patient2>@<http://a.example/ObservationShape>"},
        "without birthdate": {
          data: clinicalObs.without_birthdate,
          queryMap: "<http://a.example/Obs1>@- start -"},
        "no subject name": {
          data: clinicalObs.no_subject_name,
          queryMap: "<http://a.example/Obs1>@- start -"}
      },
      fails: {
        "bad status": {
          data: clinicalObs.bad_status,
          queryMap: "<http://a.example/Obs1>@- start -"},
        "no subject": {
          data: clinicalObs.no_subject,
          queryMap: "<http://a.example/Obs1>@- start -"},
        "wrong birthdate datatype": {
          data: clinicalObs.birthdate_datatype,
          queryMap: "<http://a.example/Obs1>@- start -"}
      }
    },
    "Each Wikidata item on Cancer should have a NCI Thesaurus ID": {
      schema: wikidataItem.schema,
      passes: {
        "Get all Wikidata items on Cancers (SPARQL)": {
          data: wikidataItem.cats,
          queryMap: "- click to resolve -@- start -"}
      },
      fails: {
      }
    },
    "protein record": {
      schema: proteinRecord,
      meta: proteinRecord_meta,
      passes: {
        "good": {
          data: proteinRecord_good,
          queryMap: "<http://a.example/s>@<http://a.example/S>"}
      },
      fails: {
        "bad label": {
          data: proteinRecord_badLabel,
          queryMap: "<http://a.example/s>@<http://a.example/S>"},
        "bad datatype": {
          data: proteinRecord_badDatatype,
          queryMap: "<http://a.example/s>@<http://a.example/S>"}
      }
    }
  };
})();
