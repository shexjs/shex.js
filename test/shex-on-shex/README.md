# Shapes For Clinical Decision Support

Given a [manifest](shex-on-shex/manifest.json) with
* a **[subscription schema](shex-on-shex/manifest.json#L4)** ([file](neonatology-subscription.shex)) and
* a set of **[service descriptions](shex-on-shex/manifest.json#L6-L35)**:
  * **patient** ([file](shex-on-shex/patientDB.shex)) Patiet record
  * **neonate** ([file](shex-on-shex/neonateDB.shex)) Additional info from neonatology database
  * **allergies** ([file](shex-on-shex/allergies.shex))
  * **diagnoses** ([file](shex-on-shex/diagnoses.shex))
  * **labs** ([file](labs.shex))
  * **medication exposures** ([file](shex-on-shex/medication-administrations.shex))

algorithm:
1. [walk](shex-on-shex-test.js#L93) the subscribed shapes.
* 1. [get any service shapes](shex-on-shex-test.js#L326) which included satisfied the subscription shape. This used two strategies:
* * * **WHOLE_SHAPES** - only accept service shapes that could satisfy that entire subscription shape
* * * **!WHOLE_SHAPES** - accept any service with any matching predicate.
2. create a [cartesian product](shex-on-shex-test.js#L107) of all the ways matching services could be combined.
3. [simulate a database](=shex-on-shex-test.js#L131-L135) with that combination of shapes.
4. [announce solutions](shex-on-shex-test.js#L171-L172)
