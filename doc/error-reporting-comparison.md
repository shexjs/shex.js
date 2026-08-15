# main and error-repair, side by side

The same three failing validations, rendered by each branch.  Produced by
`doc/error-reporting-comparison.js`; run it on either branch to reproduce a
column.  Structures are trimmed of `shapeExpr`, `valueExpr`, `constraint`
and `solution` so the shape of the *report* is visible; IRIs are shortened.

## a choice, half taken, with a bad value

### What a reader sees

**main**

```
validating :x as :S:
    validating "old":
      NodeConstraintError: expected to have datatype xsd:integer
  AND
    Missing property: :mbox
  AND
    Triple :x :givenName "Bob" fits no triple constraint: either add :familyName, or remove it.
  to conform: add 1 :familyName and add 1 :mbox
```

**error-repair**

```
validating :x as :S:
  to conform: add 1 :familyName and add 1 :mbox
    "old" doesn't satisfy <:age> xsd:integer?:
      has type xsd:string, not xsd:integer
  AND
    missing property <:mbox>
  AND
    triple <:givenName> "Bob" fits no triple constraint: either add :familyName, or remove it
```

### The structure

**main**

```json
{
 "type": "Failure",
 "node": ":x",
 "shape": ":S",
 "errors": [
  {
   "type": "TypeMismatch",
   "triple": {
    "type": "TestedTriple",
    "subject": ":x",
    "predicate": ":age",
    "object": {
     "value": "old"
    }
   },
   "errors": {
    "type": "NodeConstraintViolation",
    "node": {
     "value": "old"
    },
    "shape": ":S",
    "errors": [
     "Error validating \"old\" as {\"type\":\"NodeConstraint\",\"datatype\":\"xsd:integer\"}: mismatched datatype: xsd:string !== xsd:integer"
    ]
   }
  },
  {
   "type": "MissingProperty",
   "property": ":mbox"
  },
  {
   "type": "FeasibilityViolation",
   "triple": {
    "type": "TestedTriple",
    "subject": ":x",
    "predicate": ":givenName",
    "object": {
     "value": "Bob"
    }
   },
   "constraints": [
    {
     "type": "TripleConstraint",
     "predicate": ":givenName"
    }
   ],
   "repairs": [
    {
     "type": "AddArcs",
     "arcs": [
      {
       "property": ":familyName"
      }
     ]
    }
   ]
  }
 ],
 "repairs": [
  {
   "type": "NearestBag",
   "cost": 2,
   "arcs": [
    {
     "property": ":familyName",
     "delta": 1
    },
    {
     "property": ":mbox",
     "delta": 1
    }
   ]
  }
 ]
}
```

**error-repair**

```json
{
 "type": "Failure",
 "node": ":x",
 "shape": ":S",
 "errors": [
  {
   "type": "TypeMismatch",
   "triple": {
    "type": "TestedTriple",
    "subject": ":x",
    "predicate": ":age",
    "object": {
     "value": "old"
    }
   },
   "errors": {
    "type": "NodeConstraintViolation",
    "node": {
     "value": "old"
    },
    "shape": ":S",
    "errors": [
     {
      "type": "DatatypeMismatch",
      "expected": "xsd:integer",
      "actual": "xsd:string",
      "message": "mismatched datatype: xsd:string !== xsd:integer"
     }
    ]
   }
  },
  {
   "type": "MissingProperty",
   "property": ":mbox"
  },
  {
   "type": "FeasibilityViolation",
   "triple": {
    "type": "TestedTriple",
    "subject": ":x",
    "predicate": ":givenName",
    "object": {
     "value": "Bob"
    }
   },
   "constraints": [
    {
     "type": "TripleConstraint",
     "predicate": ":givenName"
    }
   ],
   "repairs": [
    {
     "type": "AddArcs",
     "arcs": [
      {
       "property": ":familyName"
      }
     ]
    }
   ]
  }
 ],
 "repairs": [
  {
   "type": "NearestBag",
   "cost": 2,
   "arcs": [
    {
     "property": ":familyName",
     "delta": 1
    },
    {
     "property": ":mbox",
     "delta": 1
    }
   ]
  }
 ]
}
```

## a choice, neither side taken

### What a reader sees

**main**

```
validating :x as :S:
    Missing property: :a
  AND
    Missing property: :b
  to conform: add 1 :a, or add 1 :b
```

**error-repair**

```
validating :x as :S:
  to conform: add 1 :a, or add 1 :b
        missing property <:a>
    OR
        missing property <:b>
```

### The structure

**main**

```json
{
 "type": "Failure",
 "node": ":x",
 "shape": ":S",
 "errors": [
  [
   {
    "type": "MissingProperty",
    "property": ":a"
   }
  ],
  [
   {
    "type": "MissingProperty",
    "property": ":b"
   }
  ]
 ],
 "repairs": [
  {
   "type": "NearestBag",
   "cost": 1,
   "arcs": [
    {
     "property": ":a",
     "delta": 1
    }
   ]
  },
  {
   "type": "NearestBag",
   "cost": 1,
   "arcs": [
    {
     "property": ":b",
     "delta": 1
    }
   ]
  }
 ]
}
```

**error-repair**

```json
{
 "type": "Failure",
 "node": ":x",
 "shape": ":S",
 "errors": [
  {
   "type": "Alternatives",
   "errors": [
    {
     "type": "AllOf",
     "errors": [
      {
       "type": "MissingProperty",
       "property": ":a"
      }
     ]
    },
    {
     "type": "AllOf",
     "errors": [
      {
       "type": "MissingProperty",
       "property": ":b"
      }
     ]
    }
   ]
  }
 ],
 "repairs": [
  {
   "type": "NearestBag",
   "cost": 1,
   "arcs": [
    {
     "property": ":a",
     "delta": 1
    }
   ]
  },
  {
   "type": "NearestBag",
   "cost": 1,
   "arcs": [
    {
     "property": ":b",
     "delta": 1
    }
   ]
  }
 ]
}
```

## a contingent group: :system wants a :code

### What a reader sees

**main**

```
validating :x as :S:
    Missing property: :value
  AND
    Triple :x :system http://u.example/ fits no triple constraint: either add :code, or remove it.
  to conform: add 1 :value and remove 1 :system, or add 1 :value and add 1 :code
```

**error-repair**

```
validating :x as :S:
  to conform: add 1 :value and remove 1 :system, or add 1 :value and add 1 :code
    missing property <:value>
  AND
    triple <:system> <http://u.example/> fits no triple constraint: either add :code, or remove it
```
