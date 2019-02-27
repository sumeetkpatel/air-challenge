

# air-challenge

A typical programming challenge given to developers involving a back-end and front-end to track flight and weather conditions.

See [Installation Guide](/INSTALLATION.md) for setup/configuration.

## Screenshot
![Screenshot](/screenshot.png "Screenshot")

## Challenge requirements
```text
What we'd like to see is a node express REST API that:

1. Provides a current weather feed based on input lat, lng

Stores the weather in a local database
Allows for the retrieval of historical data

2. Provides the location of aircraft within 100kms of input lat, lng

Store aircraft data in a database
Allow for the retrieval of historical data

3. Display aircraft location and weather information on a webpage
4. Bonus: Given an input of an aircraft, calculate the distance travelled based on historical data captured.

Please add this to your git account and let us know the details.

Time allowed: 24hrs
```

## FAQ
#### Mixed usage of local database, define local database and any differences expected.
I used PostgreSQL permanent db's for both. Seems to work well.

#### Are lat, lng entered in decimal format?
I opted to just use a map as input and enter the lat/lng via center of the map.

#### How is a store triggered?
Assumed only by look ups due to the way the brief was written. "Historical" would mean any previous lookup in my interpretation.

#### Three is a bit vague. It could be merely a tabular view of historical data, or a UI to view 'current' conditions.
Yes too vague, I went with map view since its more fun and helpful for user and dev and show it for any aircraft displayed which I think is nicer UX.

#### Should be the webpage be pre-rendered or load data async?
Desired behavior is unclear, so react was used and is loaded async as necessary.

#### API throttling?
Not super necessary, but should be considered for production worthiness.

## Feedback
Some context to the challenge could help think about the problem. ie, we have to comply with drone flight restrictions near aircraft's currently passing by, and we don't wanna go out in the rain/snow or other weather. Hence the need for such a system.

To do a good job and feel satisfied I think more time is needed, or perhaps more specific instructions to save time, unless that is part of the challenge to not be well completed.

Should probably be private github or something so the challenge cant be copied.
