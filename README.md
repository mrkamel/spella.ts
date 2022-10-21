# Spella

Multi-language, Multi word, utf-8 spelling correction server for e.g. search
engines using a levenshtein automaton and a Trie. Written in typescript.

* Is capable of splitting words, joining words, correcting phrases, etc 
* Calculates distances according to damerau-levenshtein and scores multi
  character transliterations (german umlauts) with a distance of one.
* Applies a max edit distance per word.
* Uses several optimizations like re-using trie nodes when correcting
  phrases to achieve single digit millisecond response times most of the 
  time.
* Applies multiple rules for choosing the best correction, including a
  user supplied score.

# Build

You need to install node (>= 14) and yarn and run:

```
yarn install
```

Afterwards you can build it via:

```
yarn build
```

# Start

Please run `yarn serve --help` to get an overview of available command line
options. To start the server, which listens on port 8080 by default, run:

```
yarn serve --files /path/to/*.dic
```

The `.dic` files are user-supplied tab separated text files:

```
en  some phrase  3942
en  keyword  3491
...
```

containing three columns per line. First column is an arbitrary language
identifier, the second column is the keyword or phrase and the third column is
a frequency or score value. If there are multiple matches with the same
distance, the one with a higher score wins. Correction is done greedily, i.e.
phrases are generally preferred.

Please note, spella lowercases the phrases from the dictionary but does not
normalize them in any other way, as there is hardly any normalization that fits
every possible use case. Therefore, you better normalize the phrases in the
dictionary files yourself beforehand according to your needs.

## Requests

The server listens on port 8080 and uses a simple JSON based protocol.

Request:

```
curl -X GET http://127.0.0.1:8080/corrections?language=en&text=some+phrse
```

Response:

```json
{
  "text": "some phrase",
  "distance": 1,
  "took": 6
}
```

where `distance` is the damerau levenshtein distance value and `took` tells you
how long the response took.

## Choosing Corrections

The criteria for choosing the best correction are:

1. the number of words (higher is better)
2. distance (smaller is better)
3. whether or not a correction matches the original when transliterated
4. the user supplied score (higher is better)

## Max Edit Distance

Currently, the default max allowed edit distances are:

* token length < 4 characters: won't be corrected
* token length < 9 characters: a maximum edit distance of 1 is used
* else: a maximum edit distance of 2 is used

You can change those using the `--distances` command line option and pass a
comma separated list of string lenghts. For instance, `--distance 3,6,9` means

* token length < 3 characters: won't be corrected
* token length < 6 characters: a maximum edit distance of 1 is used
* token length < 9 characters: a maximum edit distance of 2 is used
* else a maximum edit distance of 3 is used

It is strongly recommended to have an overall maximum edit distance of 2 for
performance reasons.

## Limitations

Spella currently does not split words if the resulting phrase is not present in
any dictionary file. For instance, the query "tabletennis", will only be
corrected to "table tennis" if a dictionary file contains "table tennis". It is
not enough to have "table" and "tennis" individually present in dictionary
files. This was decided because the respective corrections can be low quality
due to missing context.
