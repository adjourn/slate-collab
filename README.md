# Slate Collab Example

Basic collaborative Slate rich text editor example. This includes both client and Node back-end.

Everything important is commented and it's quite compact, most of it is libraries' boilerplate.

Initial value is currently fetched via HTTP (`http://localhost8080/<editor-id>`).
Operations are exchanged via WebSocket connection (`ws://localhost:8081/<editor-id>/<user-id>`). Value is currently **not** mutated in back-end.

#### Current features:

* Basic editing functionality (text, marks, undo, etc)
* Connect/disconnect events (not shown in UI at the moment)

#### Features I might add:

* Refactor whole thing, I wrote this very quickly
* Connected users list
* Debounce operations
* Other users' selection/caret
* More complex entities like inline and void
* Mutate `value` in back-end (i.e up-to-date `value` for new connections)
* Make a backup of `value` after every X operations
* Ordered log of operations (enables time travel and other cool stuff?)
* ...


**This is still WIP.**

### Getting Started

```
yarn
yarn server (first terminal/tab)
yarn client (second terminal/tab)
```

Open multiple browser tabs at `http://localhost/<any-string>` and start editing. Note that `<any-string>` should be the same because users/subscribers are group based on that (editor id). You can think of this as a topic.


I haven't tested this with `npm` but it should work just fine.
