# Tubes

**Goal**: Stream sensor data to robots for art.

Also:

* Be simple
* Be robust
* Be pretty

## How? Functional Reactive Programming

What is that?

* _Functional_: using higher order functions like `map`, `filter`, and `reduce`.
* _Reactive_: work only happens in response to events, like obtaining a new sensor value.
* _Programming_: arbitrarily transform your data as it travels down the tubes.

## Inspiration

Mainly the functional front-end programming language [Elm](http://elm-lang.org), and in particular
its creator's thesis on [Concurrent FRP](elm-lang.org/papers/concurrent-frp.pdf)(warning: PDF).
