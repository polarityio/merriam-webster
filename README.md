# merriam-webster

Currently a work in progress

V1 TODO
========
- Filter response body to only objects where "meta.id" contains our word with no spaces
  - Possible to have "polarity:1" and "polarity:2" (homographs) <-- we want these
  - Also possible to have "polarity therapy" (related words) <-- we don't want these
- Populate summary card with number of occurances
- For each homograph, populate the details card with
  - Word (entity.value)
  - Type ('fl')
  - Definition ('shortdef')
  - syllables ('hwi.hw')
  - Link to Merriam-Webster

ENHANCEMENTS
============
- Pronounciations
- Sound-clip if available
- Multiple definitions
- Date