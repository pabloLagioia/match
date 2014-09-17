Match
=====

Match, Javascript Game Engine

This branch is used for development so it might be unstable in some cases. We do our best in providing backwards
compatibility but we are not perfect so don't update Match version until you have fully tested it.

## How do I use it?
Match uses a paradigm called Behaviour Attribute Entity (BEA).

### Attributes
Attributes are dumb objects that store values, ie. speed, position, direction, etc.

### Behaviours
Behaviours read the attributes and perform changes on them, for example, a behaviour called move would change the x and y values of the location attribute.

### Views/Displays
Views or displays are objects that can be rendered such as Rectangle, Circle, Sprite, Text or BitmapText

### Entities
An entity is gathers attributes, behaviours and displays. This will be your final game object.
The main idea here is that you add and remove behaviours to an entity in order to modify the way it behaves. For example if you had a
behaviour called "takeDamage" which reduced health each time the object gets hit, to make the object invulnerable you just remove
the "takeDamage" behaviour

## How does it work?
*Complete*

## Match Service
To get Matchjs concatenated you can download [match-service](https://bitbucket.org/puzzlingideas/match-service). Place at the same directory level as this project and run node app.js.
On your index.html link the src="http://localhost:8086/match/merged".
The changes you do to Matchjs source will be reflected on the game code after pressing F5