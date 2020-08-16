** Bug watcher: PowerCoder(Poseidon) **

# ```Unresolved bugs:```
#### Errors are too ambigious (important) **In progress**
#### We can't have function declarations that are multiline (important) **In progress by Poseidon**

# ```Resolved bugs:```
> #### ~~Functions RegEx error:~~ **Fixed by Poseidon**
```set name = aFunc()``` the scanerless parser will detect a function instead of a variable

> #### ~~Variables Don't Work~~ **schedueled**
Variables Return Null And Have No Value We Need A Way To Check If Something Is Variable & Return Variable Value.
Response: that is the interpreters duty

> #### ~~Is Number Does Not Work~~ **Fixed By Matthew**
```/\d+/``` does not check if string is number, only gets the part which IS number. Fixed with isNaN

> #### ~~With our current method we can't do stuff like this (important)~~ **Fixed By Matthew**:
```set name = "test" + "test2"```
We can't really have multiple tokens with the current ```if else``` method we're using
